const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);
router.use(requireRole('super_admin', 'operator'));

// GET /api/v1/audit-logs — List audit logs with filters
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const {
      page = 1,
      limit = 50,
      entityType,
      entityId,
      actorId,
      action,
      startDate,
      endDate,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(actorId && { actorId }),
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper: create audit log entry (exported for use by other routes)
async function createAuditLog(prisma, { actorId, action, entityType, entityId, diff, req }) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        diff: diff || undefined,
        ipAddress: req?.ip || undefined,
        userAgent: req?.get?.('user-agent') || undefined,
      },
    });
  } catch (err) {
    // Non-critical — don't throw
    console.error('Audit log error:', err.message);
  }
}

module.exports = router;
module.exports.createAuditLog = createAuditLog;
