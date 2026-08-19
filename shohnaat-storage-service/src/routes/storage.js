const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { serviceAuth } = require('../middleware/auth');
const storageController = require('../controllers/storageController');

// Upload single file (e.g. avatar, single parcel photo)
router.post('/upload/single', serviceAuth, upload.single('file'), storageController.uploadSingle);

// Upload multiple files (up to 10 files)
router.post('/upload/multiple', serviceAuth, upload.array('files', 10), storageController.uploadMultiple);

// Upload Merchant KYC document (Trade License / Tax Certificate)
router.post('/upload/kyc', serviceAuth, upload.single('document'), storageController.uploadKYC);

// Upload Rider Proof of Delivery (Signature or Doorstep Photo)
router.post('/upload/pod', serviceAuth, upload.single('asset'), storageController.uploadPOD);

// Delete file securely
router.delete('/files/:category/:filename', serviceAuth, storageController.deleteFile);

// Health & Stats
router.get('/stats', storageController.getStorageStats);

module.exports = router;
