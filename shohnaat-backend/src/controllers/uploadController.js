const storageService = require('../services/storageService');

/**
 * Upload a single file (general / avatars / parcels)
 */
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided in form-data payload (field: file).',
      });
    }

    const category = req.query.category || req.body.category || 'general';
    const formatted = storageService.formatFileResponse(req.file, category);

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process file upload.',
      error: error.message,
    });
  }
};

/**
 * Upload multiple files (e.g. damaged parcel inspection photos)
 */
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided in form-data payload (field: files).',
      });
    }

    const category = req.query.category || req.body.category || 'general';
    const files = req.files.map((file) => storageService.formatFileResponse(file, category));

    return res.status(201).json({
      success: true,
      message: `${files.length} files uploaded successfully.`,
      data: {
        count: files.length,
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

/**
 * Upload Merchant KYC Verification Documents (Trade License, Tax ID, National ID)
 */
const uploadKYCDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No KYC document provided in form-data payload.',
      });
    }

    const documentType = req.body.documentType || 'BUSINESS_REGISTRATION'; // 'TAX_ID' | 'NATIONAL_ID' | 'BUSINESS_REGISTRATION'
    const formatted = storageService.formatFileResponse(req.file, 'kyc');

    return res.status(201).json({
      success: true,
      message: 'KYC document uploaded successfully.',
      data: {
        documentType,
        ...formatted,
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

/**
 * Upload Rider Proof-of-Delivery (POD) Signature & Doorstep Photo
 */
const uploadPOD = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No POD asset provided (signature/photo).',
      });
    }

    const trackingNumber = req.body.trackingNumber || 'UNASSIGNED';
    const podType = req.body.podType || 'SIGNATURE'; // 'SIGNATURE' | 'DOORSTEP_PHOTO'
    const formatted = storageService.formatFileResponse(req.file, 'pod');

    return res.status(201).json({
      success: true,
      message: 'Proof of Delivery asset uploaded successfully.',
      data: {
        trackingNumber,
        podType,
        ...formatted,
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

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadKYCDocument,
  uploadPOD,
};
