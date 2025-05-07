const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

/**
 * Middleware to validate request data using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format errors
  const formattedErrors = errors.array().map((error) => ({
    field: error.param,
    message: error.msg,
    value: error.value,
  }));
  
  // Return error response
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: 'Validation error',
    errors: formattedErrors,
  });
};

module.exports = validateRequest;