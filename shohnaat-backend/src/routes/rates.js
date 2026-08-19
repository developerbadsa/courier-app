const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

// Surcharge configuration (can be stored in DB later)
const SURCHARGES = {
  fuelSurchargeRate: 0.12,       // 12% fuel surcharge
  remoteAreaFee: 5.00,           // Extra for remote/rural zones
  insuranceRate: 0.005,          // 0.5% of declared value (optional)
  weekendSurcharge: 2.00,        // Weekend delivery surcharge
  hazmatFee: 15.00,              // Hazardous materials surcharge
};

// POST /api/v1/rates/calculate — Real-time rate calculation with full pricing matrix
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
      merchantId,
      declaredValue = 0,
      isRemoteArea = false,
      requiresInsurance = false,
    } = req.body;

    // ── 1. Volumetric Weight ──
    let volumetricWeight = 0;
    if (lengthCm && widthCm && heightCm) {
      volumetricWeight = (parseFloat(lengthCm) * parseFloat(widthCm) * parseFloat(heightCm)) / 5000;
    }

    const billableWeight = Math.max(parseFloat(weightKg) || 0, volumetricWeight);

    // ── 2. Find Merchant-Specific Rate Card ──
    let baseCharge = 5.00;
    let extraPerKg = 2.50;
    let rateCardName = 'Default';
    let merchantDiscount = 0;

    // Check if merchant has custom rate card
    if (merchantId) {
      const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
        include: {
          rateCard: {
            include: { rules: { include: { zone: true } } },
          },
        },
      });

      if (merchant?.rateCard) {
        rateCardName = merchant.rateCard.name;
        const rule = merchant.rateCard.rules.find(
          (r) => r.zoneId === destinationZoneId && r.serviceType === serviceType
        );
        // Also check default zone rules
        const defaultRule = merchant.rateCard.rules.find(
          (r) => !r.zoneId && r.serviceType === serviceType
        );
        const matchedRule = rule || defaultRule;

        if (matchedRule) {
          baseCharge = parseFloat(matchedRule.baseCharge);
          extraPerKg = matchedRule.extraPerKg ? parseFloat(matchedRule.extraPerKg) : 2.50;
        }
      }
    }

    // ── 3. Zone-to-Zone Rate Rule ──
    if (merchantId && baseCharge === 5.00) {
      const zoneRule = await prisma.rateRule.findFirst({
        where: {
          zoneId: destinationZoneId || undefined,
          serviceType,
        },
        include: { zone: true },
      });

      if (zoneRule) {
        baseCharge = parseFloat(zoneRule.baseCharge);
        extraPerKg = zoneRule.extraPerKg ? parseFloat(zoneRule.extraPerKg) : 2.50;
      }
    }

    // ── 4. Shipping Charge ──
    const includedWeight = 1; // First 1kg included
    const extraWeight = Math.max(0, billableWeight - includedWeight);
    const shippingCharge = baseCharge + extraWeight * extraPerKg;

    // ── 5. Service Type Multiplier ──
    const serviceMultiplier = {
      ECONOMY: 0.85,
      STANDARD: 1.0,
      EXPRESS: 1.5,
      OVERNIGHT: 2.0,
    };
    const multiplier = serviceMultiplier[serviceType] || 1.0;
    const adjustedShipping = shippingCharge * multiplier;

    // ── 6. Fuel Surcharge ──
    const fuelSurcharge = adjustedShipping * SURCHARGES.fuelSurchargeRate;

    // ── 7. Remote Area Fee ──
    const remoteFee = isRemoteArea ? SURCHARGES.remoteAreaFee : 0;

    // ── 8. Insurance (optional) ──
    const insuranceFee = requiresInsurance ? parseFloat(declaredValue) * SURCHARGES.insuranceRate : 0;

    // ── 9. COD Fee ──
    const codFeeRate = paymentType === 'COD' ? 0.015 : 0;
    const codFee = parseFloat(codAmount) * codFeeRate;

    // ── 10. Weekend Surcharge ──
    const day = new Date().getDay();
    const weekendFee = (day === 0 || day === 6) ? SURCHARGES.weekendSurcharge : 0;

    // ── 11. Total ──
    const subtotal = adjustedShipping + fuelSurcharge + remoteFee + insuranceFee + codFee + weekendFee;
    const totalCharge = Math.round(subtotal * 100) / 100;

    res.json({
      success: true,
      data: {
        // Weight breakdown
        billableWeight: Math.round(billableWeight * 100) / 100,
        volumetricWeight: Math.round(volumetricWeight * 100) / 100,
        actualWeight: parseFloat(weightKg) || 0,

        // Base pricing
        baseCharge,
        extraPerKg,
        includedWeight,
        shippingCharge: Math.round(shippingCharge * 100) / 100,

        // Adjustments
        serviceType,
        serviceMultiplier: multiplier,
        adjustedShipping: Math.round(adjustedShipping * 100) / 100,

        // Surcharges
        fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
        fuelSurchargeRate: SURCHARGES.fuelSurchargeRate,
        remoteFee,
        insuranceFee: Math.round(insuranceFee * 100) / 100,
        weekendFee,

        // COD
        codFee: Math.round(codFee * 100) / 100,
        codFeeRate,
        codAmount: parseFloat(codAmount) || 0,

        // Merchant info
        rateCardName,
        merchantDiscount,

        // Total
        totalCharge,
        currency: 'USD',
        estimatedDays: serviceType === 'EXPRESS' ? 1 : serviceType === 'ECONOMY' ? 5 : 2,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/rates/surcharges — Get surcharge configuration
router.get('/surcharges', auth, (req, res) => {
  res.json({ success: true, data: SURCHARGES });
});

// PATCH /api/v1/rates/surcharges — Update surcharge config (admin only)
router.patch('/surcharges', auth, requireRole('super_admin'), (req, res) => {
  const { fuelSurchargeRate, remoteAreaFee, insuranceRate, weekendSurcharge, hazmatFee } = req.body;
  if (fuelSurchargeRate !== undefined) SURCHARGES.fuelSurchargeRate = parseFloat(fuelSurchargeRate);
  if (remoteAreaFee !== undefined) SURCHARGES.remoteAreaFee = parseFloat(remoteAreaFee);
  if (insuranceRate !== undefined) SURCHARGES.insuranceRate = parseFloat(insuranceRate);
  if (weekendSurcharge !== undefined) SURCHARGES.weekendSurcharge = parseFloat(weekendSurcharge);
  if (hazmatFee !== undefined) SURCHARGES.hazmatFee = parseFloat(hazmatFee);
  res.json({ success: true, data: SURCHARGES });
});

// GET /api/v1/rates/cards — List all rate cards (admin)
router.get('/cards', auth, requireRole('super_admin', 'operator'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const cards = await prisma.rateCard.findMany({
      include: {
        rules: { include: { zone: true } },
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

// POST /api/v1/rates/cards/:id/assign — Assign rate card to merchant
router.post('/cards/:id/assign', auth, requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { id } = req.params;
    const { merchantId } = req.body;

    await prisma.merchant.update({
      where: { id: merchantId },
      data: { rateCardId: id },
    });

    res.json({ success: true, message: `Rate card assigned to merchant` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
