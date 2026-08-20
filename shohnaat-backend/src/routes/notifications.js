const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  getSettings,
  saveSettings,
  getNotificationLogs,
  enqueueNotification,
  notificationQueue,
  DEFAULT_SETTINGS,
} = require('../services/notificationService');

// All notification settings routes require admin role
router.use(auth);
router.use(requireRole('super_admin', 'operator'));

// GET /api/v1/notifications/settings — Get notification settings
router.get('/settings', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const settings = await getSettings(prisma);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/notifications/settings — Update notification settings
router.patch('/settings', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { email, sms, channels } = req.body;

    const config = {
      email: { ...DEFAULT_SETTINGS.email, ...email },
      sms: { ...DEFAULT_SETTINGS.sms, ...sms },
      channels: { ...DEFAULT_SETTINGS.channels, ...channels },
    };

    await saveSettings(prisma, config);
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/logs — Get notification delivery logs
router.get('/logs', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page, limit, event, status } = req.query;
    const result = await getNotificationLogs(prisma, { page, limit, event, status });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/stats — Get notification statistics
router.get('/stats', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    let stats = { sent: 0, failed: 0, total: 0, byEvent: {}, byChannel: { email: 0, sms: 0 } };

    try {
      const logs = await prisma.notificationLog?.findMany() || [];
      stats.total = logs.length;
      stats.sent = logs.filter(l => l.status === 'SENT').length;
      stats.failed = logs.filter(l => l.status === 'FAILED').length;

      for (const log of logs) {
        stats.byEvent[log.event] = (stats.byEvent[log.event] || 0) + 1;
        if (log.channel === 'email') stats.byChannel.email++;
        if (log.channel === 'sms') stats.byChannel.sms++;
      }
    } catch {
      // Table might not exist
    }

    // Queue stats
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        notificationQueue.getWaitingCount(),
        notificationQueue.getActiveCount(),
        notificationQueue.getCompletedCount(),
        notificationQueue.getFailedCount(),
      ]);
      stats.queue = { waiting, active, completed, failed };
    } catch {
      stats.queue = { waiting: 0, active: 0, completed: 0, failed: 0 };
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/notifications/send — Manually send a test notification
router.post('/send', async (req, res, next) => {
  try {
    const { event, email, phone, data } = req.body;

    if (!event || !email) {
      return res.status(400).json({ success: false, message: 'event and email required' });
    }

    const jobId = await enqueueNotification({
      event,
      recipients: [{ email, phone, name: 'Test User', type: 'admin' }],
      data: data || { trackingNumber: 'TEST-0001', origin: 'Austin, TX', destination: 'Miami, FL', weight: '2.5 kg' },
      channels: { email: true, sms: !!phone },
    });

    res.json({ success: true, data: { jobId, message: 'Test notification queued' } });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/notifications/queue — Get queue status
router.get('/queue', async (req, res) => {
  try {
    if (!notificationQueue) {
      return res.json({
        success: true,
        data: { status: 'DISCONNECTED', waiting: 0, active: 0, completed: 0, failed: 0, total: 0 },
      });
    }

    const [waiting, active, completed, failed] = await Promise.all([
      notificationQueue.getWaitingCount(),
      notificationQueue.getActiveCount(),
      notificationQueue.getCompletedCount(),
      notificationQueue.getFailedCount(),
    ]);

    res.json({
      success: true,
      data: {
        status: 'CONNECTED',
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: { status: 'DISCONNECTED', error: error.message, waiting: 0, active: 0, completed: 0, failed: 0, total: 0 },
    });
  }
});

module.exports = router;
