// validators/roleValidator.js
const { body, validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

// Validation rules for role creation/update
const validateRole = [
  body('role_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Role name can only contain letters, numbers, spaces, underscores and hyphens'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean value'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),

  body('permissions.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each permission ID must be a positive integer'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for role permissions update
const validateRolePermissions = [
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array'),

  body('permissions.*')
    .isInt({ min: 1 })
    .withMessage('Each permission ID must be a positive integer'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for role assignment
const validateRoleAssignment = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  body('role_ids')
    .isArray()
    .withMessage('Role IDs must be an array'),

  body('role_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each role ID must be a positive integer'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateRole,
  validateRolePermissions,
  validateRoleAssignment
};