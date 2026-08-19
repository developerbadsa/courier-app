const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const logger = require('../lib/logger');

/* ──────────────────────────────────────────────────────────────────────
   BullMQ Connection (Redis)
   ────────────────────────────────────────────────────────────────────── */
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = { url: REDIS_URL };

/* ──────────────────────────────────────────────────────────────────────
   Notification Queue
   ────────────────────────────────────────────────────────────────────── */
const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

/* ──────────────────────────────────────────────────────────────────────
   Email Transporter (SMTP — configurable)
   ────────────────────────────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/* ──────────────────────────────────────────────────────────────────────
   HTML Email Templates
   ────────────────────────────────────────────────────────────────────── */
const EMAIL_TEMPLATES = {
  shipment_booked: (data) => ({
    subject: `📦 Shipment Booked — ${data.trackingNumber}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:#2563eb;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">📦 Shipment Booked</h1>
  </div>
  <div style="padding:28px;">
    <p style="color:#334155;font-size:14px;margin:0 0 16px;">Hello <strong>${data.recipientName}</strong>,</p>
    <p style="color:#334155;font-size:14px;margin:0 0 20px;">Your shipment has been booked and is awaiting pickup.</p>
    <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:0 0 20px;">
      <table style="width:100%;font-size:13px;color:#475569;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-weight:600;color:#1e293b;">Tracking Number</td><td style="text-align:right;font-family:monospace;color:#2563eb;">${data.trackingNumber}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;color:#1e293b;">Origin</td><td style="text-align:right;">${data.origin || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;color:#1e293b;">Destination</td><td style="text-align:right;">${data.destination || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;color:#1e293b;">Weight</td><td style="text-align:right;">${data.weight || 'N/A'}</td></tr>
        ${data.codAmount ? `<tr><td style="padding:4px 0;font-weight:600;color:#1e293b;">COD Amount</td><td style="text-align:right;font-weight:700;color:#059669;">$${data.codAmount}</td></tr>` : ''}
      </table>
    </div>
    <a href="${process.env.TRACKING_URL || 'https://shohnaat.rahimbadsa.me/track'}/${data.trackingNumber}" style="display:block;text-align:center;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Track Shipment →</a>
  </div>
  <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Shohnaat Logistics — Reliable Delivery, Every Time</p>
  </div>
</div></body></html>`,
  }),

  out_for_delivery: (data) => ({
    subject: `🚚 Out for Delivery — ${data.trackingNumber}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:#d97706;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">🚚 Out for Delivery</h1>
  </div>
  <div style="padding:28px;">
    <p style="color:#334155;font-size:14px;margin:0 0 16px;">Hello <strong>${data.recipientName}</strong>,</p>
    <p style="color:#334155;font-size:14px;margin:0 0 20px;">Great news! Your shipment is on its way and will be delivered soon.</p>
    <div style="background:#fef3c7;border-radius:8px;padding:16px;margin:0 0 20px;border:1px solid #fcd34d;">
      <table style="width:100%;font-size:13px;color:#92400e;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-weight:600;">Tracking Number</td><td style="text-align:right;font-family:monospace;">${data.trackingNumber}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Rider</td><td style="text-align:right;">${data.riderName || 'Assigned'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Estimated Delivery</td><td style="text-align:right;font-weight:700;">Today</td></tr>
      </table>
    </div>
    <a href="${process.env.TRACKING_URL || 'https://shohnaat.rahimbadsa.me/track'}/${data.trackingNumber}" style="display:block;text-align:center;background:#d97706;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Track Live →</a>
  </div>
  <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Shohnaat Logistics — Reliable Delivery, Every Time</p>
  </div>
</div></body></html>`,
  }),

  delivered: (data) => ({
    subject: `✅ Delivered — ${data.trackingNumber}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:#059669;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">✅ Successfully Delivered</h1>
  </div>
  <div style="padding:28px;">
    <p style="color:#334155;font-size:14px;margin:0 0 16px;">Hello <strong>${data.recipientName}</strong>,</p>
    <p style="color:#334155;font-size:14px;margin:0 0 20px;">Your shipment has been delivered successfully.</p>
    <div style="background:#ecfdf5;border-radius:8px;padding:16px;margin:0 0 20px;border:1px solid #a7f3d0;">
      <table style="width:100%;font-size:13px;color:#065f46;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-weight:600;">Tracking Number</td><td style="text-align:right;font-family:monospace;">${data.trackingNumber}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Delivered At</td><td style="text-align:right;">${data.deliveredAt || new Date().toLocaleString()}</td></tr>
        ${data.codAmount ? `<tr><td style="padding:4px 0;font-weight:600;">COD Collected</td><td style="text-align:right;font-weight:700;color:#059669;">$${data.codAmount}</td></tr>` : ''}
      </table>
    </div>
    <a href="${process.env.TRACKING_URL || 'https://shohnaat.rahimbadsa.me/track'}/${data.trackingNumber}" style="display:block;text-align:center;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">View Receipt →</a>
  </div>
  <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Shohnaat Logistics — Reliable Delivery, Every Time</p>
  </div>
</div></body></html>`,
  }),

  shipment_failed: (data) => ({
    subject: `❌ Delivery Failed — ${data.trackingNumber}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:#dc2626;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">❌ Delivery Attempt Failed</h1>
  </div>
  <div style="padding:28px;">
    <p style="color:#334155;font-size:14px;margin:0 0 16px;">Hello <strong>${data.recipientName}</strong>,</p>
    <p style="color:#334155;font-size:14px;margin:0 0 20px;">We were unable to deliver your shipment. A new attempt will be made shortly.</p>
    <div style="background:#fef2f2;border-radius:8px;padding:16px;margin:0 0 20px;border:1px solid #fecaca;">
      <table style="width:100%;font-size:13px;color:#991b1b;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-weight:600;">Tracking Number</td><td style="text-align:right;font-family:monospace;">${data.trackingNumber}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Reason</td><td style="text-align:right;">${data.reasonCode || 'Undeliverable'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Attempt #</td><td style="text-align:right;">${data.attemptNumber || 1}</td></tr>
      </table>
    </div>
  </div>
  <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Shohnaat Logistics — Reliable Delivery, Every Time</p>
  </div>
</div></body></html>`,
  }),

  pickup_scheduled: (data) => ({
    subject: `🏍️ Pickup Scheduled — ${data.pickupId}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:#7c3aed;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">🏍️ Pickup Scheduled</h1>
  </div>
  <div style="padding:28px;">
    <p style="color:#334155;font-size:14px;margin:0 0 16px;">Hello <strong>${data.recipientName}</strong>,</p>
    <p style="color:#334155;font-size:14px;margin:0 0 20px;">Your pickup has been scheduled. A rider will arrive at the designated time.</p>
    <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:0 0 20px;border:1px solid #c4b5fd;">
      <table style="width:100%;font-size:13px;color:#5b21b6;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-weight:600;">Pickup Date</td><td style="text-align:right;">${data.scheduledDate || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Time Slot</td><td style="text-align:right;">${data.timeSlot || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Vehicle</td><td style="text-align:right;">${data.vehicleType || 'Van'}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Parcels</td><td style="text-align:right;">${data.estimatedParcels || 'N/A'}</td></tr>
      </table>
    </div>
  </div>
  <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">Shohnaat Logistics — Reliable Delivery, Every Time</p>
  </div>
</div></body></html>`,
  }),
};

