const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Upload single file (image, avatar, general document)
router.post('/single', upload.single('file'), uploadController.uploadSingle);

// Upload multiple files (e.g. damaged parcel photos)
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);

// Upload KYC Verification Document (Trade License / Tax ID)
router.post('/kyc', upload.single('document'), uploadController.uploadKYCDocument);

// Upload Rider Proof of Delivery (Signature / Parcel Doorstep Photo)
router.post('/pod', upload.single('asset'), uploadController.uploadPOD);

module.exports = router;
