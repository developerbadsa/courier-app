const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/v1/riders
router.get('/', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search } } }
        ]
      })
    };

    const [riders, total] = await Promise.all([
      prisma.rider.findMany({
        where,
        include: {
          user: { select: { name: true, phone: true } },
          _count: { select: { assignments: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.rider.count({ where })
    ]);

    res.json({
      success: true,
      data: riders,
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

// GET /api/v1/riders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    const rider = await prisma.rider.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        assignments: {
          include: {
            shipment: { select: { trackingNumber: true, currentStatus: true } }
          },
          orderBy: { assignedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    res.json({
      success: true,
      data: rider
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/riders
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
            role: {
              connect: { name: 'rider' }
            }
          }
        }
      }
    });

    const rider = await prisma.rider.create({
      data: {
        userId: user.id,
        vehicleType
      },
      include: {
        user: { select: { name: true, phone: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: rider
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/riders/:id/duty
router.patch('/:id/duty', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { isOnDuty } = req.body;

    const rider = await prisma.rider.update({
      where: { id },
      data: { isOnDuty }
    });

    res.json({
      success: true,
      data: rider
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/shipments/:id/assign-rider
router.patch('/assignments/:shipmentId', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { shipmentId } = req.params;
    const { riderId } = req.body;

    const assignment = await prisma.$transaction([
      prisma.riderAssignment.create({
        data: {
          riderId,
          shipmentId,
          assignedAt: new Date()
        }
      }),
      prisma.shipment.update({
        where: { id: shipmentId },
        data: { currentStatus: 'PICKUP_ASSIGNED' }
      }),
      prisma.shipmentStatusHistory.create({
        data: {
          shipmentId,
          status: 'PICKUP_ASSIGNED',
          note: 'Rider assigned',
          actorUserId: req.user.id
        }
      })
    ]);

    res.json({
      success: true,
      data: assignment[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
