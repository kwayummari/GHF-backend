const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

/**
 * Middleware to validate request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }

  // Format errors
  const formattedErrors = errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value,
  }));

  return res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: `${formattedErrors[0].message}`,
    errors: formattedErrors,
  });
};

module.exports = validateRequest;