const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET /api/v1/addresses — List merchant's addresses
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.query.merchantId;
    const { type, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    const where = {
      merchantId,
      deletedAt: null,
      ...(type && { type }),
    };

    const [addresses, total] = await Promise.all([
      prisma.address.findMany({
        where,
        include: {
          zone: { select: { id: true, name: true } },
          _count: { select: { pickupRequests: true, shipmentPickupFor: true, shipmentDeliveryFor: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.address.count({ where }),
    ]);

    res.json({
      success: true,
      data: addresses,
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

// GET /api/v1/addresses/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const address = await prisma.address.findUnique({
      where: { id: req.params.id },
      include: {
        zone: { select: { id: true, name: true } },
        _count: { select: { pickupRequests: true } },
      },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/addresses — Create new address
router.post('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.body.merchantId;
    const { type, label, line1, area, city, zoneId, lat, lng, isDefault } = req.body;

    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    if (!type || !line1 || !city) {
      return res.status(400).json({ success: false, message: 'type, line1, and city are required' });
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await prisma.address.updateMany({
        where: { merchantId, type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        merchantId,
        type,
        label: label || null,
        line1,
        area: area || null,
        city,
        zoneId: zoneId || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        isDefault: isDefault || false,
      },
      include: { zone: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/addresses/:id — Update address
router.patch('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { type, label, line1, area, city, zoneId, lat, lng, isDefault } = req.body;

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { merchantId: existing.merchantId, type: existing.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(label !== undefined && { label: label || null }),
        ...(line1 && { line1 }),
        ...(area !== undefined && { area: area || null }),
        ...(city && { city }),
        ...(zoneId !== undefined && { zoneId: zoneId || null }),
        ...(lat !== undefined && { lat: lat ? parseFloat(lat) : null }),
        ...(lng !== undefined && { lng: lng ? parseFloat(lng) : null }),
        ...(isDefault !== undefined && { isDefault }),
      },
      include: { zone: { select: { id: true, name: true } } },
    });

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/addresses/:id/default — Set as default
router.patch('/:id/default', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Unset all other defaults of same type for this merchant
    await prisma.address.updateMany({
      where: { merchantId: existing.merchantId, type: existing.type, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/addresses/:id (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;

    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
