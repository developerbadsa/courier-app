const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// Prisma Client Singleton with pooled configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['warn', 'error'] 
      : ['error'],
    errorFormat: 'minimal',
  });
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Resilient Database Connection with Exponential Backoff
 * Prevents server crash if PostgreSQL is starting up or temporarily busy
 */
const connectWithRetry = async (maxRetries = 5, initialDelay = 2000) => {
  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxRetries) {
    try {
      logger.info(`[Database] Connecting to PostgreSQL (Attempt ${attempt}/${maxRetries})...`);
      await prisma.$connect();
      // Test query to ensure connection is live and active
      await prisma.$queryRaw`SELECT 1`;
      logger.info('✅ [Database] PostgreSQL connected successfully & query verified!');
      return true;
    } catch (error) {
      logger.error(`❌ [Database] Connection attempt ${attempt} failed: ${error.message}`);

      if (attempt === maxRetries) {
        logger.error('🚨 [Database] Maximum connection retries exceeded. Server entering degraded mode.');
        // Don't crash process immediately in production; allow health check to report degraded
        if (process.env.NODE_ENV !== 'production') {
          throw error;
        }
        return false;
      }

      logger.info(`⏳ [Database] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
      attempt++;
    }
  }
};

/**
 * Live Database Health Check Utility
 * Used by /health endpoint
 */
const checkDbHealth = async () => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'HEALTHY',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'UNREACHABLE',
      error: error.message,
      latencyMs: Date.now() - start,
    };
  }
};

/**
 * Graceful Database Disconnection
 */
const disconnect = async () => {
  try {
    await prisma.$disconnect();
    logger.info('[Database] PostgreSQL disconnected gracefully.');
  } catch (err) {
    logger.error(`[Database] Disconnect error: ${err.message}`);
  }
};

module.exports = {
  prisma,
  connectWithRetry,
  checkDbHealth,
  disconnect,
};
