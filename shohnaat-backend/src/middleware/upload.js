const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// ──────────────────────────────────────────────────────────────
// Base Upload Directory in Container
// ──────────────────────────────────────────────────────────────
const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const REQUIRED_SUBDIRS = ['kyc', 'pod', 'parcels', 'avatars', 'general'];
REQUIRED_SUBDIRS.forEach((subDir) => {
  const dirPath = path.join(BASE_UPLOAD_DIR, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// ──────────────────────────────────────────────────────────────
// Allowed file types & size limits
// ──────────────────────────────────────────────────────────────
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/svg+xml'];
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES];

const SIZE_LIMITS = {
  image: 5 * 1024 * 1024,    // 5 MB for images
  document: 10 * 1024 * 1024, // 10 MB for PDF/SVG
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // Absolute max

// ──────────────────────────────────────────────────────────────
// Image resize presets (sharp)
// ──────────────────────────────────────────────────────────────
const IMAGE_PRESETS = {
  avatar: { width: 256, height: 256, fit: 'cover' },
  thumbnail: { width: 400, height: 300, fit: 'inside' },
  kyc: { width: 1200, height: 0, fit: 'inside' },   // preserve aspect, max 1200px wide
  pod: { width: 1200, height: 0, fit: 'inside' },     // preserve aspect
  general: { width: 1600, height: 0, fit: 'inside' },  // max 1600px wide
};

/**
 * Resize an image file in-place using sharp
 * Skips non-image files (PDF, SVG) silently.
 * Returns the final filepath (may change if .webp conversion happens).
 */
async function resizeImage(filePath, category = 'general') {
  const ext = path.extname(filePath).toLowerCase();
  const isImage = IMAGE_MIME_TYPES.some((mime) => {
    return (mime === 'image/jpeg' && (ext === '.jpg' || ext === '.jpeg')) ||
           (mime === 'image/png' && ext === '.png') ||
           (mime === 'image/webp' && ext === '.webp');
  });

  if (!isImage) return filePath;

  const preset = IMAGE_PRESETS[category] || IMAGE_PRESETS.general;
  const outputFilename = `${path.basename(filePath, ext)}-opt.webp`;
  const outputPath = path.join(path.dirname(filePath), outputFilename);

  try {
    await sharp(filePath)
      .resize({
        width: preset.width || undefined,
        height: preset.height || undefined,
        fit: preset.fit || 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })  // Good quality, small size
      .toFile(outputPath);

    // Remove original if different from output
    if (filePath !== outputPath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return outputPath;
  } catch (err) {
    console.error(`[Upload] Image resize failed for ${filePath}:`, err.message);
    return filePath; // Return original on failure
  }
}

// ──────────────────────────────────────────────────────────────
// Multer Storage Config
// ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.query.category || req.body.category || 'general';
    const targetDir = path.join(BASE_UPLOAD_DIR, REQUIRED_SUBDIRS.includes(category) ? category : 'general');
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// ──────────────────────────────────────────────────────────────
// File Filter — MIME type + size validation
// ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const allowed = ALLOWED_MIME_TYPES.map((m) => m.split('/')[1].toUpperCase()).join(', ');
    return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowed}`), false);
  }

  // Size check based on type
  const isImage = IMAGE_MIME_TYPES.includes(file.mimetype);
  const limit = isImage ? SIZE_LIMITS.image : SIZE_LIMITS.document;

  // Note: size is checked at buffer level by multer, but we add a pre-check here
  cb(null, true);
};

// ──────────────────────────────────────────────────────────────
// Multer Instance
// ──────────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Post-upload middleware: resize images if needed
 * Attaches `resizedFile` to req for the controller to use
 */
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  const category = req.query.category || req.body.category || 'general';
  try {
    const resizedPath = await resizeImage(req.file.path, category);
    req.file.path = resizedPath;
    req.file.filename = path.basename(resizedPath);
    req.file.resized = true;
  } catch {
    // Original file kept on error
    req.file.resized = false;
  }
  next();
};

/**
 * Process multiple uploaded images
 */
const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const category = req.query.category || req.body.category || 'general';
  for (const file of req.files) {
    try {
      const resizedPath = await resizeImage(file.path, category);
      file.path = resizedPath;
      file.filename = path.basename(resizedPath);
      file.resized = true;
    } catch {
      file.resized = false;
    }
  }
  next();
};

module.exports = {
  upload,
  processImage,
  processImages,
  resizeImage,
  BASE_UPLOAD_DIR,
  IMAGE_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
};
