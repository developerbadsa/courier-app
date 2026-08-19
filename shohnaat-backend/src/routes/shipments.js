const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

// Status state machine - valid transitions
const VALID_TRANSITIONS = {
  PENDING: ['PICKUP_ASSIGNED', 'CANCELLED'],
  PICKUP_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['AT_HUB', 'IN_TRANSIT', 'FAILED'],
  AT_HUB: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  IN_TRANSIT: ['AT_HUB', 'OUT_FOR_DELIVERY', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'RESCHEDULED'],
  DELIVERED: [],
  FAILED: ['RESCHEDULED', 'RETURN_INITIATED', 'PICKUP_ASSIGNED'],
  RESCHEDULED: ['PICKUP_ASSIGNED', 'CANCELLED'],
  CANCELLED: [],
  RETURN_INITIATED: ['RETURNED'],
  RETURNED: []
};

// Generate tracking number
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SH-${timestamp}${random}`;
};

router.use(auth);

// GET /api/v1/shipments
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, status, merchantId, trackingNumber } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(status && { currentStatus: status }),
      ...(merchantId && { merchantId }),
      ...(trackingNumber && { trackingNumber })
    };

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          merchant: { select: { businessName: true } },
          consignee: true,
          currentBranch: { select: { name: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shipment.count({ where })
    ]);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shipments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        merchant: { select: { businessName: true } },
        consignee: true,
        pickupAddress: true,
        deliveryAddress: true,
        currentBranch: { select: { name: true } },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        riderAssignments: {
          include: {
            rider: {
              include: { user: { select: { name: true, phone: true } } }
            }
          },
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shipments/track/:trackingNumber (public)
router.get('/track/:trackingNumber', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { trackingNumber } = req.params;

    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        riderAssignments: {
          include: {
            rider: {
              include: { user: { select: { name: true } } }
            }
          },
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        currentStatus: shipment.currentStatus,
        pickupAddress: shipment.pickupAddress,
        deliveryAddress: shipment.deliveryAddress,
        statusHistory: shipment.statusHistory,
        rider: shipment.riderAssignments[0]?.rider?.user?.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/shipments
router.post('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const {
      merchantId,
      consigneeName,
      consigneePhone,
      consigneeAltPhone,
      pickupAddressId,
      deliveryAddressId,
      weightKg,
      paymentType,
      codAmount
    } = req.body;

    // Create or find consignee
    let consignee = await prisma.consignee.findFirst({
      where: { phone: consigneePhone }
    });

    if (!consignee) {
      consignee = await prisma.consignee.create({
        data: {
          name: consigneeName,
          phone: consigneePhone,
          altPhone: consigneeAltPhone
        }
      });
    }

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: generateTrackingNumber(),
        merchantId,
        consigneeId: consignee.id,
        pickupAddressId,
        deliveryAddressId,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        paymentType: paymentType || 'COD',
        codAmount: codAmount ? parseFloat(codAmount) : 0,
        currentStatus: 'PENDING'
      },
      include: {
        merchant: { select: { businessName: true } },
        consignee: true
      }
    });

    // Create initial status history
    await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId: shipment.id,
        status: 'PENDING',
        note: 'Shipment created'
      }
    });

    res.status(201).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/shipments/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { status, note, reasonCode } = req.body;

    // Get current shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id }
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Validate transition
    const validNextStatuses = VALID_TRANSITIONS[shipment.currentStatus];
    if (!validNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${shipment.currentStatus} to ${status}`
      });
    }

    // Update status in transaction
    const updated = await prisma.$transaction([
      prisma.shipment.update({
        where: { id },
        data: {
          currentStatus: status,
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'PICKED_UP' && { pickedUpAt: new Date() }),
          ...(status === 'FAILED' && { deliveryAttempts: { increment: 1 } })
        }
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId: id,
          status,
          note,
          reasonCode,
          actorUserId: req.user.id
        }
      })
    ]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
