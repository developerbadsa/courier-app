const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

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

// GET /api/v1/riders — List riders (admin/operator)
router.get('/', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, search, isOnDuty } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(isOnDuty !== undefined && { isOnDuty: isOnDuty === 'true' }),
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search } } },
        ],
      }),
    };

    const [riders, total] = await Promise.all([
      prisma.rider.findMany({
        where,
        include: {
          user: { select: { name: true, phone: true } },
          _count: { select: { assignments: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rider.count({ where }),
    ]);

    res.json({
      success: true,
      data: riders,
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

// GET /api/v1/riders/me/tasks — Rider's own assigned tasks (PWA)
router.get('/me/tasks', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id },
    });

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const assignments = await prisma.riderAssignment.findMany({
      where: {
        riderId: rider.id,
        unassignedAt: null,
      },
      include: {
        shipment: {
          include: {
            consignee: true,
            pickupAddress: true,
            deliveryAddress: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/riders/me/cod-summary — Rider's daily COD cash summary
router.get('/me/cod-summary', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { date } = req.query; // YYYY-MM-DD, defaults to today

    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id },
    });

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get delivered shipments with COD for this rider today
    const deliveredShipments = await prisma.shipment.findMany({
      where: {
        currentStatus: 'DELIVERED',
        riderAssignments: {
          some: { riderId: rider.id },
        },
        deliveredAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        trackingNumber: true,
        codAmount: true,
        deliveredAt: true,
        consignee: { select: { name: true } },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    const totalCollected = deliveredShipments.reduce(
      (sum, s) => sum + parseFloat(s.codAmount || 0),
      0
    );

    res.json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        totalCollected: Math.round(totalCollected * 100) / 100,
        currency: 'USD',
        deliveriesCount: deliveredShipments.length,
        shipments: deliveredShipments,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/riders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const rider = await prisma.rider.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        assignments: {
          include: {
            shipment: { select: { trackingNumber: true, currentStatus: true, codAmount: true } },
          },
          orderBy: { assignedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, data: rider });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/riders — Create rider
router.post('/', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, email, phone, password, vehicleType } = req.body;
    const bcrypt = require('bcryptjs');

    const passwordHash = await bcrypt.hash(password || 'rider123', 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        roles: {
          create: {
            role: { connect: { name: 'rider' } },
          },
        },
      },
    });

    const rider = await prisma.rider.create({
      data: { userId: user.id, vehicleType },
      include: { user: { select: { name: true, phone: true } } },
    });

    res.status(201).json({ success: true, data: rider });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/riders/:id/duty
router.patch('/:id/duty', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { isOnDuty } = req.body;

    const rider = await prisma.rider.update({
      where: { id: req.params.id },
      data: { isOnDuty },
    });

    res.json({ success: true, data: rider });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/riders/assignments/:shipmentId — Assign rider to shipment
router.patch('/assignments/:shipmentId', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipmentId } = req.params;
    const { riderId } = req.body;

    const assignment = await prisma.$transaction([
      prisma.riderAssignment.create({
        data: { riderId, shipmentId, assignedAt: new Date() },
      }),
      prisma.shipment.update({
        where: { id: shipmentId },
        data: { currentStatus: 'PICKUP_ASSIGNED' },
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId,
          status: 'PICKUP_ASSIGNED',
          note: 'Rider assigned',
          actorUserId: req.user.id,
        },
      }),
    ]);

    res.json({ success: true, data: assignment[0] });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/riders/generate-otp — Generate OTP for COD collection verification
router.post('/generate-otp', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({ success: false, message: 'shipmentId required' });
    }

    const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in shipment's chargeSnapshot (temporary, will be cleared)
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        chargeSnapshot: {
          otp,
          otpExpiresAt: expiresAt.toISOString(),
          otpGeneratedBy: rider.id,
        },
      },
    });

    res.json({
      success: true,
      data: {
        otp,
        expiresAt: expiresAt.toISOString(),
        expiresInMinutes: 10,
        message: 'Share this OTP with consignee for COD verification',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/riders/verify-otp — Verify OTP entered by consignee
router.post('/verify-otp', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipmentId, otp } = req.body;

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const snapshot = shipment.chargeSnapshot;
    if (!snapshot?.otp || !snapshot?.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No OTP generated for this shipment' });
    }

    // Check expiry
    if (new Date() > new Date(snapshot.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP expired. Generate a new one.' });
    }

    // Verify OTP
    if (otp !== snapshot.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — clear it
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { chargeSnapshot: { ...snapshot, otpVerified: true, otp: undefined } },
    });

    res.json({ success: true, data: { verified: true, message: 'OTP verified successfully' } });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/riders/complete-delivery — Rider marks delivery complete with COD
router.post('/complete-delivery', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipmentId, codCollected, deliveryNotes, podPhotoUrl, signatureUrl, otpVerified } = req.body;

    const rider = await prisma.rider.findUnique({ where: { userId: req.user.id } });
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    // If COD shipment, OTP must be verified
    const isCOD = parseFloat(shipment.codAmount || 0) > 0;
    if (isCOD && codCollected && parseFloat(codCollected) > 0) {
      const snapshot = shipment.chargeSnapshot;
      if (!snapshot?.otpVerified) {
        return res.status(400).json({
          success: false,
          message: 'OTP verification required for COD collection',
        });
      }
    }

    // Update shipment to DELIVERED
    await prisma.$transaction([
      prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          currentStatus: 'DELIVERED',
          deliveredAt: new Date(),
        },
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId,
          status: 'DELIVERED',
          note: deliveryNotes || 'Delivered by rider',
          actorUserId: req.user.id,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        shipmentId,
        status: 'DELIVERED',
        codCollected: parseFloat(codCollected || 0),
        deliveredAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/riders/report-failure — Rider reports failed delivery
router.post('/report-failure', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipmentId, reasonCode, notes } = req.body;

    if (!reasonCode || !FAILED_REASONS.includes(reasonCode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason code. Allowed: ${FAILED_REASONS.join(', ')}`,
      });
    }

    const rider = await prisma.rider.findUnique({
      where: { userId: req.user.id },
    });

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }

    await prisma.$transaction([
      prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          currentStatus: 'FAILED',
          deliveryAttempts: { increment: 1 },
        },
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId,
          status: 'FAILED',
          note: notes || `Failed: ${reasonCode}`,
          reasonCode,
          actorUserId: req.user.id,
        },
      }),
    ]);

    res.json({
      success: true,
      data: { shipmentId, status: 'FAILED', reasonCode },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
