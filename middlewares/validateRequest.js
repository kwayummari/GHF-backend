const { validationResult } = require('express-validator');
const Joi = require('joi');
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

/**
 * Middleware to validate request data using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validateJoi = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      // Format Joi errors
      const formattedErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));
      
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation error',
        errors: formattedErrors,
      });
    }
    
    // Replace the data with validated data
    req[source] = value;
    next();
  };
};

module.exports = {
  validateRequest,
  validateJoi,
};