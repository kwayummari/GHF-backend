const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Create a unique filename
 * @param {string} originalname - Original file name
 * @returns {string} - Unique filename
 */
const createUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  
  return `${timestamp}-${random}${extension}`;
};

/**
 * Get file path in uploads directory
 * @param {string} filename - File name
 * @param {string} subdir - Subdirectory (optional)
 * @returns {string} - Full file path
 */
const getFilePath = (filename, subdir = '') => {
  const uploadDir = path.join(process.cwd(), 'uploads', subdir);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  return path.join(uploadDir, filename);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get MIME type from file extension
 * @param {string} filename - File name
 * @returns {string} - MIME type
 */
const getMimeType = (filename) => {
  const extension = path.extname(filename).toLowerCase().substring(1);
  
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'csv': 'text/csv',
    'txt': 'text/plain',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

module.exports = {
  createUniqueFilename,
  getFilePath,
  formatFileSize,
  getMimeType,
};