const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  getMaintenanceSettings,
  saveMaintenanceSettings,
  DEFAULT_MAINTENANCE_CONFIG,
  addSseSubscriber,
} = require('../services/systemSettingService');

// ── Public Maintenance Status Endpoint ──
// Used by frontend interceptors, clients, and mobile app to check system health
router.get('/maintenance', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const settings = await getMaintenanceSettings(prisma, false);
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

// ── Real-Time Live Maintenance Status Stream (SSE) ──
// Subscribes browsers and devices to instant push updates on maintenance status changes
router.get('/maintenance/live', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send initial state immediately
    const current = await getMaintenanceSettings(prisma, false);
    res.write(`event: initial_state\ndata: ${JSON.stringify(current)}\n\n`);

    // Register subscriber for live push broadcasts
    addSseSubscriber(res);

    // Heartbeat ping every 25 seconds
    const pingTimer = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(pingTimer);
    });
  } catch (error) {
    res.status(500).end();
  }
});

// ── Admin-Only Endpoints ──

// GET /api/v1/settings/maintenance/admin — Full config for Super Admin
router.get('/maintenance/admin', auth, requireRole('super_admin', 'admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const settings = await getMaintenanceSettings(prisma, true);
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/settings/maintenance — Update Maintenance Mode Configuration
router.patch('/maintenance', auth, requireRole('super_admin', 'admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const {
      isEnabled,
      title,
      message,
      startAt,
      endAt,
      targetScope,
      targetRoles,
      targetPages,
      allowedIps,
      bypassSecret,
      supportContact,
      readOnlyMode,
    } = req.body;

    const actorUser = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    };

    const updatePayload = {};
    if (typeof isEnabled === 'boolean') updatePayload.isEnabled = isEnabled;
    if (typeof title === 'string') updatePayload.title = title.trim();
    if (typeof message === 'string') updatePayload.message = message.trim();
    if (startAt !== undefined) updatePayload.startAt = startAt || null;
    if (endAt !== undefined) updatePayload.endAt = endAt || null;
    if (targetScope && ['ALL', 'CUSTOM'].includes(targetScope)) updatePayload.targetScope = targetScope;
    if (Array.isArray(targetRoles)) updatePayload.targetRoles = targetRoles;
    if (Array.isArray(targetPages)) updatePayload.targetPages = targetPages;
    if (Array.isArray(allowedIps)) updatePayload.allowedIps = allowedIps;
    if (typeof bypassSecret === 'string') updatePayload.bypassSecret = bypassSecret.trim();
    if (supportContact && typeof supportContact === 'object') {
      updatePayload.supportContact = {
        phone: supportContact.phone || DEFAULT_MAINTENANCE_CONFIG.supportContact.phone,
        email: supportContact.email || DEFAULT_MAINTENANCE_CONFIG.supportContact.email,
      };
    }
    if (typeof readOnlyMode === 'boolean') updatePayload.readOnlyMode = readOnlyMode;

    const updated = await saveMaintenanceSettings(prisma, updatePayload, actorUser);

    res.json({
      success: true,
      message: `Maintenance Mode ${updated.isEnabled ? 'ENABLED' : 'DISABLED'} successfully.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/settings/maintenance/audit — View maintenance change history
router.get('/maintenance/audit', auth, requireRole('super_admin', 'admin'), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    let logs = [];

    try {
      if (prisma.auditLog) {
        logs = await prisma.auditLog.findMany({
          where: {
            action: 'UPDATE_MAINTENANCE_SETTINGS',
          },
          include: {
            actor: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
      }
    } catch {
      // Table might not have records
    }

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
