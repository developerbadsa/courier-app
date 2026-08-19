const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { upload, processImage, processImages } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// ──────────────────────────────────────────────────────────────
// ⚠️  AUTH NOTE: Authentication middleware intentionally skipped
//     for upload routes during initial development phase.
//     TODO: Add `authMiddleware` to all routes below before
//     production launch. Endpoints are currently PUBLIC.
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// Rate Limiting — prevent abuse
// ──────────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 30,                      // 30 uploads per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many upload requests. Please try again after 15 minutes.',
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many delete requests. Please try again later.',
  },
});

// ──────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────

// Upload single file (auto-resize images)
router.post(
  '/single',
  uploadLimiter,
  upload.single('file'),
  processImage,
  uploadController.uploadSingle
);

// Upload multiple files (max 10, auto-resize images)
router.post(
  '/multiple',
  uploadLimiter,
  upload.array('files', 10),
  processImages,
  uploadController.uploadMultiple
);

// Upload KYC document (Trade License / Tax ID)
router.post(
  '/kyc',
  uploadLimiter,
  upload.single('document'),
  processImage,
  uploadController.uploadKYCDocument
);

// Upload Rider Proof of Delivery (Signature / Photo)
router.post(
  '/pod',
  uploadLimiter,
  upload.single('asset'),
  processImage,
  uploadController.uploadPOD
);

// Delete uploaded file
router.delete(
  '/:category/:filename',
  deleteLimiter,
  uploadController.deleteFile
);

module.exports = router;
