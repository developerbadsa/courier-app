const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');
const { createAuditLog } = require('./auditLogs');
const { notifyShipmentStatus } = require('../services/notificationService');
const { delByPattern } = require('../lib/cache');


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

// Failed delivery reason codes
const FAILED_REASONS = [
  'CONSIGNEE_UNREACHABLE',
  'ADDRESS_NOT_FOUND',
  'CUSTOMER_REFUSED',
  'RESCHEDULE_REQUESTED',
  'DAMAGED_IN_TRANSIT',
  'WRONG_ADDRESS',
  'NO_ONE_HOME',
];

// Generate tracking number
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SH-${timestamp}${random}`;
};

router.use(auth);

// GET /api/v1/shipments — Advanced search with filters
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const {
      page = 1,
      limit = 20,
      status,
      merchantId,
      trackingNumber,
      paymentType,
      search,
      startDate,
      endDate,
      minWeight,
      maxWeight,
      minCod,
      maxCod,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(status && { currentStatus: status }),
      ...(merchantId && { merchantId }),
      ...(trackingNumber && { trackingNumber }),
      ...(paymentType && { paymentType }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
      ...(minWeight || maxWeight
        ? {
            weightKg: {
              ...(minWeight && { gte: parseFloat(minWeight) }),
              ...(maxWeight && { lte: parseFloat(maxWeight) }),
            },
          }
        : {}),
      ...(minCod || maxCod
        ? {
            codAmount: {
              ...(minCod && { gte: parseFloat(minCod) }),
              ...(maxCod && { lte: parseFloat(maxCod) }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { trackingNumber: { contains: search, mode: 'insensitive' } },
          { consignee: { name: { contains: search, mode: 'insensitive' } } },
          { consignee: { phone: { contains: search } } },
        ],
      }),
    };

    const validSort = ['createdAt', 'currentStatus', 'codAmount', 'weightKg', 'deliveredAt'];
    const orderBy = validSort.includes(sortBy)
      ? { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          merchant: { select: { businessName: true } },
          consignee: true,
          currentBranch: { select: { name: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy,
      }),
      prisma.shipment.count({ where }),
    ]);

    // Summary stats
    const stats = await prisma.shipment.aggregate({
      where: { deletedAt: null, ...((merchantId && { merchantId }) || {}) },
      _count: true,
      _sum: { codAmount: true, deliveryCharge: true },
    });

    res.json({
      success: true,
      data: shipments,
      summary: {
        totalShipments: stats._count,
        totalCod: stats._sum.codAmount || 0,
        totalCharges: stats._sum.deliveryCharge || 0,
      },
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

// GET /api/v1/shipments/stats — Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { merchantId } = req.query;

    const where = { deletedAt: null, ...(merchantId && { merchantId }) };

    const [totalShipments, pending, inTransit, delivered, failed, codSum] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.count({ where: { ...where, currentStatus: 'PENDING' } }),
      prisma.shipment.count({ where: { ...where, currentStatus: { in: ['IN_TRANSIT', 'AT_HUB', 'OUT_FOR_DELIVERY'] } } }),
      prisma.shipment.count({ where: { ...where, currentStatus: 'DELIVERED' } }),
      prisma.shipment.count({ where: { ...where, currentStatus: 'FAILED' } }),
      prisma.shipment.aggregate({ where: { ...where, currentStatus: 'DELIVERED' }, _sum: { codAmount: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalShipments,
        pending,
        inTransit,
        delivered,
        failed,
        codCollected: codSum._sum.codAmount || 0,
        deliveryRate: totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 0,
      },
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
          orderBy: { createdAt: 'desc' },
        },
        riderAssignments: {
          include: {
            rider: {
              include: { user: { select: { name: true, phone: true } } },
            },
          },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({ success: true, data: shipment });
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
        statusHistory: { orderBy: { createdAt: 'desc' } },
        riderAssignments: {
          include: {
            rider: {
              include: { user: { select: { name: true } } },
            },
          },
          orderBy: { assignedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        currentStatus: shipment.currentStatus,
        pickupAddress: shipment.pickupAddressSnap || shipment.pickupAddress,
        deliveryAddress: shipment.deliveryAddressSnap || shipment.deliveryAddress,
        statusHistory: shipment.statusHistory,
        rider: shipment.riderAssignments[0]?.rider?.user?.name,
        estimatedDelivery: shipment.deliveredAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/shipments — Create single shipment
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
      pickupAddressSnap,
      deliveryAddressSnap,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      paymentType,
      codAmount,
      deliveryCharge,
      serviceType,
    } = req.body;

    // Resolve merchant
    let effectiveMerchantId = merchantId || req.user.merchantId;
    if (!effectiveMerchantId && req.user.id) {
      let merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
      if (!merchant) {
        merchant = await prisma.merchant.create({
          data: {
            userId: req.user.id,
            businessName: req.user.name || 'Merchant Store',
          },
        });
      }
      effectiveMerchantId = merchant.id;
    }

    // Resolve or create default addresses if IDs not provided
    let effectivePickupAddressId = pickupAddressId;
    let effectiveDeliveryAddressId = deliveryAddressId;

    if (!effectivePickupAddressId && effectiveMerchantId) {
      let defaultPickup = await prisma.address.findFirst({
        where: { merchantId: effectiveMerchantId, type: 'PICKUP' },
      });
      if (!defaultPickup) {
        defaultPickup = await prisma.address.create({
          data: {
            merchantId: effectiveMerchantId,
            type: 'PICKUP',
            label: 'Default Warehouse',
            line1: pickupAddressSnap?.street || '100 Logistics Blvd',
            city: pickupAddressSnap?.city || 'Austin',
          },
        });
      }
      effectivePickupAddressId = defaultPickup.id;
    }

    if (!effectiveDeliveryAddressId && effectiveMerchantId) {
      let defaultDelivery = await prisma.address.findFirst({
        where: { merchantId: effectiveMerchantId, type: 'DELIVERY' },
      });
      if (!defaultDelivery) {
        defaultDelivery = await prisma.address.create({
          data: {
            merchantId: effectiveMerchantId,
            type: 'DELIVERY',
            label: 'Customer Destination',
            line1: deliveryAddressSnap?.street || '200 Delivery St',
            city: deliveryAddressSnap?.city || 'Miami',
          },
        });
      }
      effectiveDeliveryAddressId = defaultDelivery.id;
    }

    // Create or find consignee
    let consignee = await prisma.consignee.findFirst({
      where: { phone: consigneePhone },
    });

    if (!consignee) {
      consignee = await prisma.consignee.create({
        data: {
          name: consigneeName,
          phone: consigneePhone,
          altPhone: consigneeAltPhone,
        },
      });
    }

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: generateTrackingNumber(),
        merchantId: effectiveMerchantId,
        consigneeId: consignee.id,
        pickupAddressId: effectivePickupAddressId,
        deliveryAddressId: effectiveDeliveryAddressId,
        pickupAddressSnap: pickupAddressSnap || undefined,
        deliveryAddressSnap: deliveryAddressSnap || undefined,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        paymentType: paymentType || 'COD',
        codAmount: codAmount ? parseFloat(codAmount) : 0,

        deliveryCharge: deliveryCharge ? parseFloat(deliveryCharge) : 0,
        chargeSnapshot: {
          weightKg: weightKg ? parseFloat(weightKg) : null,
          lengthCm,
          widthCm,
          heightCm,
          serviceType: serviceType || 'STANDARD',
        },
        currentStatus: 'PENDING',
      },
      include: {
        merchant: { select: { businessName: true } },
        consignee: true,
      },
    });

    // Create initial status history
    await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId: shipment.id,
        status: 'PENDING',
        note: 'Shipment created',
        actorUserId: req.user.id,
      },
    });

    // Audit log
    await createAuditLog(prisma, {
      actorId: req.user.id,
      action: 'SHIPMENT_CREATED',
      entityType: 'Shipment',
      entityId: shipment.id,
      diff: { trackingNumber: shipment.trackingNumber, codAmount },
      req,
    });

    // Fire notification
    try {
      await notifyShipmentStatus(prisma, 'shipment_booked', shipment, {});
    } catch (notifErr) {
      // Non-blocking
    }

    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/shipments/bulk — Bulk CSV upload (max 500)
router.post('/bulk', auth, requireRole('super_admin', 'merchant'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipments: bulkData, merchantId } = req.body;

    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      return res.status(400).json({ success: false, message: 'shipments array is required' });
    }

    if (bulkData.length > 500) {
      return res.status(400).json({ success: false, message: 'Maximum 500 shipments per batch' });
    }

    const results = { created: 0, errors: [] };

    for (let i = 0; i < bulkData.length; i++) {
      const item = bulkData[i];
      try {
        // Validate required fields
        if (!item.consigneeName || !item.consigneePhone) {
          results.errors.push({ row: i + 1, error: 'Missing consigneeName or consigneePhone' });
          continue;
        }

        // Find or create consignee
        let consignee = await prisma.consignee.findFirst({
          where: { phone: item.consigneePhone },
        });
        if (!consignee) {
          consignee = await prisma.consignee.create({
            data: { name: item.consigneeName, phone: item.consigneePhone },
          });
        }

        const shipment = await prisma.shipment.create({
          data: {
            trackingNumber: generateTrackingNumber(),
            merchantId: merchantId || req.user.merchantId,
            consigneeId: consignee.id,
            pickupAddressId: item.pickupAddressId || '',
            deliveryAddressId: item.deliveryAddressId || '',
            weightKg: item.weightKg ? parseFloat(item.weightKg) : null,
            paymentType: item.paymentType || 'COD',
            codAmount: item.codAmount ? parseFloat(item.codAmount) : 0,
            deliveryCharge: item.deliveryCharge ? parseFloat(item.deliveryCharge) : 0,
            currentStatus: 'PENDING',
          },
        });

        await prisma.shipmentStatusHistory.create({
          data: {
            shipmentId: shipment.id,
            status: 'PENDING',
            note: 'Bulk shipment created',
            actorUserId: req.user.id,
          },
        });

        results.created++;
      } catch (err) {
        results.errors.push({ row: i + 1, error: err.message });
      }
    }

    await createAuditLog(prisma, {
      actorId: req.user.id,
      action: 'SHIPMENT_BULK_CREATED',
      entityType: 'Shipment',
      entityId: 'bulk',
      diff: { count: results.created, errors: results.errors.length },
      req,
    });

    res.status(201).json({
      success: true,
      data: results,
      message: `${results.created} shipments created, ${results.errors.length} errors`,
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

    const shipment = await prisma.shipment.findUnique({ where: { id } });

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    // Validate transition
    const validNextStatuses = VALID_TRANSITIONS[shipment.currentStatus];
    if (!validNextStatuses.includes(status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot transition from ${shipment.currentStatus} to ${status}`,
      });
    }

    // Validate reason code for FAILED
    if (status === 'FAILED' && reasonCode && !FAILED_REASONS.includes(reasonCode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason code. Allowed: ${FAILED_REASONS.join(', ')}`,
      });
    }

    const updated = await prisma.$transaction([
      prisma.shipment.update({
        where: { id },
        data: {
          currentStatus: status,
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'PICKED_UP' && { pickedUpAt: new Date() }),
          ...(status === 'FAILED' && { deliveryAttempts: { increment: 1 } }),
        },
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId: id,
          status,
          note,
          reasonCode,
          actorUserId: req.user.id,
        },
      }),
    ]);

    await createAuditLog(prisma, {
      actorId: req.user.id,
      action: `STATUS_${status}`,
      entityType: 'Shipment',
      entityId: id,
      diff: { from: shipment.currentStatus, to: status, reasonCode },
      req,
    });

    // Fire notification for key status transitions
    try {
      const updatedShipment = await prisma.shipment.findUnique({
        where: { id },
        include: { consignee: true, merchant: true, pickupAddress: true, deliveryAddress: true },
      });
      if (status === 'OUT_FOR_DELIVERY') {
        await notifyShipmentStatus(prisma, 'out_for_delivery', updatedShipment, {});
      } else if (status === 'DELIVERED') {
        await notifyShipmentStatus(prisma, 'delivered', updatedShipment, { deliveredAt: new Date().toISOString() });
      } else if (status === 'FAILED') {
        await notifyShipmentStatus(prisma, 'shipment_failed', updatedShipment, { reasonCode });
      }
    } catch (notifErr) {
      // Non-blocking
    }

    // Invalidate tracking cache immediately for real-time consistency
    delByPattern('tracking:*').catch(() => {});

    res.json({ success: true, data: updated[0] });
  } catch (error) {

    next(error);
  }
});

// POST /api/v1/shipments/sync-offline — Batch sync offline delivery actions
router.post('/sync-offline', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { actions } = req.body; // [{ shipmentId, action, data, timestamp }]

    if (!Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({ success: false, message: 'Actions array required' });
    }

    if (actions.length > 50) {
      return res.status(400).json({ success: false, message: 'Maximum 50 actions per sync batch' });
    }

    const results = [];

    for (const action of actions) {
      try {
        const { shipmentId, action: type, data } = action;

        if (type === 'DELIVERED') {
          await prisma.shipment.update({
            where: { id: shipmentId },
            data: { status: 'DELIVERED', deliveredAt: new Date() },
          });
          results.push({ shipmentId, status: 'synced', action: type });
        } else if (type === 'FAILED') {
          await prisma.shipment.update({
            where: { id: shipmentId },
            data: { status: 'FAILED', failureReason: data?.reasonCode || 'UNKNOWN' },
          });
          results.push({ shipmentId, status: 'synced', action: type });
        } else if (type === 'CASH_COLLECTED') {
          // Record COD collection
          results.push({ shipmentId, status: 'synced', action: type });
        } else {
          results.push({ shipmentId, status: 'skipped', action: type, reason: 'Unknown action type' });
        }
      } catch (err) {
        results.push({ shipmentId: action.shipmentId, status: 'failed', error: err.message });
      }
    }

    res.json({ success: true, data: { synced: results.filter((r) => r.status === 'synced').length, failed: results.filter((r) => r.status === 'failed').length, results } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
