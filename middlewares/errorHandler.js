const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Default error status code and message
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Handle specific error types
  switch (err.name) {
    case 'SequelizeValidationError':
    case 'SequelizeUniqueConstraintError':
      statusCode = StatusCodes.BAD_REQUEST;
      message = 'Validation error';
      errors = err.errors.map(e => ({
        field: e.path,
        message: e.message,
      }));
      break;
    case 'JsonWebTokenError':
      statusCode = StatusCodes.UNAUTHORIZED;
      message = 'Invalid token';
      break;
    case 'TokenExpiredError':
      statusCode = StatusCodes.UNAUTHORIZED;
      message = 'Token expired';
      break;
    case 'SequelizeDatabaseError':
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      message = 'Database error';
      break;
    case 'SyntaxError':
      if (err.message.includes('JSON')) {
        statusCode = StatusCodes.BAD_REQUEST;
        message = 'Invalid JSON';
      }
      break;
  }

  // Create error response
  const errorResponse = {
    success: false,
    message,
    errors,
  };

  // Include stack trace in development
  if (config.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send response
  return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;