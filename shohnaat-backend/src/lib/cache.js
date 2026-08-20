/**
 * Shohnaat Logistics — Resilient Redis Caching Engine
 * Sub-millisecond read layer with graceful memory fallback
 */

const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;
let isRedisAvailable = false;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts, fallback to DB
      }
      return Math.min(times * 500, 2000);
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redisClient.connect()
    .then(() => {
      isRedisAvailable = true;
      console.log('⚡ Redis Cache Engine: Connected & Active');
    })
    .catch((err) => {
      isRedisAvailable = false;
      logger.warn(`Redis Cache unavailable (falling back to direct DB): ${err.message}`);
    });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
  });

  redisClient.on('close', () => {
    isRedisAvailable = false;
  });
} catch (e) {
  isRedisAvailable = false;
  logger.warn('Redis Cache initialization bypassed:', e.message);
}

/**
 * Get value from cache
 */
async function get(key) {
  if (!isRedisAvailable || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn(`Cache get failed for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
async function set(key, value, ttlSeconds = 300) {
  if (!isRedisAvailable || !redisClient) return false;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, 'EX', ttlSeconds);
    return true;
  } catch (err) {
    logger.warn(`Cache set failed for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Delete a specific key
 */
async function del(key) {
  if (!isRedisAvailable || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    logger.warn(`Cache del failed for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Invalidate keys matching a wildcard pattern (e.g. 'tracking:*')
 */
async function delByPattern(pattern) {
  if (!isRedisAvailable || !redisClient) return false;
  try {
    const stream = redisClient.scanStream({
      match: pattern,
      count: 100,
    });

    stream.on('data', (keys) => {
      if (keys.length) {
        const pipeline = redisClient.pipeline();
        keys.forEach((k) => pipeline.del(k));
        pipeline.exec();
      }
    });
    return true;
  } catch (err) {
    logger.warn(`Cache delByPattern failed for pattern "${pattern}":`, err.message);
    return false;
  }
}

/**
 * Express Middleware for automatic GET route response caching
 * @param {string} keyPrefix
 * @param {number} ttlSeconds
 */
function cacheMiddleware(keyPrefix = 'route', ttlSeconds = 60) {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !isRedisAvailable) {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cached = await get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept res.json to cache response before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          set(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
}

module.exports = {
  get,
  set,
  del,
  delByPattern,
  cacheMiddleware,
  isAvailable: () => isRedisAvailable,
};
