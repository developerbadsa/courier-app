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
   */
  getFileUrl(filename, category = 'general') {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    return `${this.baseUrl}/uploads/${category}/${filename}`;
  }

  /**
   * Safely deletes a file from local storage
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
   * Check if a file exists on disk
   */
  fileExists(filename, category = 'general') {
    const filePath = path.join(BASE_UPLOAD_DIR, category, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get file stats (size, created time)
   */
  getFileInfo(filename, category = 'general') {
    try {
      const filePath = path.join(BASE_UPLOAD_DIR, category, filename);
      if (!fs.existsSync(filePath)) return null;
      const stats = fs.statSync(filePath);
      return {
        filename,
        category,
        sizeBytes: stats.size,
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        url: this.getFileUrl(filename, category),
      };
    } catch {
      return null;
    }
  }

  /**
   * Format Multer file object into clean API response
   */
  formatFileResponse(file, category = 'general') {
    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      sizeBytes: file.size,
      category,
      resized: file.resized || false,
      url: this.getFileUrl(file.filename, category),
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Cleanup orphaned files older than N days in a category
   * Returns count of deleted files
   */
  cleanupOldFiles(category = 'general', maxAgeDays = 30) {
    let deletedCount = 0;
    try {
      const dirPath = path.join(BASE_UPLOAD_DIR, category);
      if (!fs.existsSync(dirPath)) return 0;

      const files = fs.readdirSync(dirPath);
      const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    } catch (err) {
      console.error(`[StorageService] Cleanup error in ${category}:`, err.message);
    }
    return deletedCount;
  }
}

module.exports = new StorageService();
