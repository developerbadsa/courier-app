/**
 * Shohnaat Logistics — Enterprise Centralized Error Handler
 * Bulletproof error classification, Prisma mapping, and request tracing
 */

const logger = require('../lib/logger');

const errorHandler = (err, req, res, next) => {
  const requestId = req.id || req.headers['x-request-id'] || 'req-unknown';
  const timestamp = new Date().toISOString();

  // Log full error internally with context
  logger.error(`[${requestId}] ${err.name || 'Error'}: ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl || req.path,
    method: req.method,
    ip: req.ip,
  });

  // ── 1. Prisma ORM Database Errors ──
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    return res.status(409).json({
      success: false,
      error_code: 'DUPLICATE_RESOURCE',
      message: `A record with this ${Array.isArray(fields) ? fields.join(', ') : 'unique field'} already exists.`,
      fields,
      requestId,
      timestamp,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error_code: 'RESOURCE_NOT_FOUND',
      message: err.meta?.cause || 'The requested resource was not found.',
      requestId,
      timestamp,
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      error_code: 'FOREIGN_KEY_VIOLATION',
      message: 'Invalid relationship reference. Associated parent record does not exist.',
      field: err.meta?.field_name,
      requestId,
      timestamp,
    });
  }

  if (err.code === 'P2000') {
    return res.status(400).json({
      success: false,
      error_code: 'VALUE_TOO_LONG',
      message: 'Input value exceeds maximum allowed length for this column.',
      field: err.meta?.column_name,
      requestId,
      timestamp,
    });
  }

  if (err.code === 'P2024') {
    return res.status(503).json({
      success: false,
      error_code: 'DB_CONNECTION_TIMEOUT',
      message: 'Database connection pool timed out. Please retry in a few seconds.',
      retryAfter: 3,
      requestId,
      timestamp,
    });
  }

  // ── 2. JWT Authentication Errors ──
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error_code: 'TOKEN_EXPIRED',
      message: 'Your session has expired. Please refresh your token or log in again.',
      requestId,
      timestamp,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error_code: 'INVALID_TOKEN',
      message: 'Authentication token is invalid or malformed.',
      requestId,
      timestamp,
    });
  }

  // ── 3. File Upload / Multer Errors ──
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error_code: 'FILE_TOO_LARGE',
        message: 'Uploaded file exceeds the maximum allowed size limit (15MB).',
        requestId,
        timestamp,
      });
    }
    return res.status(400).json({
      success: false,
      error_code: 'UPLOAD_ERROR',
      message: `File upload error: ${err.message}`,
      requestId,
      timestamp,
    });
  }

  // ── 4. JSON Payload / Syntax Errors ──
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error_code: 'MALFORMED_JSON',
      message: 'Request body contains invalid JSON syntax.',
      requestId,
      timestamp,
    });
  }

  // ── 5. Standard Application / Custom Errors ──
  const statusCode = err.status || err.statusCode || 500;
  const isServerFault = statusCode >= 500;

  res.status(statusCode).json({
    success: false,
    error_code: err.code || (isServerFault ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
    message: isServerFault && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred on the server. Please contact support if the issue persists.'
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    requestId,
    timestamp,
  });
};

module.exports = errorHandler;
