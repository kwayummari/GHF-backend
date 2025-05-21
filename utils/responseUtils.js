const { StatusCodes } = require('http-status-codes');

/**
 * Create a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @returns {Object} - Express response
 */
const successResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Create an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors
 * @returns {Object} - Express response
 */
const errorResponse = (res, statusCode, message, errors) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Create a paginated response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} pagination - Pagination metadata
 * @returns {Object} - Express response
 */
const paginatedResponse = (res, statusCode, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};