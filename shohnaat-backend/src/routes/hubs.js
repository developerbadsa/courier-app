const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// All hub/branch routes require admin/operator role
router.use(auth);
router.use(requireRole('super_admin', 'operator'));

// GET /api/v1/hubs — List all branches/hubs
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, search, isHub } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(isHub !== undefined && { isHub: isHub === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [hubs, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              shipmentsHere: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.branch.count({ where }),
    ]);

    res.json({
      success: true,
      data: hubs,
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

// GET /api/v1/hubs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const hub = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: {
        users: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { shipmentsHere: true } },
      },
    });

    if (!hub) {
      return res.status(404).json({ success: false, message: 'Hub not found' });
    }

    res.json({ success: true, data: hub });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/hubs — Create branch/hub
router.post('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, code, isHub, address, city } = req.body;

    const hub = await prisma.branch.create({
      data: { name, code, isHub: isHub || false, address, city },
    });

    res.status(201).json({ success: true, data: hub });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Hub code already exists' });
    }
    next(error);
  }
});

// PATCH /api/v1/hubs/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, code, isHub, address, city, isActive } = req.body;

    const hub = await prisma.branch.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(isHub !== undefined && { isHub }),
        ...(address && { address }),
        ...(city && { city }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: hub });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/hubs/:id (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.branch.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: 'Hub deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
