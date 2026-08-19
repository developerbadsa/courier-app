const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/v1/pickups
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, status, merchantId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(merchantId && { merchantId })
    };

    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        include: {
          merchant: { 
            select: { 
              businessName: true,
              user: { select: { name: true, phone: true } }
            } 
          },
          pickupAddress: true,
          _count: { select: { shipments: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pickupRequest.count({ where })
    ]);

    res.json({
      success: true,
      data: pickups,
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

// POST /api/v1/pickups
router.post('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { pickupAddressId, requestedDate, parcelCount } = req.body;

    const pickup = await prisma.pickupRequest.create({
      data: {
        merchantId: req.user.merchantId || req.body.merchantId,
        pickupAddressId,
        requestedDate: new Date(requestedDate),
        parcelCount: parcelCount || 1,
        status: 'PENDING'
      },
      include: {
        pickupAddress: true
      }
    });

    res.status(201).json({
      success: true,
      data: pickup
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/pickups/:id/approve
router.patch('/:id/approve', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    const pickup = await prisma.pickupRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    res.json({
      success: true,
      data: pickup
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/pickups/:id/reject
router.patch('/:id/reject', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { reason } = req.body;

    const pickup = await prisma.pickupRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    res.json({
      success: true,
      data: pickup
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
