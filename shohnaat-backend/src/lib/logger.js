/**
 * Shohnaat Logistics — Enterprise Multi-Category Pro Logger
 * Built on high-performance Pino with contextual child loggers,
 * specialized security/audit channels, and structured error categorization.
 */

const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const LOGS_DIR = path.join(process.cwd(), 'logs');
try {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
} catch (e) {
  // Graceful fallback if filesystem is read-only
}

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Custom Serializers for Clean Error and Request Formatting
const serializers = {
  err: pino.stdSerializers.err,
  req: (req) => ({
    id: req.id || req.headers?.['x-request-id'],
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress,
    userId: req.user?.id || 'anonymous',
    role: req.user?.roles?.[0] || 'guest',
  }),
  res: (res) => ({
    statusCode: res.statusCode,
  }),
};

// Base Pino Configuration
const basePino = pino({
  level: logLevel,
  serializers,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '{levelLabel} - {msg}',
        },
      }
    : undefined,
});

/**
 * Enterprise Pro Logger Wrapper with Specialized Domains
 */
class ProLogger {
  constructor(instance) {
    this.pino = instance;
  }

  // ── 1. Standard Logging Levels ──
  info(msg, meta = {}) {
    this.pino.info(meta, msg);
  }

  debug(msg, meta = {}) {
    this.pino.debug(meta, msg);
  }

  warn(msg, meta = {}) {
    this.pino.warn(meta, msg);
  }

  // ── 2. Categorized Error Logging with Error Object Normalization ──
  error(msg, err = null, meta = {}) {
    const errorPayload = err instanceof Error
      ? { err, ...meta }
      : typeof err === 'object' && err !== null
      ? { ...err, ...meta }
      : { message: err, ...meta };

    this.pino.error(errorPayload, msg);
  }

  fatal(msg, err = null, meta = {}) {
    const errorPayload = err instanceof Error ? { err, ...meta } : { ...meta, error: err };
    this.pino.fatal(errorPayload, `🔥 [FATAL] ${msg}`);

    // Trigger instant emergency DB backup snapshot
    try {
      const { triggerEmergencyBackup } = require('../services/backupService');
      triggerEmergencyBackup(`FATAL: ${msg}`).catch(() => {});
    } catch (e) {
      // Non-blocking
    }
  }


  // ── 3. Security & Threat Channel (WAF, Rate Limits, Failed Logins, SQL Injection) ──
  security(event, meta = {}) {
    const securityPayload = {
      category: 'SECURITY',
      event,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    this.pino.warn(securityPayload, `🚨 [SECURITY_ALERT] ${event}`);
  }

  // ── 4. Financial & Administrative Audit Channel (Immutable Action Trail) ──
  audit(action, actor = {}, details = {}) {
    const auditPayload = {
      category: 'AUDIT',
      action,
      actor: {
        id: actor.id || 'system',
        name: actor.name || 'Automated Worker',
        role: actor.role || 'system',
      },
      details,
      timestamp: new Date().toISOString(),
    };
    this.pino.info(auditPayload, `📋 [AUDIT_LOG] ${action} by ${auditPayload.actor.name}`);
  }

  // ── 5. Performance & Slow Query Telemetry ──
  performance(operation, durationMs, meta = {}) {
    const isSlow = durationMs > 300;
    const perfPayload = {
      category: 'PERFORMANCE',
      operation,
      durationMs: `${durationMs.toFixed(2)}ms`,
      isSlow,
      ...meta,
    };

    if (isSlow) {
      this.pino.warn(perfPayload, `⚠️ [SLOW_OPERATION] ${operation} took ${perfPayload.durationMs}`);
    } else {
      this.pino.debug(perfPayload, `⚡ [PERF] ${operation} finished in ${perfPayload.durationMs}`);
    }
  }

  // ── 6. Contextual Child Logger (Scoped to specific Request / Tenant / Worker) ──
  child(bindings = {}) {
    return new ProLogger(this.pino.child(bindings));
  }
}

const proLogger = new ProLogger(basePino);

/**
 * Express Middleware for Request-Scoped Child Logger & Performance Tracking
 */
function requestLoggerMiddleware(req, res, next) {
  const start = process.hrtime();
  const requestId = req.id || req.headers['x-request-id'] || `req-${Date.now().toString(36)}`;
  
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Attach contextual child logger to req.log
  req.log = proLogger.child({
    requestId,
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    method: req.method,
    path: req.originalUrl || req.path,
  });

  // Track response completion and latency
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000) + (nanoseconds / 1000000);
    const statusCode = res.statusCode;

    const logMeta = {
      statusCode,
      durationMs: `${durationMs.toFixed(2)}ms`,
      userId: req.user?.id || null,
      merchantId: req.user?.merchantId || null,
    };

    if (statusCode >= 500) {
      req.log.error(`HTTP ${req.method} ${req.originalUrl || req.path} ${statusCode} (${logMeta.durationMs})`, null, logMeta);
    } else if (statusCode >= 400) {
      req.log.warn(`HTTP ${req.method} ${req.originalUrl || req.path} ${statusCode} (${logMeta.durationMs})`, logMeta);
    } else {
      req.log.info(`HTTP ${req.method} ${req.originalUrl || req.path} ${statusCode} (${logMeta.durationMs})`, logMeta);
    }
  });

  next();
}

module.exports = proLogger;
module.exports.requestLoggerMiddleware = requestLoggerMiddleware;
module.exports.ProLogger = ProLogger;
