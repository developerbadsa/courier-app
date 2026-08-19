const path = require('path');
const fs = require('fs');
const { BASE_UPLOAD_DIR } = require('../middleware/upload');

const getBaseUrl = (req) => {
  if (process.env.STORAGE_PUBLIC_URL) {
    return process.env.STORAGE_PUBLIC_URL;
  }
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
};

const formatFile = (file, category, req) => {
  const baseUrl = getBaseUrl(req);
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    category,
    url: `${baseUrl}/files/${category}/${file.filename}`,
    uploadedAt: new Date().toISOString(),
  };
};

/**
 * Single file upload
 */
const uploadSingle = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file received in form-data payload (field: file).',
      });
    }

    const category = req.query.category || req.body.category || 'general';
    const data = formatFile(req.file, category, req);

    return res.status(201).json({
      success: true,
      message: 'File stored successfully on dedicated storage engine.',
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Storage processing error.',
      error: err.message,
    });
  }
};

/**
 * Multiple files upload
 */
const uploadMultiple = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files received in form-data payload (field: files).',
      });
    }

    const category = req.query.category || req.body.category || 'general';
    const files = req.files.map((f) => formatFile(f, category, req));

    return res.status(201).json({
      success: true,
      message: `${files.length} files stored successfully.`,
      data: {
        count: files.length,
        files,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Multiple storage processing error.',
      error: err.message,
    });
  }
};

/**
 * Merchant KYC document upload
 */
const uploadKYC = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No KYC document received.',
      });
    }

    const docType = req.body.documentType || 'BUSINESS_REGISTRATION';
    const data = {
      documentType: docType,
      ...formatFile(req.file, 'kyc', req),
    };

    return res.status(201).json({
      success: true,
      message: 'Merchant KYC document secured on storage microservice.',
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'KYC storage error.',
      error: err.message,
    });
  }
};

/**
 * Field Rider Proof-of-Delivery upload
 */
const uploadPOD = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No Proof-of-Delivery asset received.',
      });
    }

    const data = {
      trackingNumber: req.body.trackingNumber || 'UNTRACKED',
      podType: req.body.podType || 'SIGNATURE',
      ...formatFile(req.file, 'pod', req),
    };

    return res.status(201).json({
      success: true,
      message: 'Proof of Delivery asset captured.',
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'POD storage error.',
      error: err.message,
    });
  }
};

/**
 * Delete a file securely
 */
const deleteFile = (req, res) => {
  try {
    const { category, filename } = req.params;
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(BASE_UPLOAD_DIR, category, sanitizedFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: `File ${sanitizedFilename} deleted from storage.`,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'File not found on storage engine.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'File deletion error.',
      error: err.message,
    });
  }
};

/**
 * Inspect storage health & statistics
 */
const getStorageStats = (req, res) => {
  try {
    const stats = {};
    const categories = ['kyc', 'pod', 'parcels', 'avatars', 'general'];

    categories.forEach((cat) => {
      const dirPath = path.join(BASE_UPLOAD_DIR, cat);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        stats[cat] = files.length;
      } else {
        stats[cat] = 0;
      }
    });

    return res.json({
      success: true,
      status: 'OPTIMAL',
      service: 'shohnaat-storage-microservice',
      uptimeSeconds: process.uptime(),
      storageStats: stats,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadKYC,
  uploadPOD,
  deleteFile,
  getStorageStats,
};
