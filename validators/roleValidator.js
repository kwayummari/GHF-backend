const { body } = require('express-validator');

/**
 * Role validation rules
 */
const roleValidator = [
  body('role_name')
    .trim()
    .notEmpty().withMessage('Role name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Role name must be between 2 and 50 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('permission_ids')
    .optional()
    .isArray().withMessage('Permission IDs must be an array')
    .custom(value => {
      if (value && !value.every(Number.isInteger)) {
        throw new Error('Permission IDs must be integers');
      }
      return true;
    }),
];

/**
 * User-Role assignment validation rules
 */
const userRoleValidator = [
  body('user_id')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  body('role_id')
    .isInt({ min: 1 }).withMessage('Role ID must be a positive integer'),
];

module.exports = {
  roleValidator,
  userRoleValidator,
};