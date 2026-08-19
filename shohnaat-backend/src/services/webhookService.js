/**
 * Webhook Dispatcher Service
 * - Event emitter for shipment state changes
 * - HMAC SHA256 signature generation
 * - Delivery with retry and exponential backoff
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class WebhookDispatcher extends EventEmitter {
  constructor(prisma) {
    super();
    this.prisma = prisma;
    this.MAX_RETRIES = 5;
    this.BASE_DELAY_MS = 1000;

    // Listen for events
    this.on('shipment.created', (data) => this._dispatch('shipment.created', data));
    this.on('shipment.picked_up', (data) => this._dispatch('shipment.picked_up', data));
    this.on('shipment.in_transit', (data) => this._dispatch('shipment.in_transit', data));
    this.on('shipment.out_for_delivery', (data) => this._dispatch('shipment.out_for_delivery', data));
    this.on('shipment.delivered', (data) => this._dispatch('shipment.delivered', data));
    this.on('shipment.failed', (data) => this._dispatch('shipment.failed', data));
    this.on('shipment.returned', (data) => this._dispatch('shipment.returned', data));
    this.on('cod.settled', (data) => this._dispatch('cod.settled', data));
  }

  /**
   * Generate HMAC SHA256 signature
   */
  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(typeof payload === 'string' ? payload : JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verify HMAC SHA256 signature
   */
  verifySignature(payload, signature, secret) {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  /**
   * Emit event for shipment status change
   */
  emitShipmentEvent(shipment, oldStatus, newStatus) {
    const eventMap = {
      PENDING: 'shipment.created',
      PICKED_UP: 'shipment.picked_up',
      IN_TRANSIT: 'shipment.in_transit',
      OUT_FOR_DELIVERY: 'shipment.out_for_delivery',
      DELIVERED: 'shipment.delivered',
      FAILED: 'shipment.failed',
      RETURNED: 'shipment.returned',
    };

    const eventName = eventMap[newStatus];
    if (eventName) {
      this.emit(eventName, {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        oldStatus,
        newStatus,
        merchantId: shipment.merchantId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit COD settled event
   */
  emitCODSettled(settlementId, merchantId, amount) {
    this.emit('cod.settled', {
      settlementId,
      merchantId,
      amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Dispatch webhooks for an event
   */
  async _dispatch(eventType, payload) {
    try {
      // Find all active webhooks subscribed to this event
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          isActive: true,
          events: { has: eventType },
        },
        include: { merchant: { select: { id: true } } },
      });

      for (const webhook of webhooks) {
        // Skip if event is for a different merchant (unless it's a system event)
        if (payload.merchantId && webhook.merchantId !== payload.merchantId) continue;

        this._deliver(webhook, eventType, payload, 0);
      }
    } catch (error) {
      console.error('Webhook dispatch error:', error.message);
    }
  }

  /**
   * Deliver webhook with retry and exponential backoff
   */
  async _deliver(webhook, eventType, payload, attempt) {
    const body = JSON.stringify({
      event: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
      webhookId: webhook.id,
    });

    const signature = this.generateSignature(body, webhook.secret);

    // Record delivery attempt
    let delivery;
    try {
      delivery = await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          shipmentId: payload.shipmentId || null,
          eventType,
          payload: JSON.parse(body),
          status: 'pending',
          attempts: attempt + 1,
        },
      });
    } catch (err) {
      console.error('Failed to create delivery record:', err.message);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shohnaat-Signature': signature,
          'X-Shohnaat-Event': eventType,
          'X-Shohnaat-Delivery': delivery.id,
          'User-Agent': 'Shohnaat-Webhook/1.0',
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { status: 'delivered', lastAttemptAt: new Date() },
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const nextAttempt = attempt + 1;
      const isRetryable = nextAttempt < this.MAX_RETRIES;

      if (isRetryable) {
        const delay = this.BASE_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { status: 'retrying', attempts: nextAttempt, lastAttemptAt: new Date() },
        });

        setTimeout(() => {
          this._deliver(webhook, eventType, payload, nextAttempt);
        }, delay);
      } else {
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { status: 'failed', lastAttemptAt: new Date() },
        });
      }
    }
  }

  /**
   * Retry a specific failed delivery
   */
  async retryDelivery(deliveryId) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery) throw new Error('Delivery not found');
    if (delivery.status === 'delivered') throw new Error('Already delivered');

    await this._deliver(delivery.webhook, delivery.eventType, delivery.payload, 0);
    return { retried: true };
  }

  /**
   * Get delivery logs for a webhook
   */
  async getDeliveryLogs(webhookId, { page = 1, limit = 20, status } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      webhookId,
      ...(status && { status }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.webhookDelivery.count({ where }),
    ]);

    return {
      data: logs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    };
  }
}

// Singleton
let instance = null;

module.exports = function getWebhookDispatcher(prisma) {
  if (!instance) {
    instance = new WebhookDispatcher(prisma);
  }
  return instance;
};
