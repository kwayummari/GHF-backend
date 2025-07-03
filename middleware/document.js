const { Document } = require('../models');

// Validate document permissions
const validateDocumentPermissions = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { userId } = req.user;

    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has permission to modify the document
    if (document.created_by !== userId && document.approved_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this document' });
    }

    req.document = document;
    next();
  } catch (error) {
    next(error);
  }
};

// Validate file type
const validateFileType = async (req, res, next) => {
  try {
    const { file } = req;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate document version
const validateDocumentVersion = async (req, res, next) => {
  try {
    const { version } = req.body;
    
    if (version) {
      const versionRegex = /^\d+(\.\d+)*$/;
      if (!versionRegex.test(version)) {
        return res.status(400).json({ error: 'Invalid version format' });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateDocumentPermissions,
  validateFileType,
  validateDocumentVersion
};
