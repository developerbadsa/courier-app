const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const LedgerService = require('../services/ledgerService');

router.use(auth);

// GET /api/v1/finance/wallet — Get merchant wallet balance
router.get('/wallet', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.body.merchantId;
    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    const ledger = new LedgerService(prisma);
    const balance = await ledger.getMerchantBalance(merchantId);
    res.json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/finance/entries — Get ledger entries
router.get('/entries', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.query.merchantId;
    const { page, limit, startDate, endDate } = req.query;

    const ledger = new LedgerService(prisma);
    const result = await ledger.getEntries(merchantId, { page, limit, startDate, endDate });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/finance/settlements — Get settlements
router.get('/settlements', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.query.merchantId;
    const { page, limit } = req.query;

    const ledger = new LedgerService(prisma);
    const result = await ledger.getSettlements(merchantId, { page, limit });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/finance/settlements/generate — Generate settlement (admin)
router.post('/settlements/generate', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { merchantId, periodStart, periodEnd } = req.body;

    const ledger = new LedgerService(prisma);
    const settlement = await ledger.generateSettlement(merchantId, periodStart, periodEnd);
    res.status(201).json({ success: true, data: settlement });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/finance/summary — Dashboard financial summary
router.get('/summary', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.query.merchantId;

    const ledger = new LedgerService(prisma);
    const balance = await ledger.getMerchantBalance(merchantId);

    // Get recent settlements
    const settlements = await prisma.settlement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get total settlements
    const settlementStats = await prisma.settlement.aggregate({
      where: { merchantId },
      _count: true,
      _sum: { totalAmount: true },
    });

    res.json({
      success: true,
      data: {
        wallet: balance,
        recentSettlements: settlements,
        totalSettlements: settlementStats._count,
        totalPaidOut: settlementStats._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
