const { body } = require('express-validator');

/**
 * Document update validation rules
 */
const documentUpdateValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Document name cannot be empty if provided')
    .isLength({ max: 255 }).withMessage('Document name cannot exceed 255 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('user_id')
    .optional()
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
];

module.exports = {
  documentUpdateValidator,
};