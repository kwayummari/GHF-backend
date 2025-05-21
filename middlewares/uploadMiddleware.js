const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${randomString}${extension}`;
    cb(null, filename);
  },
});

// Set file filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error('Invalid file type. Only images, documents, and spreadsheets are allowed.'), false);
};

// Set file size limit (5 MB)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

// Create multer upload instance
const multerInstance = multer({
  storage,
  fileFilter,
  limits,
});

// Error handling wrapper middleware
const uploadMiddleware = (req, res, next) => {
  multerInstance.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error
      logger.error(`Multer error during file upload: ${err.message}`);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
          errors: [{ field: 'file', message: 'File size exceeds limit (5MB)' }],
        });
      }
      
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `File upload error: ${err.message}`,
        errors: [{ field: 'file', message: err.message }],
      });
    } else if (err) {
      // Other error
      logger.error(`Error during file upload: ${err.message}`);
      
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.message,
        errors: [{ field: 'file', message: err.message }],
      });
    }
    
    // If no file was uploaded and it's required
    if (!req.file) {
      logger.warn('File upload attempted but no file was received');
      
      // We don't return an error here because the controller should handle this case
      // Some routes might make the file optional, so we let the controller decide
    } else {
      logger.info(`File uploaded successfully: ${req.file.originalname} (${req.file.size} bytes)`);
    }
    
    next();
  });
};

// Create folder for document uploads
const documentsDir = path.join(uploadsDir, 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Create folder for profile photos
const profilesDir = path.join(uploadsDir, 'profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Helper functions for the controller
const getFileUrl = (filename, subdir = '') => {
  const relativePath = path.join('uploads', subdir, filename);
  return `/${relativePath.replace(/\\/g, '/')}`;
};

const getFilePath = (filename, subdir = '') => {
  return path.join(process.cwd(), 'uploads', subdir, filename);
};

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
      return true;
    }
    logger.warn(`File not found for deletion: ${filePath}`);
    return false;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}: ${error.message}`);
    return false;
  }
};

module.exports = {
  upload: uploadMiddleware,
  getFileUrl,
  getFilePath,
  deleteFile,
  storage,
  fileFilter,
  limits,
  uploadsDir,
  documentsDir,
  profilesDir,
};