const jwt = require('jsonwebtoken');
const { getMaintenanceSettings, isPathTargeted } = require('../services/systemSettingService');
const logger = require('../lib/logger');

// Endpoints that should never be blocked by maintenance mode
const EXEMPT_ENDPOINTS = [
  '/health',
  '/api/v1/settings/maintenance',
  '/api/v1/settings/maintenance/admin',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
];

/**
 * Global Maintenance Mode Guard Middleware for Express
 */
const maintenanceGuard = async (req, res, next) => {
  try {
    const path = (req.path || '').toLowerCase();

    // 1. Always permit exempt system & auth routes
    if (EXEMPT_ENDPOINTS.some((ep) => path.startsWith(ep))) {
      return next();
    }

    const prisma = req.app.locals.prisma;
    const config = await getMaintenanceSettings(prisma, true);

    // 2. If maintenance is not effectively active, pass through
    if (!config.effectiveEnabled) {
      return next();
    }

    // 3. Check for Emergency Secret Bypass (Header or Query parameter)
    const bypassToken = req.headers['x-maintenance-bypass'] || req.query.maint_bypass;
    if (config.bypassSecret && bypassToken === config.bypassSecret) {
      return next();
    }

    // 4. Check for Whitelisted IPs
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    if (config.allowedIps && config.allowedIps.length > 0) {
      const isIpAllowed = config.allowedIps.some((ip) => ip && clientIp && clientIp.includes(ip.trim()));
      if (isIpAllowed) {
        return next();
      }
    }

    // 5. Inspect JWT Token to determine user role (without failing if unauthenticated)
    let userRoles = [];
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userRoles = decoded.roles || [];
        req.user = decoded; // Pre-populate if valid
      } catch {
        // Invalid or expired token, treat as public
      }
    }

    // 6. Super Admin is ALWAYS exempt
    if (userRoles.includes('super_admin')) {
      return next();
    }

    // 7. Check if target scope applies to the caller's role
    const callerRole = userRoles.length > 0 ? userRoles[0] : 'public';
    const isRoleTargeted = (config.targetRoles || []).includes(callerRole);

    if (!isRoleTargeted && config.targetRoles && config.targetRoles.length > 0) {
      // Role is not in the list of targeted roles
      return next();
    }

    // 8. If readOnlyMode is true and this is a safe GET request, allow read-only
    if (config.readOnlyMode && (req.method === 'GET' || req.method === 'HEAD')) {
      return next();
    }

    // 9. Check if target pages / routes apply
    // If targetScope is 'ALL', block everything.
    // If targetScope is 'CUSTOM', check if API route maps to blocked features
    if (config.targetScope === 'CUSTOM') {
      const isBlocked = isApiRouteBlocked(path, config.targetPages || []);
      if (!isBlocked) {
        return next();
      }
    }

    // 10. Request is blocked -> Return HTTP 503
    logger.info(`[Maintenance Mode] Blocked request from role "${callerRole}" to "${req.method} ${path}"`);

    return res.status(503).json({
      success: false,
      maintenance: true,
      statusCode: 503,
      message: config.message || 'Service is temporarily offline for scheduled maintenance.',
      title: config.title || 'System Under Maintenance',
      startAt: config.startAt,
      endAt: config.endAt,
      supportContact: config.supportContact,
    });
  } catch (error) {
    logger.error('Error in maintenanceGuard middleware:', error);
    next(); // Fail open so system doesn't completely crash on error
  }
};

/**
 * Map API routes to frontend page module categories
 */
function isApiRouteBlocked(apiPath, targetPages) {
  if (!targetPages || targetPages.length === 0) return true;

  // Check direct page mappings
  const routeCategoryMap = {
    '/api/v1/shipments': ['/dashboard', '/dashboard/shipments', '/dashboard/*'],
    '/api/v1/pickups': ['/dashboard', '/dashboard/pickups', '/dashboard/*'],
    '/api/v1/addresses': ['/dashboard', '/dashboard/addresses', '/dashboard/*'],
    '/api/v1/finance': ['/dashboard', '/dashboard/finance', '/dashboard/invoices', '/dashboard/*'],
    '/api/v1/payments': ['/dashboard', '/dashboard/finance', '/dashboard/*'],
    '/api/v1/merchants': ['/dashboard', '/dashboard/*'],
    '/api/v1/riders': ['/rider', '/rider/*'],
    '/api/v1/tracking': ['/track', '/'],
    '/api/v1/live': ['/track', '/rider'],
    '/api/v1/operations': ['/admin/scan', '/admin/scan/*'],
    '/api/v1/auth/register': ['/register'],
  };

  for (const [apiPrefix, frontendRoutes] of Object.entries(routeCategoryMap)) {
    if (apiPath.startsWith(apiPrefix)) {
      const matches = frontendRoutes.some((fr) =>
        targetPages.some((tp) => tp === fr || (tp.endsWith('/*') && fr.startsWith(tp.slice(0, -2))))
      );
      if (matches) return true;
    }
  }

  // Check direct path match
  return isPathTargeted(apiPath, targetPages, 'CUSTOM');
}

module.exports = maintenanceGuard;
