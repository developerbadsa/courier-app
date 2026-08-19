require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const storageRoutes = require('./routes/storage');
const { BASE_UPLOAD_DIR } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (configured for high-throughput media delivery)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve files statically with immutable/long-lived caching & ETag
app.use('/files', express.static(BASE_UPLOAD_DIR, {
  maxAge: '14d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

// Microservice Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'shohnaat-storage-microservice',
    status: 'HEALTHY',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', storageRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('[Storage Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Storage Service Error',
  });
});

// Start Microservice
app.listen(PORT, () => {
  console.log(`⚡ Shohnaat Dedicated Storage Microservice running on port ${PORT}`);
  console.log(`📁 File Storage Root: ${BASE_UPLOAD_DIR}`);
});
