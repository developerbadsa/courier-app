const storageService = require('../services/storageService');

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validate file exists and is readable
 */
function validateFile(file) {
  if (!file) return { valid: false, error: 'No file provided in form-data payload.' };
  if (!file.mimetype) return { valid: false, error: 'File MIME type could not be determined.' };
  if (file.size === 0) return { valid: false, error: 'Uploaded file is empty (0 bytes).' };
  return { valid: true };
}

// ──────────────────────────────────────────────────────────────
// Upload: Single File
// ──────────────────────────────────────────────────────────────
const uploadSingle = async (req, res) => {
  try {
    const check = validateFile(req.file);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.error });
    }

    const category = req.query.category || req.body.category || 'general';
    const formatted = storageService.formatFileResponse(req.file, category);

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        ...formatted,
        sizeHuman: formatBytes(formatted.sizeBytes),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process file upload.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────
// Upload: Multiple Files (max 10)
// ──────────────────────────────────────────────────────────────
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided in form-data payload (field: files).',
      });
    }

    const category = req.query.category || req.body.category || 'general';
    const files = req.files.map((file) => ({
      ...storageService.formatFileResponse(file, category),
      sizeHuman: formatBytes(file.size),
    }));

    const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);

    return res.status(201).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully.`,
      data: {
        count: files.length,
        totalSize: formatBytes(totalSize),
        files,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process multiple file upload.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────
// Upload: KYC Document
// ──────────────────────────────────────────────────────────────
const KYC_DOC_TYPES = ['BUSINESS_REGISTRATION', 'TAX_ID', 'NATIONAL_ID', 'UTILITY_BILL'];

const uploadKYCDocument = async (req, res) => {
  try {
    const check = validateFile(req.file);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.error });
    }

    const documentType = req.body.documentType || 'BUSINESS_REGISTRATION';
    if (!KYC_DOC_TYPES.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid documentType. Allowed: ${KYC_DOC_TYPES.join(', ')}`,
      });
    }

    const formatted = storageService.formatFileResponse(req.file, 'kyc');

    return res.status(201).json({
      success: true,
      message: 'KYC document uploaded successfully.',
      data: {
        documentType,
        ...formatted,
        sizeHuman: formatBytes(formatted.sizeBytes),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload KYC document.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────
// Upload: Proof of Delivery (POD)
// ──────────────────────────────────────────────────────────────
const POD_TYPES = ['SIGNATURE', 'DOORSTEP_PHOTO', 'DAMAGED_PHOTO'];

const uploadPOD = async (req, res) => {
  try {
    const check = validateFile(req.file);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.error });
    }

    const trackingNumber = req.body.trackingNumber || 'UNASSIGNED';
    const podType = req.body.podType || 'SIGNATURE';
    if (!POD_TYPES.includes(podType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid podType. Allowed: ${POD_TYPES.join(', ')}`,
      });
    }

    const formatted = storageService.formatFileResponse(req.file, 'pod');

    return res.status(201).json({
      success: true,
      message: 'Proof of Delivery asset uploaded successfully.',
      data: {
        trackingNumber,
        podType,
        ...formatted,
        sizeHuman: formatBytes(formatted.sizeBytes),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload Proof of Delivery asset.',
      error: error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────
// Delete: Remove uploaded file
// ──────────────────────────────────────────────────────────────
const deleteFile = async (req, res) => {
  try {
    const { filename, category } = req.params;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is required.' });
    }

    const cat = category || 'general';
    const deleted = storageService.deleteFile(filename, cat);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file.',
      error: error.message,
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadKYCDocument,
  uploadPOD,
  deleteFile,
};
