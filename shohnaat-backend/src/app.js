require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./lib/logger');
const { requestLoggerMiddleware } = require('./lib/logger');
const { prisma, connectWithRetry, disconnect } = require('./lib/prisma');
const errorHandler = require('./middleware/errorHandler');
const { helmetMiddleware, requestId, inputSanitizer, sqlInjectionGuard, rateLimiter, corsOptions } = require('./middleware/security');


// Routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchants');
const shipmentRoutes = require('./routes/shipments');
const riderRoutes = require('./routes/riders');
const pickupRoutes = require('./routes/pickups');
const uploadRoutes = require('./routes/upload');
const rateRoutes = require('./routes/rates');
const hubRoutes = require('./routes/hubs');
const zoneRoutes = require('./routes/zones');
const auditLogRoutes = require('./routes/auditLogs');
const financeRoutes = require('./routes/finance');
const paymentRoutes = require('./routes/payments');
const addressRoutes = require('./routes/addresses');
const manifestRoutes = require('./routes/manifests');
const developerRoutes = require('./routes/developer');
const trackingRoutes = require('./routes/tracking');
const notificationRoutes = require('./routes/notifications');
const securityRoutes = require('./routes/security');
const liveTrackingRoutes = require('./routes/liveTracking');
const { createWorker: createNotificationWorker } = require('./services/notificationService');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Make prisma available globally to route handlers
app.locals.prisma = prisma;

// Security Middleware
app.use(helmetMiddleware);
app.use(requestId);
app.use(corsOptions);
app.use(rateLimiter);
app.use(inputSanitizer);
app.use(sqlInjectionGuard);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically with cache headers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

// Pro Request Logging & Latency Telemetry
app.use(requestLoggerMiddleware);


// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/merchants', merchantRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1/riders', riderRoutes);
app.use('/api/v1/pickups', pickupRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/rates', rateRoutes);
app.use('/api/v1/hubs', hubRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/operations', manifestRoutes);
app.use('/api/v1/developer', developerRoutes);
app.use('/api/v1/tracking', trackingRoutes); // PUBLIC — no auth
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/live', liveTrackingRoutes); // SSE live tracking

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`,
  });
});

// Central Error handler
app.use(errorHandler);

// Start server with resilient DB retry
const start = async () => {
  try {
    const dbConnected = await connectWithRetry(5, 2000);

    if (!dbConnected) {
      logger.warn('⚠️  Server starting in DEGRADED mode — DB unavailable. Some routes will fail.');
    }

    // Start BullMQ notification worker (graceful fallback if Redis is down)
    try {
      createNotificationWorker(prisma);
      console.log('📧 Notification worker started (BullMQ)');
    } catch (err) {
      logger.warn('⚠️  Notification worker skipped (Redis unavailable):', err.message);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      const mode = dbConnected ? '✅' : '⚠️  DEGRADED';
      console.log(`${mode} Shohnaat Core API running on port ${PORT}`);
      logger.info(`Server running on port ${PORT} [${dbConnected ? 'healthy' : 'degraded'}]`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal server error:', error.message);
    process.exit(1);
  }
};

// Global safety traps to prevent process crashes on edge-case async errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection caught:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception caught:', error.message, error.stack);
});

start();

module.exports = app;

