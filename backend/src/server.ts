import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { initJobWorkers } from './jobs/index.js';

const startServer = async () => {
  const app = createApp();

  // Initialize background queues & workers
  try {
    initJobWorkers();
  } catch (err) {
    logger.warn({ err }, 'Worker initialization skipped or deferred');
  }

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Shohnaat Logistics Server running on port ${config.port} [${config.env}]`);
    logger.info(`👉 API Health endpoint: http://localhost:${config.port}/health`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
