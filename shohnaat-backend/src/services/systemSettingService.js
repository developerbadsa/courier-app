const logger = require('../lib/logger');

const DEFAULT_MAINTENANCE_CONFIG = {
  isEnabled: false,
  title: 'System Under Scheduled Maintenance',
  message: 'We are currently performing essential platform upgrades to improve performance and reliability. The affected services will be restored shortly.',
  startAt: null,
  endAt: null,
  targetScope: 'CUSTOM', // 'ALL' | 'CUSTOM'
  targetRoles: ['merchant', 'rider', 'public'], // 'merchant', 'rider', 'operator', 'public'
  targetPages: ['/dashboard', '/rider', '/track'], // specific routes/prefixes
  allowedRoles: ['super_admin'],
  allowedIps: [],
  bypassSecret: 'shohnaat_maint_2026',
  supportContact: {
    phone: '+880 1700-000000',
    email: 'support@shohnaat.com',
  },
  readOnlyMode: false,
  updatedBy: 'System',
  updatedAt: new Date().toISOString(),
};

// In-memory cache for ultra-fast lookup on every request
let cachedMaintenanceConfig = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds

/**
 * Get maintenance settings from DB with fallback & in-memory cache
 */
const getMaintenanceSettings = async (prisma, isAdmin = false) => {
  const now = Date.now();
  if (cachedMaintenanceConfig && (now - lastCacheTime < CACHE_TTL_MS)) {
    return formatSettingsResponse(cachedMaintenanceConfig, isAdmin);
  }

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'maintenance' },
    });

    if (setting && setting.value) {
      cachedMaintenanceConfig = {
        ...DEFAULT_MAINTENANCE_CONFIG,
        ...(typeof setting.value === 'object' ? setting.value : JSON.parse(setting.value)),
        updatedAt: setting.updatedAt.toISOString(),
        updatedBy: setting.updatedBy || 'Super Admin',
      };
    } else {
      cachedMaintenanceConfig = { ...DEFAULT_MAINTENANCE_CONFIG };
    }
  } catch (error) {
    logger.warn('Error reading maintenance settings from DB (using defaults/cache):', error.message);
    if (!cachedMaintenanceConfig) {
      cachedMaintenanceConfig = { ...DEFAULT_MAINTENANCE_CONFIG };
    }
  }

  lastCacheTime = Date.now();
  return formatSettingsResponse(cachedMaintenanceConfig, isAdmin);
};

/**
 * Format response depending on whether requester is super admin or public
 */
const formatSettingsResponse = (config, isAdmin) => {
  // Check if scheduled maintenance is currently active based on start/end dates
  const isTimeActive = evaluateScheduleActive(config);
  const effectiveEnabled = Boolean(config.isEnabled && isTimeActive);

  if (isAdmin) {
    return {
      ...config,
      effectiveEnabled,
    };
  }

  // Sanitized public config (hide allowedIps, bypassSecret)
  return {
    isEnabled: effectiveEnabled,
    rawEnabled: config.isEnabled,
    title: config.title,
    message: config.message,
    startAt: config.startAt,
    endAt: config.endAt,
    targetScope: config.targetScope,
    targetRoles: config.targetRoles || [],
    targetPages: config.targetPages || [],
    supportContact: config.supportContact,
    readOnlyMode: Boolean(config.readOnlyMode),
    updatedAt: config.updatedAt,
  };
};

// Active SSE client connections for real-time maintenance updates
const sseSubscribers = new Set();

/**
 * Register an SSE client connection
 */
const addSseSubscriber = (res) => {
  sseSubscribers.add(res);
  res.on('close', () => {
    sseSubscribers.delete(res);
  });
};

/**
 * Broadcast maintenance state changes to all connected SSE clients
 */
const broadcastMaintenanceUpdate = (config) => {
  const publicData = formatSettingsResponse(config, false);
  const eventPayload = `event: maintenance_update\ndata: ${JSON.stringify(publicData)}\n\n`;

  for (const client of sseSubscribers) {
    try {
      client.write(eventPayload);
    } catch {
      sseSubscribers.delete(client);
    }
  }
};

/**
 * Check if maintenance schedule dates are active
 */
