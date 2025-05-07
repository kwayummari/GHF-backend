const { StatusCodes } = require('http-status-codes');

/**
 * Create a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} - Express response
 */
const successResponse = (
  res,
  statusCode = StatusCodes.OK,
  message = 'Success',
  data = null,
  meta = null
) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Create an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors
 * @returns {Object} - Express response
 */
const errorResponse = (
  res,
  statusCode = StatusCodes.BAD_REQUEST,
  message = 'Error',
  errors = null
) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Create a paginated response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Array} data - Paginated data
 * @param {Object} pagination - Pagination info
 * @returns {Object} - Express response
 */
const paginatedResponse = (
  res,
  statusCode = StatusCodes.OK,
  message = 'Success',
  data = [],
  pagination = {}
) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalItems: pagination.totalItems || 0,
      totalPages: pagination.totalPages || 0,
      hasNextPage: pagination.hasNextPage || false,
      hasPrevPage: pagination.hasPrevPage || false,
    },
  };
  
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};