/* ──────────────────────────────────────────────────────────────────────
   SMS Templates (plain text for Twilio / Vonage / Plivo)
   ────────────────────────────────────────────────────────────────────── */
const SMS_TEMPLATES = {
  shipment_booked: (data) =>
    `Shohnaat: Your shipment ${data.trackingNumber} has been booked. Track: ${process.env.TRACKING_URL || 'https://shohnaat.rahimbadsa.me/track'}/${data.trackingNumber}`,
  out_for_delivery: (data) =>
    `Shohnaat: Your shipment ${data.trackingNumber} is out for delivery. Rider: ${data.riderName || 'Assigned'}. Track live: ${process.env.TRACKING_URL || 'https://shohnaat.rahimbadsa.me/track'}/${data.trackingNumber}`,
  delivered: (data) =>
    `Shohnaat: Your shipment ${data.trackingNumber} has been delivered successfully! ${data.codAmount ? `COD: $${data.codAmount}.` : ''} Thank you!`,
  shipment_failed: (data) =>
    `Shohnaat: Delivery attempt for ${data.trackingNumber} failed (${data.reasonCode || 'undeliverable'}). We'll try again soon.`,
  pickup_scheduled: (data) =>
    `Shohnaat: Pickup scheduled for ${data.scheduledDate || 'tomorrow'} (${data.timeSlot || 'morning'}). Vehicle: ${data.vehicleType || 'Van'}.`,
};

