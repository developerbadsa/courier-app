import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';

export const getHealthStatus = async (req: Request, res: Response) => {
  let dbStatus = 'healthy';
  let redisStatus = 'healthy';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  try {
    await redis.ping();
  } catch (err) {
    redisStatus = 'unhealthy';
  }

  const isOverallHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';

  return res.status(isOverallHealthy ? 200 : 503).json({
    status: isOverallHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      api: 'healthy',
      database: dbStatus,
      redis: redisStatus,
    },
    version: '1.0.0',
  });
};
