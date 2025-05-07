const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');

/**
 * Create a unique filename
 * @param {string} originalName - Original file name
 * @returns {string} - Unique filename
 */
const createUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  
  return `${timestamp}-${random}${extension}`;
};

/**
 * Get file path in upload directory
 * @param {string} filename - File name
 * @param {string} subdir - Subdirectory (optional)
 * @returns {string} - Full file path
 */
const getFilePath = (filename, subdir = '') => {
  const uploadDir = path.join(process.cwd(), config.UPLOAD.DIR, subdir);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  return path.join(uploadDir, filename);
};

/**
 * Save a file to disk
 * @param {Buffer} buffer - File data
 * @param {string} filename - File name
 * @param {string} subdir - Subdirectory (optional)
 * @returns {string} - Saved file path
 */
const saveFile = (buffer, filename, subdir = '') => {
  const filePath = getFilePath(filename, subdir);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

/**
 * Delete a file
 * @param {string} filename - File name
 * @param {string} subdir - Subdirectory (optional)
 * @returns {boolean} - Whether the file was deleted
 */
const deleteFile = (filename, subdir = '') => {
  try {
    const filePath = getFilePath(filename, subdir);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Human-readable file size
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
 * Get file MIME type from extension
 * @param {string} filename - File name
 * @returns {string} - MIME type
 */
const getMimeType = (filename) => {
  const extension = path.extname(filename).toLowerCase().substring(1);
  
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    html: 'text/html',
    json: 'application/json',
    xml: 'application/xml',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

module.exports = {
  createUniqueFilename,
  getFilePath,
  saveFile,
  deleteFile,
  formatFileSize,
  getMimeType,
};