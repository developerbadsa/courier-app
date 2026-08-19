const express = require('express');
const router = express.Router();
const { checkDbHealth } = require('../lib/prisma');

router.get('/', async (req, res) => {
  const dbHealth = await checkDbHealth();
  const isHealthy = dbHealth.status === 'HEALTHY';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'Shohnaat Logistics API & Database are fully operational' : 'Database connection degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth,
  });
});

module.exports = router;
