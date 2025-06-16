const { body } = require('express-validator');

/**
 * Validation rules for user registration (public registration)
 */
const registerValidator = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name cannot exceed 100 characters'),

  body('middle_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Middle name cannot exceed 100 characters'),

  body('sur_name')
    .trim()
    .notEmpty().withMessage('Surname is required')
    .isLength({ max: 100 }).withMessage('Surname cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  body('phone_number')
    .optional()
    .trim()
    .matches(/^[0-9+\- ]+$/).withMessage('Phone number contains invalid characters'),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),

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
 * Validation rules for creating a user (admin function)
 */
const createUserValidator = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }).withMessage('First name cannot exceed 100 characters'),

  body('middle_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Middle name cannot exceed 100 characters'),

  body('sur_name')
    .trim()
    .notEmpty().withMessage('Surname is required')
    .isLength({ max: 100 }).withMessage('Surname cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  body('phone_number')
    .optional()
    .trim()
    .matches(/^[0-9+\- ]+$/).withMessage('Phone number contains invalid characters'),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),

  body('password')
    .optional()
    .trim()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .custom((value, { req }) => {
      // Password is required unless generate_random_password is true
      if (!value && !req.body.generate_random_password) {
        throw new Error('Password is required when generate_random_password is false');
      }
      if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character');
      }
      return true;
    }),

  body('generate_random_password')
    .optional()
    .isBoolean().withMessage('Generate random password must be a boolean'),

  body('send_welcome_email')
    .optional()
    .isBoolean().withMessage('Send welcome email must be a boolean'),

  // Basic employee data validation
  body('basic_employee_data.status')
    .optional()
    .isIn(['active', 'inactive', 'on leave', 'terminated'])
    .withMessage('Employment status must be one of: active, inactive, on leave, terminated'),

  body('basic_employee_data.registration_number')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Registration number cannot exceed 100 characters'),

  body('basic_employee_data.date_joined')
    .optional()
    .isISO8601().withMessage('Date joined must be a valid date'),

  body('basic_employee_data.designation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),

  body('basic_employee_data.employment_type')
    .optional()
    .isIn(['full time', 'contract', 'intern', 'part time', 'volunteer'])
    .withMessage('Employment type must be one of: full time, contract, intern, part time, volunteer'),

  body('basic_employee_data.department_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),

  body('basic_employee_data.salary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),

  body('basic_employee_data.supervisor_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Supervisor ID must be a positive integer'),

  body('basic_employee_data.nida')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('NIDA cannot exceed 100 characters'),

  // Bio data validation
  body('bio_data.marital_status')
    .optional()
    .isIn(['single', 'married', 'divorced', 'widowed'])
    .withMessage('Marital status must be one of: single, married, divorced, widowed'),

  body('bio_data.national_id')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('National ID cannot exceed 100 characters'),

  body('bio_data.dob')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),

  // Personal employee data validation
  body('personal_employee_data.location')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Location cannot exceed 500 characters'),

  body('personal_employee_data.education_level')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Education level cannot exceed 100 characters'),

  // Emergency contacts validation
  body('emergency_contacts')
    .optional()
    .isArray().withMessage('Emergency contacts must be an array'),

  body('emergency_contacts.*.name')
    .optional()
    .trim()
    .notEmpty().withMessage('Emergency contact name is required')
    .isLength({ max: 255 }).withMessage('Emergency contact name cannot exceed 255 characters'),

  body('emergency_contacts.*.phone_number')
    .optional()
    .trim()
    .notEmpty().withMessage('Emergency contact phone number is required')
    .matches(/^[0-9+\- ]+$/).withMessage('Emergency contact phone number contains invalid characters'),

  body('emergency_contacts.*.relationship')
    .optional()
    .trim()
    .notEmpty().withMessage('Emergency contact relationship is required')
    .isLength({ max: 50 }).withMessage('Emergency contact relationship cannot exceed 50 characters'),

  // Next of kin validation
  body('next_of_kin')
    .optional()
    .isArray().withMessage('Next of kin must be an array'),

  body('next_of_kin.*.name')
    .optional()
    .trim()
    .notEmpty().withMessage('Next of kin name is required')
    .isLength({ max: 255 }).withMessage('Next of kin name cannot exceed 255 characters'),

  body('next_of_kin.*.phone_number')
    .optional()
    .trim()
    .notEmpty().withMessage('Next of kin phone number is required')
    .matches(/^[0-9+\- ]+$/).withMessage('Next of kin phone number contains invalid characters'),

  body('next_of_kin.*.percentage')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Next of kin percentage must be between 1 and 100'),

  body('next_of_kin.*.relationship')
    .optional()
    .trim()
    .notEmpty().withMessage('Next of kin relationship is required')
    .isLength({ max: 50 }).withMessage('Next of kin relationship cannot exceed 50 characters'),

  // Roles validation
  body('roles')
    .optional()
    .isArray().withMessage('Roles must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        if (!value.every(id => Number.isInteger(id) && id > 0)) {
          throw new Error('All role IDs must be positive integers');
        }
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
  createUserValidator,
  updateUserValidator,
};