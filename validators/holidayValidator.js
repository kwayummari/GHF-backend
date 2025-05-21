const { body } = require('express-validator');

/**
 * Holiday validation rules
 */
const holidayValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Holiday name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Holiday name must be between 2 and 100 characters'),
  
  body('date')
    .isDate().withMessage('Date must be a valid date'),
  
  body('is_workday')
    .optional()
    .isBoolean().withMessage('Is workday must be a boolean value'),
];

module.exports = {
  holidayValidator,
};