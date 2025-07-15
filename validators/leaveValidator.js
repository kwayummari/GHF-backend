const { body } = require('express-validator');

/**
 * Leave application validation rules
 */
const leaveApplicationValidator = [
  body('type_id')
    .notEmpty()
    .withMessage('Leave type is required')
    .isInt({ min: 1 })
    .withMessage('Leave type must be a valid ID'),

  body('starting_date')
    .notEmpty()
    .withMessage('Start date is required')
    .isDate()
    .withMessage('Start date must be a valid date'),

  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .isDate()
    .withMessage('End date must be a valid date'),

  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters'),

  body('attachment_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Attachment ID must be a valid ID'),
  

  body('save_as_draft')
    .optional()
    .isBoolean()
    .withMessage('Save as draft must be a boolean'),

  body('submit')
    .optional()
    .isBoolean()
    .withMessage('Submit must be a boolean')
];

/**
 * Leave status update validation rules
 */
const leaveStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['approved by supervisor', 'approved by hr', 'approved', 'rejected'])
    .withMessage('Invalid status value. Must be one of: approved by supervisor, approved by hr, approved, rejected'),
  
  body('comment')
    .optional()
    .trim(),
];

module.exports = {
  leaveApplicationValidator,
  leaveStatusValidator,
};