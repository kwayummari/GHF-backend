const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Global error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'unauthenticated',
  });

  // Handle different types of errors
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // Special cases for common errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Format the response
  const errorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Send the response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;