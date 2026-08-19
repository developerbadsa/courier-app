const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.use(requireRole('super_admin', 'operator'));

// GET /api/v1/zones — List all delivery zones
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const zones = await prisma.zone.findMany({
      include: {
        _count: {
          select: { addresses: true, rateRules: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: zones });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/zones — Create zone
router.post('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, isActive } = req.body;

    const zone = await prisma.zone.create({
      data: { name, isActive: isActive !== undefined ? isActive : true },
    });

    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Zone name already exists' });
    }
    next(error);
  }
});

// PATCH /api/v1/zones/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, isActive } = req.body;

    const zone = await prisma.zone.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: zone });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/zones/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.zone.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Zone deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
