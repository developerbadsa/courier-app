/**
 * Payment Service — Stripe & PayPal Integration (SANDBOX/TEST MODE)
 *
 * Environment Variables Required:
 *   STRIPE_SECRET_KEY        — sk_test_...
 *   STRIPE_PUBLISHABLE_KEY   — pk_test_...
 *   STRIPE_WEBHOOK_SECRET    — whsec_...
 *   PAYPAL_CLIENT_ID         — sandbox client id
 *   PAYPAL_CLIENT_SECRET     — sandbox client secret
 *   PAYPAL_MODE              — sandbox
 */

const crypto = require('crypto');

// Lazy-load payment SDKs (they throw if keys are missing)
let stripe = null;
let paypal = null;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }
  return stripe;
}

function getPayPal() {
  if (!paypal && process.env.PAYPAL_CLIENT_ID) {
    paypal = require('paypal-rest-sdk');
    paypal.configure({
      mode: process.env.PAYPAL_MODE || 'sandbox',
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
    });
  }
  return paypal;
}

class PaymentService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  STRIPE
   * ═══════════════════════════════════════════════════════════════════ */

  /**
   * Create a Stripe PaymentIntent for wallet top-up
   */
  async createStripePaymentIntent({ merchantId, amount, currency = 'usd', description }) {
    const stripeClient = getStripe();
    if (!stripeClient) {
      // Sandbox mode — return mock payment intent
      return this._mockPaymentIntent(merchantId, amount);
    }

    const intent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      metadata: {
        merchantId,
        type: 'wallet_topup',
        description: description || 'Wallet Top-Up',
      },
      automatic_payment_methods: { enabled: true },
    });

    return {
      id: intent.id,
      clientSecret: intent.clientSecret,
      amount: amount,
      currency,
      status: intent.status,
      mode: 'stripe',
    };
  }

  /**
   * Confirm a Stripe payment
   */
  async confirmStripePayment(paymentIntentId) {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return this._mockConfirmPayment(paymentIntentId);
    }

    const intent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      await this._processSuccessfulPayment({
        merchantId: intent.metadata.merchantId,
        amount: intent.amount / 100,
        transactionId: intent.id,
        provider: 'stripe',
      });
    }

    return {
      id: intent.id,
      status: intent.status,
      amount: intent.amount / 100,
    };
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyStripeWebhook(payload, signature) {
    const stripeClient = getStripe();
    if (!stripeClient) return null;

    return stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  /**
   * Handle Stripe webhook event
   */
  async handleStripeWebhook(event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await this._processSuccessfulPayment({
          merchantId: intent.metadata.merchantId,
          amount: intent.amount / 100,
          transactionId: intent.id,
          provider: 'stripe',
        });
        return { handled: true };
      }
      case 'payment_intent.payment_failed': {
        return { handled: true, reason: event.data.object.last_payment_error?.message };
      }
      default:
        return { handled: false };
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  PAYPAL
   * ═══════════════════════════════════════════════════════════════════ */

  /**
   * Create PayPal payment
   */
  async createPayPalPayment({ merchantId, amount, description }) {
    const paypalClient = getPayPal();
    if (!paypalClient) {
      return this._mockPayPalPayment(merchantId, amount);
    }

    const paymentJson = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      transactions: [
        {
          amount: { total: amount.toFixed(2), currency: 'USD' },
          description: description || 'Wallet Top-Up — Shohnaat Logistics',
          custom: merchantId,
        },
      ],
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL || 'https://shohnaat.rahimbadsa.me'}/dashboard/finance?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://shohnaat.rahimbadsa.me'}/dashboard/finance?payment=cancelled`,
      },
    };

    return new Promise((resolve, reject) => {
      paypalClient.payment.create(paymentJson, (error, payment) => {
        if (error) return reject(error);
        const approvalUrl = payment.links?.find((l) => l.rel === 'approval_url');
        resolve({
          id: payment.id,
          approvalUrl: approvalUrl?.href,
          amount,
          status: payment.state,
          mode: 'paypal',
        });
      });
    });
  }

  /**
   * Execute PayPal payment after approval
   */
  async executePayPalPayment(paymentId, payerId) {
    const paypalClient = getPayPal();
    if (!paypalClient) {
      return this._mockConfirmPayment(paymentId);
    }

    return new Promise((resolve, reject) => {
      const executeJson = { payer_id: payerId };
      paypalClient.payment.execute(paymentId, executeJson, async (error, payment) => {
        if (error) return reject(error);

        if (payment.state === 'approved') {
          const sale = payment.transactions[0]?.related_resources?.[0]?.sale;
          await this._processSuccessfulPayment({
            merchantId: payment.transactions[0]?.custom,
            amount: parseFloat(payment.transactions[0]?.amount?.total),
            transactionId: sale?.id || paymentId,
            provider: 'paypal',
          });
        }

        resolve({
          id: payment.id,
          status: payment.state,
          amount: parseFloat(payment.transactions[0]?.amount?.total),
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  COMMON
   * ═══════════════════════════════════════════════════════════════════ */

  /**
   * Process successful payment — credit merchant wallet
   */
  async _processSuccessfulPayment({ merchantId, amount, transactionId, provider }) {
    const LedgerService = require('./ledgerService');
    const ledger = new LedgerService(this.prisma);

    const account = await ledger.getOrCreateAccount(merchantId);
    if (!account) throw new Error('No ledger account for merchant');

    // CREDIT merchant wallet
    await ledger.recordEntry({
      transactionId,
      type: 'COD_COLLECTED', // Reusing as wallet credit
      amount,
      direction: 'CREDIT',
      accountId: account.id,
      note: `Wallet top-up via ${provider} (${transactionId})`,
    });

    return { transactionId, merchantId, amount, provider };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId) {
    const entry = await this.prisma.ledgerEntry.findFirst({
      where: { transactionId },
    });
    return entry ? { found: true, entry } : { found: false };
  }

  /**
   * Get payment configuration (publishable keys, status)
   */
  getPaymentConfig() {
    return {
      stripe: {
        available: !!process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
        testMode: !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'),
      },
      paypal: {
        available: !!process.env.PAYPAL_CLIENT_ID,
        testMode: (process.env.PAYPAL_MODE || 'sandbox') === 'sandbox',
      },
      mode: process.env.PAYMENT_MODE || 'sandbox',
    };
  }

  /* ═══════════════════════════════════════════════════════════════════
   *  SANDBOX MOCKS (when no real keys provided)
   * ═══════════════════════════════════════════════════════════════════ */

  _mockPaymentIntent(merchantId, amount) {
    const id = `pi_sandbox_${crypto.randomBytes(12).toString('hex')}`;
    return {
      id,
      clientSecret: `${id}_secret_mock`,
      amount,
      currency: 'usd',
      status: 'requires_payment_method',
      mode: 'sandbox',
    };
  }

  _mockConfirmPayment(id) {
    return {
      id: id || `pi_sandbox_confirmed`,
      status: 'succeeded',
      amount: 0,
      mode: 'sandbox',
    };
  }

  _mockPayPalPayment(merchantId, amount) {
    const id = `PAYID-sandbox-${crypto.randomBytes(8).toString('hex')}`;
    return {
      id,
      approvalUrl: null,
      amount,
      status: 'created',
      mode: 'sandbox',
    };
  }
}

module.exports = PaymentService;
