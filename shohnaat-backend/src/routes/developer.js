const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');
const getWebhookDispatcher = require('../services/webhookService');

router.use(auth);

// Available webhook events
const AVAILABLE_EVENTS = [
  { key: 'shipment.created', label: 'Shipment Created', description: 'Fired when a new shipment is booked' },
  { key: 'shipment.picked_up', label: 'Shipment Picked Up', description: 'Fired when rider picks up parcel' },
  { key: 'shipment.in_transit', label: 'In Transit', description: 'Fired when parcel enters transit' },
  { key: 'shipment.out_for_delivery', label: 'Out for Delivery', description: 'Fired when parcel is out for final delivery' },
  { key: 'shipment.delivered', label: 'Delivered', description: 'Fired when parcel is delivered successfully' },
  { key: 'shipment.failed', label: 'Delivery Failed', description: 'Fired when delivery attempt fails' },
  { key: 'shipment.returned', label: 'Returned', description: 'Fired when parcel is returned to sender' },
  { key: 'cod.settled', label: 'COD Settled', description: 'Fired when COD payment is settled to merchant wallet' },
];

// ═══════════════════════════════════════════════════
// 1. API KEY MANAGEMENT
// ═══════════════════════════════════════════════════

// GET /api/v1/developer/keys — List merchant's API keys
router.get('/keys', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;
    if (!merchantId) return res.status(400).json({ success: false, message: 'Merchant ID required' });

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { apiKeyHash: true, apiKeyEnabled: true },
    });

    // Return masked key info (never expose full key)
    const keys = [];
    if (merchant.apiKeyHash) {
      keys.push({
        id: 'live',
        type: 'live',
        prefix: `shn_live_${merchant.apiKeyHash.substring(0, 8)}`,
        enabled: merchant.apiKeyEnabled,
        createdAt: 'Production key',
      });
    }

    // Generate test key info
    keys.push({
      id: 'test',
      type: 'test',
      prefix: `shn_test_${merchantId.substring(0, 8)}`,
      enabled: true,
      createdAt: 'Test mode key',
    });

    res.json({ success: true, data: keys });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/developer/keys/generate — Generate new API key
router.post('/keys/generate', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;
    const { type = 'live' } = req.body;

    if (!merchantId) return res.status(400).json({ success: false, message: 'Merchant ID required' });

    // Generate key
    const rawKey = `shn_${type}_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Store hash (never store raw key)
    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        apiKeyHash: keyHash,
        apiKeyEnabled: true,
      },
    });

    // Return key ONCE — never shown again
    res.status(201).json({
      success: true,
      data: {
        key: rawKey,
        type,
        prefix: `shn_${type}_${keyHash.substring(0, 8)}`,
        message: 'Save this key now — it will not be shown again.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/developer/keys/toggle — Enable/disable API key
router.patch('/keys/toggle', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;
    const { enabled } = req.body;

    await prisma.merchant.update({
      where: { id: merchantId },
      data: { apiKeyEnabled: enabled },
    });

    res.json({ success: true, data: { enabled } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/developer/keys/revoke — Revoke API key
router.delete('/keys/revoke', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;

    await prisma.merchant.update({
      where: { id: merchantId },
      data: { apiKeyHash: null, apiKeyEnabled: false },
    });

    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════
// 2. WEBHOOK MANAGEMENT
// ═══════════════════════════════════════════════════

// GET /api/v1/developer/events — List available webhook events
router.get('/events', (req, res) => {
  res.json({ success: true, data: AVAILABLE_EVENTS });
});

// GET /api/v1/developer/webhooks — List merchant's webhooks
router.get('/webhooks', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;

    const webhooks = await prisma.webhook.findMany({
      where: { merchantId },
      include: {
        _count: { select: { deliveries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: webhooks });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/developer/webhooks — Register webhook
router.post('/webhooks', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;
    const { url, events } = req.body;

    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
    if (!events?.length) return res.status(400).json({ success: false, message: 'At least one event is required' });

    // Validate events
    const invalidEvents = events.filter((e) => !AVAILABLE_EVENTS.find((ae) => ae.key === e));
    if (invalidEvents.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid events: ${invalidEvents.join(', ')}` });
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        merchantId,
        url,
        secret,
        events,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...webhook,
        message: 'Save this webhook secret — it will be used to verify signatures.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/developer/webhooks/:id — Update webhook
