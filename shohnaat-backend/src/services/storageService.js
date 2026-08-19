const path = require('path');
const fs = require('fs');
const { BASE_UPLOAD_DIR } = require('../middleware/upload');

class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local'; // 'local' | 's3'
    this.baseUrl = process.env.APP_URL || process.env.API_URL || 'https://api-shohnaat.rahimbadsa.me';
  }

  /**
   * Generates public URL for a stored file
   * @param {string} filename 
   * @param {string} category 
   * @returns {string} public URL
   */
  getFileUrl(filename, category = 'general') {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    return `${this.baseUrl}/uploads/${category}/${filename}`;
  }

  /**
   * Safely deletes a file from the local storage
   * @param {string} filename 
   * @param {string} category 
   * @returns {boolean}
   */
  deleteFile(filename, category = 'general') {
    try {
      const filePath = path.join(BASE_UPLOAD_DIR, category, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[StorageService] Failed to delete file: ${filename}`, err);
      return false;
    }
  }

  /**
   * Extracts metadata from uploaded file
   * @param {Express.Multer.File} file 
   * @param {string} category 
   */
  formatFileResponse(file, category = 'general') {
    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      sizeBytes: file.size,
      category,
      url: this.getFileUrl(file.filename, category),
      uploadedAt: new Date().toISOString(),
    };
  }
}

module.exports = new StorageService();
