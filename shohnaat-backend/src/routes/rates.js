const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// POST /api/v1/rates/calculate — Real-time rate calculation
router.post('/calculate', auth, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const {
      originZoneId,
      destinationZoneId,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      paymentType = 'COD',
      codAmount = 0,
      serviceType = 'STANDARD',
    } = req.body;

    // Volumetric weight: (L × W × H) / 5000
    let volumetricWeight = 0;
    if (lengthCm && widthCm && heightCm) {
      volumetricWeight = (lengthCm * widthCm * heightCm) / 5000;
    }

    const billableWeight = Math.max(
      parseFloat(weightKg) || 0,
      volumetricWeight
    );

    // Find matching rate rule
    const rateRule = await prisma.rateRule.findFirst({
      where: {
        zoneId: destinationZoneId || undefined,
        serviceType,
      },
      include: { zone: true },
    });

    let baseCharge = 5.00; // Default base charge USD
    let extraPerKg = 2.50;

    if (rateRule) {
      baseCharge = parseFloat(rateRule.baseCharge);
      extraPerKg = rateRule.extraPerKg ? parseFloat(rateRule.extraPerKg) : 2.50;
    }

    // Calculate shipping charge
    const includedWeight = 1; // First 1kg included
    const extraWeight = Math.max(0, billableWeight - includedWeight);
    const shippingCharge = baseCharge + extraWeight * extraPerKg;

    // COD fee (typically 1-2% of COD amount)
    const codFeeRate = paymentType === 'COD' ? 0.015 : 0; // 1.5%
    const codFee = parseFloat(codAmount) * codFeeRate;

    const totalCharge = Math.round((shippingCharge + codFee) * 100) / 100;

    res.json({
      success: true,
      data: {
        billableWeight: Math.round(billableWeight * 100) / 100,
        volumetricWeight: Math.round(volumetricWeight * 100) / 100,
        actualWeight: parseFloat(weightKg) || 0,
        baseCharge,
        extraPerKg,
        shippingCharge: Math.round(shippingCharge * 100) / 100,
        codFee: Math.round(codFee * 100) / 100,
        codFeeRate,
        totalCharge,
        currency: 'USD',
        serviceType,
        estimatedDays: serviceType === 'EXPRESS' ? 1 : 2,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/rates/cards — List all rate cards (admin)
router.get('/cards', auth, requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const cards = await prisma.rateCard.findMany({
      include: {
        rules: {
          include: { zone: true },
        },
        _count: { select: { merchants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/rates/cards — Create rate card (admin)
router.post('/cards', auth, requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { name, isDefault, rules } = req.body;

    const card = await prisma.rateCard.create({
      data: {
        name,
        isDefault: isDefault || false,
        rules: rules
          ? {
              create: rules.map((r) => ({
                zoneId: r.zoneId || null,
                serviceType: r.serviceType || 'STANDARD',
                baseCharge: r.baseCharge,
                extraPerKg: r.extraPerKg || null,
              })),
            }
          : undefined,
      },
      include: { rules: true },
    });

    res.status(201).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/rates/cards/:id — Update rate card (admin)
router.patch('/cards/:id', auth, requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { name, isDefault, rules } = req.body;

    // If updating rules, delete old ones first
    if (rules) {
      await prisma.rateRule.deleteMany({ where: { rateCardId: id } });
    }

    const card = await prisma.rateCard.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isDefault !== undefined && { isDefault }),
        ...(rules && {
          rules: {
            create: rules.map((r) => ({
              zoneId: r.zoneId || null,
              serviceType: r.serviceType || 'STANDARD',
              baseCharge: r.baseCharge,
              extraPerKg: r.extraPerKg || null,
            })),
          },
        }),
      },
      include: { rules: { include: { zone: true } } },
    });

    res.json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/rates/cards/:id
router.delete('/cards/:id', auth, requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.rateRule.deleteMany({ where: { rateCardId: req.params.id } });
    await prisma.rateCard.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Rate card deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
