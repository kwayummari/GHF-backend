const { StatusCodes } = require('http-status-codes');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const { createUniqueFilename, getFilePath, formatFileSize, getMimeType } = require('../utils/fileUtils');
const logger = require('../utils/logger');
const config = require('../config/config');
const { Op } = require('sequelize');

/**
 * Upload document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'No file uploaded',
        [{ field: 'file', message: 'File is required' }]
      );
    }
    
    const { originalname, mimetype, size, path: tempFilePath } = req.file;
    const { name, description, user_id } = req.body;
    
    // Create a unique filename to avoid collisions
    const filename = createUniqueFilename(originalname);
    
    // Determine the file path
    const filePath = path.join('documents', filename);
    const destinationPath = getFilePath(filename, 'documents');
    
    // Move the file from the temp location to the final destination
    fs.copyFileSync(tempFilePath, destinationPath);
    fs.unlinkSync(tempFilePath); // Delete the temp file
    
    // Get user id - either from the request body or the logged in user
    const documentOwnerId = user_id || req.user.id;
    
    // Create document record in the database
    const document = await Document.create({
      user_id: documentOwnerId,
      name: name || originalname,
      description,
      file_path: filePath,
      file_type: mimetype,
      file_size: size,
      uploaded_by: req.user.id
    });
    
    return successResponse(
      res,
      StatusCodes.CREATED,
      'Document uploaded successfully',
      {
        ...document.toJSON(),
        file_size_formatted: formatFileSize(size)
      }
    );
  } catch (error) {
    logger.error('Upload document error:', error);
    next(error);
  }
};

/**
 * Get all documents for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMyDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      file_type = '',
      sort_by = 'uploaded_at',
      sort_order = 'DESC'
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const whereConditions = {
      user_id: userId
    };
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (file_type) {
      whereConditions.file_type = { [Op.like]: `%${file_type}%` };
    }
    
    // Execute query
    const { count, rows } = await Document.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ],
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),
      offset
    });
    
    // Format documents with file size
    const formattedDocuments = rows.map(doc => ({
      ...doc.toJSON(),
      file_size_formatted: formatFileSize(doc.file_size)
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    
    return paginatedResponse(
      res,
      StatusCodes.OK,
      'Documents retrieved successfully',
      formattedDocuments,
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    );
  } catch (error) {
    logger.error('Get my documents error:', error);
    next(error);
  }
};

/**
 * Get documents for a specific user (admin function)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      file_type = '',
      sort_by = 'uploaded_at',
      sort_order = 'DESC'
    } = req.query;
    
    // Check permissions - only admin or HR can view other users' documents
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    
    if (!isAdmin && !isHR && req.user.id !== parseInt(id)) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to view this user\'s documents'
      );
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const whereConditions = {
      user_id: id
    };
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (file_type) {
      whereConditions.file_type = { [Op.like]: `%${file_type}%` };
    }
    
    // Get user info
    const user = await User.findByPk(id, {
      attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
    });
    
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }
    
    // Execute query
    const { count, rows } = await Document.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ],
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),
      offset
    });
    
    // Format documents with file size
    const formattedDocuments = rows.map(doc => ({
      ...doc.toJSON(),
      file_size_formatted: formatFileSize(doc.file_size)
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    
    return paginatedResponse(
      res,
      StatusCodes.OK,
      'User documents retrieved successfully',
      {
        user: {
          id: user.id,
          name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.sur_name}`,
          email: user.email
        },
        documents: formattedDocuments
      },
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    );
  } catch (error) {
    logger.error('Get user documents error:', error);
    next(error);
  }
};

/**
 * Get document by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ]
    });
    
    if (!document) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Document not found'
      );
    }
    
    // Check permissions - only admin, HR, owner, or uploader can view the document
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isOwner = document.user_id === req.user.id;
    const isUploader = document.uploaded_by === req.user.id;
    
    if (!isAdmin && !isHR && !isOwner && !isUploader) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to view this document'
      );
    }
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Document retrieved successfully',
      {
        ...document.toJSON(),
        file_size_formatted: formatFileSize(document.file_size)
      }
    );
  } catch (error) {
    logger.error('Get document by ID error:', error);
    next(error);
  }
};

/**
 * Download document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Document not found'
      );
    }
    
    // Check permissions - only admin, HR, owner, or uploader can download the document
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isOwner = document.user_id === req.user.id;
    const isUploader = document.uploaded_by === req.user.id;
    
    if (!isAdmin && !isHR && !isOwner && !isUploader) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to download this document'
      );
    }
    
    // Get the file path
    const filePath = path.join(process.cwd(), document.file_path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'File not found on server'
      );
    }
    
    // Set the content disposition header to force download
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.setHeader('Content-Type', document.file_type);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error('Download document error:', error);
    next(error);
  }
};

/**
 * Update document details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, user_id } = req.body;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Document not found'
      );
    }
    
    // Check permissions - only admin, HR, or uploader can update document details
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isUploader = document.uploaded_by === req.user.id;
    
    if (!isAdmin && !isHR && !isUploader) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to update this document'
      );
    }
    
    // Check if the user exists if user_id is provided
    if (user_id) {
      const user = await User.findByPk(user_id);
      
      if (!user) {
        return errorResponse(
          res,
          StatusCodes.NOT_FOUND,
          'User not found',
          [{ field: 'user_id', message: 'User does not exist' }]
        );
      }
    }
    
    // Update document
    await document.update({
      name: name || document.name,
      description: description !== undefined ? description : document.description,
      user_id: user_id || document.user_id
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Document updated successfully',
      {
        ...document.toJSON(),
        file_size_formatted: formatFileSize(document.file_size)
      }
    );
  } catch (error) {
    logger.error('Update document error:', error);
    next(error);
  }
};

/**
 * Delete document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Document not found'
      );
    }
    
    // Check permissions - only admin, HR, or uploader can delete document
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isUploader = document.uploaded_by === req.user.id;
    
    if (!isAdmin && !isHR && !isUploader) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to delete this document'
      );
    }
    
    // Get the file path
    const filePath = path.join(process.cwd(), document.file_path);
    
    // Delete the file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete the document record
    await document.destroy();
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Document deleted successfully'
    );
  } catch (error) {
    logger.error('Delete document error:', error);
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getUserDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument
};