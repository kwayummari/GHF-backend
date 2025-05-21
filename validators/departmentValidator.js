const { body } = require('express-validator');

/**
 * Department validation rules
 */
const departmentValidator = [
  body('department_name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
];

module.exports = {
  departmentValidator,
};