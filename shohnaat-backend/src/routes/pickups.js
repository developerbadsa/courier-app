const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/v1/pickups — List pickups (merchant sees own, admin sees all)
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, status, merchantId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Merchant only sees their own pickups
    const userMerchantId = req.user.merchantId;
    const filterMerchantId = userMerchantId || merchantId;

    const where = {
      ...(filterMerchantId && { merchantId: filterMerchantId }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            requestedDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              businessName: true,
              user: { select: { name: true, phone: true } },
            },
          },
          pickupAddress: {
            select: { id: true, line1: true, area: true, city: true, label: true },
          },
          _count: { select: { shipments: true, assignments: true } },
          assignments: {
            include: {
              rider: {
                include: { user: { select: { name: true, phone: true } } },
              },
            },
            orderBy: { assignedAt: 'desc' },
            take: 1,
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pickupRequest.count({ where }),
    ]);

    // Summary counts
    const summary = await prisma.pickupRequest.groupBy({
      by: ['status'],
      where: filterMerchantId ? { merchantId: filterMerchantId } : {},
      _count: true,
    });

    res.json({
      success: true,
      data: pickups,
      summary: summary.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/pickups/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const pickup = await prisma.pickupRequest.findUnique({
      where: { id: req.params.id },
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        pickupAddress: true,
        assignments: {
          include: {
            rider: {
              include: { user: { select: { name: true, phone: true } } },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
        shipments: {
          select: { id: true, trackingNumber: true, currentStatus: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    res.json({ success: true, data: pickup });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/pickups — Create pickup request
router.post('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const {
      pickupAddressId,
      requestedDate,
      timeSlot,
      parcelCount,
      vehicleType,
      driverNotes,
    } = req.body;

    const merchantId = req.user.merchantId || req.body.merchantId;

    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    if (!pickupAddressId) {
      return res.status(400).json({ success: false, message: 'pickupAddressId is required' });
    }

    // Validate address belongs to merchant
    const address = await prisma.address.findFirst({
      where: { id: pickupAddressId, merchantId, deletedAt: null },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found for this merchant' });
    }

    // Store timeSlot and vehicleType in the request (using existing fields)
    // timeSlot: 'MORNING' | 'AFTERNOON'
    // vehicleType: 'BIKE' | 'VAN' | 'TRUCK'
    const pickup = await prisma.pickupRequest.create({
      data: {
        merchantId,
        pickupAddressId,
        requestedDate: new Date(requestedDate),
        parcelCount: parseInt(parcelCount) || 1,
        status: 'PENDING',
      },
      include: {
        pickupAddress: {
          select: { id: true, line1: true, area: true, city: true, label: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...pickup,
        timeSlot: timeSlot || 'MORNING',
        vehicleType: vehicleType || 'VAN',
        driverNotes: driverNotes || '',
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/pickups/:id/approve — Approve pickup (admin/operator)
router.patch('/:id/approve', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const pickup = await prisma.pickupRequest.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
    });
    res.json({ success: true, data: pickup });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/pickups/:id/reject — Reject pickup (admin/operator)
router.patch('/:id/reject', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { reason } = req.body;
    const pickup = await prisma.pickupRequest.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });
    res.json({ success: true, data: pickup });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/pickups/:id/cancel — Cancel pickup (merchant)
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const pickup = await prisma.pickupRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    // Only allow cancel if still PENDING or APPROVED
    if (!['PENDING', 'APPROVED'].includes(pickup.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel pickup in ${pickup.status} status`,
      });
    }

    const updated = await prisma.pickupRequest.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
