require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const logger = require('./lib/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchants');
const shipmentRoutes = require('./routes/shipments');
const riderRoutes = require('./routes/riders');
const pickupRoutes = require('./routes/pickups');

// Initialize
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Make prisma available globally
app.locals.prisma = prisma;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

module.exports = app;
