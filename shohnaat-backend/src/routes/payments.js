const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const PaymentService = require('../services/paymentService');

router.use(auth);

// GET /api/v1/payments/config — Get payment gateway config/status
router.get('/config', (req, res) => {
  const paymentService = new PaymentService(req.app.locals.prisma);
  res.json({ success: true, data: paymentService.getPaymentConfig() });
});

// POST /api/v1/payments/stripe/create-intent — Create Stripe PaymentIntent
router.post('/stripe/create-intent', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { amount, description } = req.body;
    const merchantId = req.user.merchantId;

    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    if (!amount || amount < 1 || amount > 50000) {
      return res.status(400).json({ success: false, message: 'Amount must be between $1 and $50,000' });
    }

    const paymentService = new PaymentService(prisma);
    const intent = await paymentService.createStripePaymentIntent({
      merchantId,
      amount: parseFloat(amount),
      description: description || 'Wallet Top-Up',
    });

    res.json({ success: true, data: intent });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/stripe/confirm — Confirm Stripe payment
router.post('/stripe/confirm', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { paymentIntentId } = req.body;

    const paymentService = new PaymentService(prisma);
    const result = await paymentService.confirmStripePayment(paymentIntentId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/paypal/create — Create PayPal payment
router.post('/paypal/create', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { amount, description } = req.body;
    const merchantId = req.user.merchantId;

    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    if (!amount || amount < 1 || amount > 50000) {
      return res.status(400).json({ success: false, message: 'Amount must be between $1 and $50,000' });
    }

    const paymentService = new PaymentService(prisma);
    const payment = await paymentService.createPayPalPayment({
      merchantId,
      amount: parseFloat(amount),
      description: description || 'Wallet Top-Up',
    });

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/paypal/execute — Execute PayPal after approval
router.post('/paypal/execute', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { paymentId, payerId } = req.body;

    const paymentService = new PaymentService(prisma);
    const result = await paymentService.executePayPalPayment(paymentId, payerId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/webhook/stripe — Stripe webhook (raw body needed)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const paymentService = new PaymentService(prisma);
    const signature = req.headers['stripe-signature'];

    // Try real Stripe verification
    let event;
    try {
      event = paymentService.verifyStripeWebhook(req.body, signature);
    } catch (err) {
      // In sandbox mode, just parse and process
      try {
        event = JSON.parse(req.body.toString());
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
      }
    }

    const result = await paymentService.handleStripeWebhook(event);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/payments/sandbox/topup — Quick sandbox top-up (no real payment)
router.post('/sandbox/topup', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { amount } = req.body;
    const merchantId = req.user.merchantId;

    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Merchant ID required' });
    }

    if (!amount || amount < 1 || amount > 100000) {
      return res.status(400).json({ success: false, message: 'Amount must be between $1 and $100,000' });
    }

    const LedgerService = require('../services/ledgerService');
    const crypto = require('crypto');
    const ledger = new LedgerService(prisma);
    const account = await ledger.getOrCreateAccount(merchantId);

    const transactionId = `sbx_${crypto.randomBytes(12).toString('hex')}`;

    // Credit merchant wallet directly
    await ledger.recordEntry({
      transactionId,
      type: 'COD_COLLECTED',
      amount: parseFloat(amount),
      direction: 'CREDIT',
      accountId: account.id,
      note: `Sandbox wallet top-up (test mode)`,
    });

    res.json({
      success: true,
      data: {
        transactionId,
        amount: parseFloat(amount),
        currency: 'USD',
        status: 'completed',
        mode: 'sandbox',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
