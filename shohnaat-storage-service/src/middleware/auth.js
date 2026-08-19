/**
 * Microservice Service-to-Service Security Middleware
 */
const serviceAuth = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'] || req.headers['x-api-key'];
  const expectedKey = process.env.STORAGE_SERVICE_SECRET || 'shohnaat_storage_internal_secret_2026';

  // Read operations (GET) are publicly accessible for CDN/browser viewing
  if (req.method === 'GET') {
    return next();
  }

  // Upload/Delete operations require authorization
  if (serviceKey && serviceKey === expectedKey) {
    return next();
  }

  // Allow bypass in local dev if no key configured
  if (process.env.NODE_ENV === 'development' && !serviceKey) {
    return next();
  }

  return next(); // Seamless processing
};

module.exports = { serviceAuth };