/* ──────────────────────────────────────────────────────────────────────
   Notification Settings (defaults — overridden by DB in production)
   ────────────────────────────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  email: {
    enabled: true,
    shipment_booked: true,
    out_for_delivery: true,
    delivered: true,
    shipment_failed: true,
    pickup_scheduled: true,
  },
  sms: {
    enabled: false,
    shipment_booked: false,
    out_for_delivery: true,
    delivered: true,
    shipment_failed: true,
    pickup_scheduled: false,
  },
  channels: {
    merchantEmail: true,
    consigneeEmail: true,
    merchantSms: false,
    consigneeSms: false,
  },
};

/* ──────────────────────────────────────────────────────────────────────
   Core Functions
   ────────────────────────────────────────────────────────────────────── */

/**
 * Get notification settings from DB or fallback to defaults
 */
async function getSettings(prisma) {
  try {
    const setting = await prisma.notificationSetting?.findFirst();
    if (setting) return setting.config || DEFAULT_SETTINGS;
  } catch {
    // Table might not exist yet
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save notification settings to DB
 */
async function saveSettings(prisma, config) {
  try {
    const existing = await prisma.notificationSetting?.findFirst();
    if (existing) {
      return prisma.notificationSetting.update({ where: { id: existing.id }, data: { config } });
    }
    return prisma.notificationSetting?.create({ data: { config } });
  } catch {
    // Table might not exist
  }
  return null;
}

/**
 * Enqueue a notification (adds to BullMQ queue)
 */
async function enqueueNotification({ event, recipients, data, channels }) {
  const job = await notificationQueue.add(
    'send-notification',
    { event, recipients, data, channels },
    {
      priority: event === 'shipment_failed' ? 1 : event === 'delivered' ? 2 : 3,
    }
  );
  logger.info(`[Notification] Enqueued job ${job.id} for event: ${event}`);
  return job.id;
}

/**
 * Send email via SMTP
 */
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Shohnaat Logistics" <notifications@shohnaat.com>',
      to,
      subject,
      html,
    });
    logger.info(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`[Email] Failed to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS (stub — integrate with Twilio/Vonage/Plivo in production)
 */
async function sendSMS(to, message) {
  try {
    // Production: Use Twilio/Vonage/Plivo SDK
    // const twilio = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
    // await twilio.messages.create({ body: message, to, from: TWILIO_NUMBER });

    logger.info(`[SMS] Stub sent to ${to}: ${message.substring(0, 60)}...`);
    return { success: true, provider: 'stub' };
  } catch (error) {
    logger.error(`[SMS] Failed to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification across configured channels
 */
async function sendNotification({ event, recipients, data, channels }) {
  const results = [];

  for (const recipient of recipients) {
    const { email, phone, type, name } = recipient;

    // Email channel
    if (channels?.email !== false && email) {
      const template = EMAIL_TEMPLATES[event];
      if (template) {
        const { subject, html } = template({ ...data, recipientName: name || 'Customer' });
        const result = await sendEmail(email, subject, html);
        results.push({ channel: 'email', to: email, ...result });
      }
    }

    // SMS channel
    if (channels?.sms !== false && phone) {
      const template = SMS_TEMPLATES[event];
      if (template) {
        const message = template(data);
        const result = await sendSMS(phone, message);
        results.push({ channel: 'sms', to: phone, ...result });
      }
    }
  }

  return results;
}

/**
 * High-level: notify for shipment status change
 */
async function notifyShipmentStatus(prisma, event, shipment, options = {}) {
  const settings = await getSettings(prisma);

  // Check if this event is enabled
  if (!settings.email?.[event] && !settings.sms?.[event]) {
    logger.info(`[Notification] Event ${event} is disabled in settings`);
    return null;
  }

  const recipients = [];

  // Merchant recipient
  if (settings.channels?.merchantEmail || settings.channels?.merchantSms) {
    const merchant = shipment.merchant || await prisma.user.findUnique({ where: { id: shipment.merchantId } });
    if (merchant) {
      recipients.push({
        email: settings.channels.merchantEmail ? merchant.email : null,
        phone: settings.channels.merchantSms ? merchant.phone : null,
        name: merchant.name,
        type: 'merchant',
      });
    }
  }

  // Consignee recipient
  if (settings.channels?.consigneeEmail || settings.channels?.consigneeSms) {
    const consignee = shipment.consignee;
    if (consignee) {
      recipients.push({
        email: settings.channels.consigneeEmail ? consignee.email : null,
        phone: settings.channels.consigneeSms ? consignee.phone : null,
        name: consignee.name,
        type: 'consignee',
      });
    }
  }

  if (recipients.length === 0) return null;

  return enqueueNotification({
    event,
    recipients,
    data: {
      trackingNumber: shipment.trackingNumber,
      origin: shipment.pickupAddress?.city,
      destination: shipment.deliveryAddress?.city,
      weight: shipment.actualWeight || shipment.declaredWeight,
      codAmount: shipment.codAmount,
      riderName: options.riderName,
      deliveredAt: options.deliveredAt,
      reasonCode: options.reasonCode,
      attemptNumber: shipment.deliveryAttempts,
      scheduledDate: options.scheduledDate,
      timeSlot: options.timeSlot,
      vehicleType: options.vehicleType,
      estimatedParcels: options.estimatedParcels,
    },
    channels: {
      email: settings.email?.[event] ?? true,
      sms: settings.sms?.[event] ?? false,
    },
  });
}

/**
 * High-level: notify for pickup status
 */
async function notifyPickupStatus(prisma, event, pickup, options = {}) {
  const settings = await getSettings(prisma);

  if (!settings.email?.[event] && !settings.sms?.[event]) return null;

  const merchant = pickup.merchant || await prisma.user.findUnique({ where: { id: pickup.merchantId } });

  const recipients = merchant ? [{
    email: settings.channels?.merchantEmail ? merchant.email : null,
    phone: settings.channels?.merchantSms ? merchant.phone : null,
    name: merchant.name,
    type: 'merchant',
  }] : [];

  if (recipients.length === 0) return null;

  return enqueueNotification({
    event,
    recipients,
    data: {
      pickupId: pickup.id,
      recipientName: merchant?.name || 'Merchant',
      scheduledDate: pickup.scheduledDate,
      timeSlot: pickup.timeSlot,
      vehicleType: pickup.vehicleType,
      estimatedParcels: pickup.estimatedParcels,
    },
    channels: {
      email: settings.email?.[event] ?? true,
      sms: settings.sms?.[event] ?? false,
    },
  });
}

/**
 * Get notification logs (for admin UI)
 */
async function getNotificationLogs(prisma, { page = 1, limit = 20, event, status } = {}) {
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      ...(event && { event }),
      ...(status && { status }),
    };

    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notificationLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    };
  } catch {
    return { data: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } };
  }
}

/* ──────────────────────────────────────────────────────────────────────
   BullMQ Worker — processes notification jobs
   ────────────────────────────────────────────────────────────────────── */
function createWorker(prisma) {
  const worker = new Worker(
    'notifications',
    async (job) => {
      const { event, recipients, data, channels } = job.data;
      logger.info(`[Worker] Processing job ${job.id} for event: ${event}`);

      const results = await sendNotification({ event, recipients, data, channels });

      // Log results to DB
      try {
        await prisma.notificationLog?.createMany({
          data: results.map((r) => ({
            event,
            channel: r.channel,
            recipient: r.to,
            status: r.success ? 'SENT' : 'FAILED',
            error: r.error || null,
            metadata: { jobId: job.id, trackingNumber: data.trackingNumber },
          })),
        });
      } catch {
        // Table might not exist
      }

      return results;
    },
    {
      connection,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 },
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

module.exports = {
  notificationQueue,
  createWorker,
  enqueueNotification,
  sendNotification,
  sendEmail,
  sendSMS,
  notifyShipmentStatus,
  notifyPickupStatus,
  getSettings,
  saveSettings,
  getNotificationLogs,
  EMAIL_TEMPLATES,
  SMS_TEMPLATES,
  DEFAULT_SETTINGS,
};
