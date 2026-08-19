import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

// Notification & Webhook Queue
export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const webhookQueue = new Queue('webhooks', {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  },
});

// Worker setup
export const initJobWorkers = () => {
  const notificationWorker = new Worker(
    'notifications',
    async (job) => {
      logger.info({ jobId: job.id, name: job.name, data: job.data }, 'Processing notification job');
      // Handlers for WhatsApp BSP, SMS, or Email
      return { success: true };
    },
    { connection: redis }
  );

  notificationWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Notification job completed');
  });

  notificationWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Notification job failed');
  });

  logger.info('🚀 BullMQ Workers initialized');
};