const evaluateScheduleActive = (config) => {
  if (!config.isEnabled) return false;
  const now = new Date();

  // If a future start time is scheduled, wait until that time
  if (config.startAt) {
    const start = new Date(config.startAt);
    if (!isNaN(start.getTime()) && now < start) {
      return false; // Scheduled for later
    }
  }

  // If endAt is specified
  if (config.endAt) {
    const end = new Date(config.endAt);
    if (!isNaN(end.getTime())) {
      // If end date is in the future, it's active
      if (now <= end) {
        return true;
      }
      // If end date has passed, and was set specifically for a past window,
      // but isEnabled was NOT explicitly turned off, treat as finished unless
      // startAt was also cleared.
      return false; // Expired schedule
    }
  }

  // No schedule restrictions -> active immediately
  return true;
};

/**
 * Save maintenance settings to DB, invalidate cache, log audit, and broadcast
 */
const saveMaintenanceSettings = async (prisma, newConfig, actorUser = null) => {
  // If explicitly enabling and no fresh endAt provided, or endAt is in the past, clear stale endAt
  if (newConfig.isEnabled === true && newConfig.endAt) {
    const end = new Date(newConfig.endAt);
    if (!isNaN(end.getTime()) && end <= new Date()) {
      newConfig.endAt = null; // Clear expired end timestamp so lockdown is effective
    }
  }

  const mergedConfig = {
    ...DEFAULT_MAINTENANCE_CONFIG,
    ...(cachedMaintenanceConfig || {}),
    ...newConfig,
    updatedAt: new Date().toISOString(),
    updatedBy: actorUser?.name || actorUser?.email || 'Super Admin',
  };

  try {
    const saved = await prisma.systemSetting.upsert({
      where: { key: 'maintenance' },
      create: {
        key: 'maintenance',
        value: mergedConfig,
        updatedBy: actorUser?.id || null,
      },
      update: {
        value: mergedConfig,
        updatedBy: actorUser?.id || null,
      },
    });

    // Write to audit log
    try {
      if (prisma.auditLog) {
        await prisma.auditLog.create({
          data: {
            actorId: actorUser?.id || null,
            action: 'UPDATE_MAINTENANCE_SETTINGS',
            entityType: 'SystemSetting',
            entityId: saved.id,
            diff: {
              isEnabled: mergedConfig.isEnabled,
              targetScope: mergedConfig.targetScope,
              targetRoles: mergedConfig.targetRoles,
              targetPages: mergedConfig.targetPages,
              title: mergedConfig.title,
            },
            ipAddress: actorUser?.ip || null,
            userAgent: actorUser?.userAgent || null,
          },
        });
      }
    } catch (auditErr) {
      logger.warn('Failed to record audit log for maintenance settings:', auditErr.message);
    }

    cachedMaintenanceConfig = mergedConfig;
    lastCacheTime = Date.now();

    // Instant real-time push to all connected tabs/browsers/clients
    broadcastMaintenanceUpdate(mergedConfig);

    return mergedConfig;
  } catch (error) {
    logger.error('Failed to save maintenance settings:', error.message);
    // Keep in memory anyway
    cachedMaintenanceConfig = mergedConfig;
    lastCacheTime = Date.now();
    broadcastMaintenanceUpdate(mergedConfig);
    return mergedConfig;
  }
};

/**
 * Match a requested path with configured target paths
 */
const isPathTargeted = (currentPath, targetPages = [], targetScope = 'CUSTOM') => {
  if (targetScope === 'ALL') return true;
  if (!targetPages || targetPages.length === 0) return false;

  const normalizedPath = (currentPath || '/').toLowerCase().split('?')[0];

  return targetPages.some((pattern) => {
    if (!pattern) return false;
    const p = pattern.trim().toLowerCase();

    // Exact match
    if (normalizedPath === p) return true;

    // Root path: '/' matches '/' exactly
    if (p === '/') return normalizedPath === '/';

    // Wildcard match: e.g. "/dashboard/*" or "/rider/*"
    if (p.endsWith('/*')) {
      const base = p.slice(0, -2);
      return normalizedPath === base || normalizedPath.startsWith(base + '/');
    }

    // Prefix match
    if (normalizedPath.startsWith(p + '/')) return true;

    return false;
  });
};

module.exports = {
  DEFAULT_MAINTENANCE_CONFIG,
  getMaintenanceSettings,
  saveMaintenanceSettings,
  isPathTargeted,
  evaluateScheduleActive,
  addSseSubscriber,
  broadcastMaintenanceUpdate,
};
