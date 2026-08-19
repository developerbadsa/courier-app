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
const uploadRoutes = require('./routes/upload');
const path = require('path');

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
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected successfully!');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

module.exports = app;
