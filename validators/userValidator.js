const { body } = require('express-validator');

/**
 * User registration validation rules
 */
const registerValidator = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
  
  body('middle_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Middle name cannot exceed 100 characters'),
  
  body('sur_name')
    .trim()
    .notEmpty().withMessage('Surname is required')
    .isLength({ min: 2, max: 100 }).withMessage('Surname must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('phone_number')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s]+$/).withMessage('Phone number can only contain digits, +, -, and spaces'),
  
  body('gender')
    .trim()
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirm_password')
    .trim()
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * User update validation rules
 */
const updateUserValidator = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
  
  body('middle_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Middle name cannot exceed 100 characters'),
  
  body('sur_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Surname must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('phone_number')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s]+$/).withMessage('Phone number can only contain digits, +, -, and spaces'),
  
  body('gender')
    .optional()
    .trim()
    .isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status value'),
  
  body('basic_employee_data.status')
    .optional()
    .trim()
    .isIn(['active', 'inactive', 'on leave', 'terminated']).withMessage('Invalid employment status'),
  
  body('basic_employee_data.date_joined')
    .optional()
    .isDate().withMessage('Date joined must be a valid date'),
  
  body('basic_employee_data.employment_type')
    .optional()
    .trim()
    .isIn(['full time', 'contract', 'intern', 'part time', 'volunteer']).withMessage('Invalid employment type'),
  
  body('basic_employee_data.salary')
    .optional()
    .isNumeric().withMessage('Salary must be a number')
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  
  body('bio_data.marital_status')
    .optional()
    .trim()
    .isIn(['single', 'married', 'divorced', 'widowed']).withMessage('Invalid marital status'),
  
  body('bio_data.dob')
    .optional()
    .isDate().withMessage('Date of birth must be a valid date'),
  
  body('roles')
    .optional()
    .isArray().withMessage('Roles must be an array')
    .custom(value => {
      if (!value.every(Number.isInteger)) {
        throw new Error('Role IDs must be integers');
      }
      return true;
    }),
];

module.exports = {
  registerValidator,
  updateUserValidator,
};