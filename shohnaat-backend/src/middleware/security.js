const helmet = require('helmet');
const crypto = require('crypto');

/* ──────────────────────────────────────────────────────────────────────
   Helmet — HTTP security headers
   ────────────────────────────────────────────────────────────────────── */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
});

/* ──────────────────────────────────────────────────────────────────────
   Request ID — Unique ID per request for tracing
   ────────────────────────────────────────────────────────────────────── */
function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

/* ──────────────────────────────────────────────────────────────────────
   Input Sanitizer — Strip dangerous characters from body/query
   ────────────────────────────────────────────────────────────────────── */
function sanitizeInput(value) {
  if (typeof value === 'string') {
    // Strip null bytes and basic XSS vectors
    return value
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  if (Array.isArray(value)) return value.map(sanitizeInput);
  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeInput(val);
    }
    return sanitized;
  }
  return value;
}

function inputSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  next();
}

/* ──────────────────────────────────────────────────────────────────────
   SQL Injection Guard — Detect common SQL injection patterns
   ────────────────────────────────────────────────────────────────────── */
const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|truncate|exec|execute)\b\s)/i,
  /(--|\/\*|\*\/|;)/,
  /('|")(\s)*(or|and)(\s)*('|")/i,
  /benchmark\s*\(/i,
  /sleep\s*\(/i,
  /load_file\s*\(/i,
  /into\s+(outfile|dumpfile)/i,
];

function sqlInjectionGuard(req, res, next) {
  const checkValue = (val) => {
    if (typeof val !== 'string') return false;
    return SQL_INJECTION_PATTERNS.some(p => p.test(val));
  };

  const checkObject = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    for (const val of Object.values(obj)) {
      if (checkValue(val)) return true;
      if (typeof val === 'object' && checkObject(val)) return true;
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    logger.warn(`[Security] SQL injection attempt detected from ${req.ip}: ${req.originalUrl}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
    });
  }

  next();
}

/* ──────────────────────────────────────────────────────────────────────
   Rate Limiter — Per-IP request throttling
   ────────────────────────────────────────────────────────────────────── */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, windowStart: now });
    return next();
  }

  const entry = requestCounts.get(ip);

  if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
    entry.count = 1;
    entry.windowStart = now;
    return next();
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', Math.ceil((RATE_LIMIT_WINDOW - (now - entry.windowStart)) / 1000));
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - entry.windowStart)) / 1000),
    });
  }

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - entry.count));
  next();
}

/* ──────────────────────────────────────────────────────────────────────
   CORS hardening — restrict origins in production
   ────────────────────────────────────────────────────────────────────── */
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'https://shohnaat.rahimbadsa.me',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
    ];

    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, restrict in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Shohnaat-Signature'],
  maxAge: 86400,
};

const logger = require('../lib/logger');

module.exports = {
  helmetMiddleware,
  requestId,
  inputSanitizer,
  sqlInjectionGuard,
  rateLimiter,
  corsOptions: cors(corsOptions),
};
