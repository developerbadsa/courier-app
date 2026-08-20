const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const LedgerService = require('../services/ledgerService');
const PaymentService = require('../services/paymentService');

router.use(auth);

// ═══════════════════════════════════════════════════
// MERCHANT ENDPOINTS
// ═══════════════════════════════════════════════════

// GET /api/v1/finance/wallet — Get merchant wallet balance
router.get('/wallet', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    let merchantId = req.user.merchantId || req.query.merchantId || req.body.merchantId;
    if (!merchantId && req.user.id) {
      const m = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
      if (m) merchantId = m.id;
    }
    if (!merchantId) return res.status(400).json({ success: false, message: 'Merchant ID required' });

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
    let merchantId = req.user.merchantId || req.query.merchantId;
    if (!merchantId && req.user.id) {
      const m = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
      if (m) merchantId = m.id;
    }

    const { page, limit, startDate, endDate } = req.query;

    const ledger = new LedgerService(prisma);
    const result = await ledger.getEntries(merchantId, { page, limit, startDate, endDate });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});


// GET /api/v1/finance/entries/export — Export ledger as CSV
router.get('/entries/export', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId || req.query.merchantId;
    const { startDate, endDate, format = 'csv' } = req.query;

    const ledger = new LedgerService(prisma);
    const csv = await ledger.exportEntriesCSV(merchantId, { startDate, endDate });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="shohnaat-ledger-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
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

// POST /api/v1/finance/payout/request — Merchant requests payout
router.post('/payout/request', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;
    const { amount, method, bankAccount, paypalEmail, notes } = req.body;

    if (!merchantId) return res.status(400).json({ success: false, message: 'Merchant ID required' });

    // Verify sufficient balance
    const ledger = new LedgerService(prisma);
    const balance = await ledger.getMerchantBalance(merchantId);

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (parseFloat(amount) > balance.balance) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Available: $${balance.balance.toFixed(2)}` });
    }

    if (!method || !['bank_transfer', 'paypal'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Method must be bank_transfer or paypal' });
    }

    if (method === 'paypal' && !paypalEmail) {
      return res.status(400).json({ success: false, message: 'PayPal email required' });
    }

    // Create payout request
    const payoutRequest = await prisma.settlement.create({
      data: {
        merchantId,
        periodStart: new Date(),
        periodEnd: new Date(),
        totalAmount: parseFloat(amount),
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: payoutRequest.id,
        amount: parseFloat(amount),
        method,
        status: 'PENDING',
        notes: notes || '',
        createdAt: payoutRequest.createdAt,
      },
    });
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

    const settlements = await prisma.settlement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

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

// ═══════════════════════════════════════════════════
// SUPERADMIN ENDPOINTS
// ═══════════════════════════════════════════════════

// GET /api/v1/finance/admin/settlements — All settlements (admin)
router.get('/admin/settlements', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page, limit, status, merchantId } = req.query;

    const ledger = new LedgerService(prisma);
    const result = await ledger.getAllSettlements({ page, limit, status, merchantId });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/finance/admin/settlements/generate — Generate settlement for merchant
router.post('/admin/settlements/generate', requireRole('super_admin'), async (req, res, next) => {
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

// POST /api/v1/finance/admin/settlements/:id/approve — Approve payout
router.post('/admin/settlements/:id/approve', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const ledger = new LedgerService(prisma);
    const settlement = await ledger.approveSettlement(req.params.id, req.user.id);
    res.json({ success: true, data: settlement });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/finance/admin/settlements/:id/process — Process payout via provider
router.post('/admin/settlements/:id/process', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { provider = 'sandbox' } = req.body; // 'stripe' | 'paypal' | 'sandbox'

    const ledger = new LedgerService(prisma);
    const result = await ledger.processPayout(req.params.id, {
      provider,
      payoutDestination: req.body.destination,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/finance/admin/settlements/batch-process — Batch process all approved settlements
router.post('/admin/settlements/batch-process', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { provider = 'sandbox' } = req.body;

    const ledger = new LedgerService(prisma);

    // Find all PROCESSING settlements
    const settlements = await prisma.settlement.findMany({
      where: { status: 'PROCESSING' },
    });

    const results = [];
    for (const settlement of settlements) {
      try {
        const result = await ledger.processPayout(settlement.id, { provider });
        results.push({ id: settlement.id, success: true, ...result });
      } catch (err) {
        results.push({ id: settlement.id, success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      data: {
        processed: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/finance/admin/stats — Admin financial overview
router.get('/admin/stats', requireRole('super_admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const [merchantCount, totalPaidOut, pendingPayouts, totalCollected] = await Promise.all([
      prisma.merchant.count({ where: { isActive: true, deletedAt: null } }),
      prisma.settlement.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true }, _count: true }),
      prisma.settlement.aggregate({ where: { status: 'PENDING' }, _sum: { totalAmount: true }, _count: true }),
      prisma.ledgerEntry.aggregate({ where: { type: 'COD_COLLECTED', direction: 'CREDIT' }, _sum: { amount: true } }),
    ]);

    res.json({
      success: true,
      data: {
        activeMerchants: merchantCount,
        totalPaidOut: totalPaidOut._sum.totalAmount || 0,
        payoutsCompleted: totalPaidOut._count,
        pendingPayoutAmount: pendingPayouts._sum.totalAmount || 0,
        pendingPayoutCount: pendingPayouts._count,
        totalCODCollected: totalCollected._sum.amount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
