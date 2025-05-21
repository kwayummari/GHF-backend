const { body } = require('express-validator');

/**
 * Leave application validation rules
 */
const leaveApplicationValidator = [
  body('type_id')
    .isInt({ min: 1 }).withMessage('Valid leave type is required'),
  
  body('starting_date')
    .isDate().withMessage('Start date must be a valid date'),
  
  body('end_date')
    .isDate().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.starting_date);
      const endDate = new Date(value);
      
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }
      
      return true;
    }),
  
  body('comment')
    .optional()
    .trim(),
  
  body('attachment_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Attachment ID must be a positive integer'),
  
  body('save_as_draft')
    .optional()
    .isBoolean().withMessage('Save as draft must be a boolean value'),
  
  body('submit')
    .optional()
    .isBoolean().withMessage('Submit must be a boolean value'),
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