router.patch('/webhooks/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { url, events, isActive } = req.body;

    const webhook = await prisma.webhook.update({
      where: { id: req.params.id },
      data: {
        ...(url && { url }),
        ...(events && { events }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: webhook });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/developer/webhooks/:id
router.delete('/webhooks/:id', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.webhookDelivery.deleteMany({ where: { webhookId: req.params.id } });
    await prisma.webhook.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Webhook deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/developer/webhooks/:id/deliveries — Delivery logs
router.get('/webhooks/:id/deliveries', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const dispatcher = getWebhookDispatcher(prisma);
    const { page, limit, status } = req.query;

    const result = await dispatcher.getDeliveryLogs(req.params.id, { page, limit, status });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/developer/webhooks/deliveries/:id/retry — Retry failed delivery
router.post('/webhooks/deliveries/:id/retry', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const dispatcher = getWebhookDispatcher(prisma);
    const result = await dispatcher.retryDelivery(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════
// 3. API DOCUMENTATION
// ═══════════════════════════════════════════════════

// GET /api/v1/developer/docs — Interactive API documentation
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Shohnaat Logistics API',
      version: '1.0.0',
      baseUrl: process.env.API_URL || 'https://api.shohnaat.rahimbadsa.me',
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <your_api_key>',
        description: 'Include your API key in the Authorization header for all requests.',
      },
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/shipments',
          description: 'Create a new shipment',
          body: {
            merchantId: 'string (required)',
            consigneeName: 'string (required)',
            consigneePhone: 'string (required)',
            pickupAddressId: 'string (required)',
            deliveryAddressId: 'string (required)',
            weightKg: 'number (optional)',
            paymentType: 'COD | PREPAID',
            codAmount: 'number',
          },
        },
        {
          method: 'GET',
          path: '/api/v1/shipments/:id',
          description: 'Get shipment details',
        },
        {
          method: 'GET',
          path: '/api/v1/shipments/track/:trackingNumber',
          description: 'Track shipment by tracking number (public)',
          auth: false,
        },
        {
          method: 'GET',
          path: '/api/v1/rates/calculate',
          description: 'Calculate shipping rate',
          body: {
            destinationZoneId: 'string',
            weightKg: 'number',
            paymentType: 'COD | PREPAID',
            codAmount: 'number',
            serviceType: 'STANDARD | EXPRESS | ECONOMY',
          },
        },
        {
          method: 'POST',
          path: '/api/v1/addresses',
          description: 'Create a new address',
        },
        {
          method: 'GET',
          path: '/api/v1/addresses',
          description: 'List your addresses',
        },
      ],
      webhooks: {
        events: AVAILABLE_EVENTS,
        signature: {
          header: 'X-Shohnaat-Signature',
          algorithm: 'HMAC-SHA256',
          format: 'sha256=<hex_digest>',
          verification: 'Use your webhook secret to verify the signature matches the request body.',
        },
      },
      rateLimit: '100 requests per minute per API key',
      errors: {
        400: 'Bad Request — Invalid parameters',
        401: 'Unauthorized — Invalid or missing API key',
        404: 'Not Found — Resource does not exist',
        429: 'Too Many Requests — Rate limit exceeded',
        500: 'Internal Server Error',
      },
      sdks: [
        { language: 'Node.js', install: 'npm install @shohnaat/sdk', status: 'Coming Soon' },
        { language: 'Python', install: 'pip install shohnaat', status: 'Coming Soon' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════
// 4. API REQUEST LOGS
// ═══════════════════════════════════════════════════

// GET /api/v1/developer/logs — API request logs
router.get('/logs', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const merchantId = req.user.merchantId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { merchantId };
    const [logs, total] = await Promise.all([
      prisma.apiRequestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.apiRequestLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
