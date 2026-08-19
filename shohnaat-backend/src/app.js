require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./lib/logger');
const { prisma, connectWithRetry, disconnect } = require('./lib/prisma');
const errorHandler = require('./middleware/errorHandler');

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

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Make prisma available globally to route handlers
app.locals.prisma = prisma;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically with cache headers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

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
    await connectWithRetry(5, 2000);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Shohnaat Core API running on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);
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
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

module.exports = app;
