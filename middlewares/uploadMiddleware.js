const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');

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
const upload = multer({
  storage,
  fileFilter,
  limits,
}).single('file');

// Error handling wrapper
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error
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
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.message,
        errors: [{ field: 'file', message: err.message }],
      });
    }
    
    next();
  });
};

module.exports = {
  upload: uploadMiddleware,
  storage,
  fileFilter,
  limits,
  uploadDir: uploadsDir,
};