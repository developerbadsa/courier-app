const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const BASE_UPLOAD_DIR = process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
const REQUIRED_SUBDIRS = ['kyc', 'pod', 'parcels', 'avatars', 'general'];

// Ensure all subdirectories exist
REQUIRED_SUBDIRS.forEach((subDir) => {
  const dirPath = path.join(BASE_UPLOAD_DIR, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.query.category || req.body.category || 'general';
    const targetDir = path.join(BASE_UPLOAD_DIR, REQUIRED_SUBDIRS.includes(category) ? category : 'general');
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedOriginal = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    const uniqueName = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed formats: JPG, PNG, WEBP, PDF, SVG`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB per file limit
  },
});

module.exports = {
  upload,
  BASE_UPLOAD_DIR,
};
