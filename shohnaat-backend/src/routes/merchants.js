const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET /api/v1/merchants
router.get('/', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          _count: { select: { shipments: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.merchant.count({ where })
    ]);

    res.json({
      success: true,
      data: merchants,
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

// GET /api/v1/merchants/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        rateCard: true,
        _count: { select: { shipments: true, addresses: true } }
      }
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      data: merchant
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/merchants
router.post('/', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, email, phone, password, businessName, businessType } = req.body;
    const bcrypt = require('bcryptjs');

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        roles: {
          create: {
            role: {
              connect: { name: 'merchant' }
            }
          }
        }
      }
    });

    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        userId: user.id,
        businessName,
        businessType
      },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/merchants/:id
router.patch('/:id', requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { businessName, businessType, isActive, kycStatus } = req.body;

    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        ...(businessName && { businessName }),
        ...(businessType && { businessType }),
        ...(isActive !== undefined && { isActive }),
        ...(kycStatus && { kycStatus })
      },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    res.json({
      success: true,
      data: merchant
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/merchants/:id (soft delete)
router.delete('/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    await prisma.merchant.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Merchant deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
