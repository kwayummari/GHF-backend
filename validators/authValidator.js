const { body } = require('express-validator');

/**
 * Login validation rules
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
];

/**
 * Password reset validation rules
 */
const resetPasswordValidator = [
  body('currentPassword')
    .trim()
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

module.exports = {
  loginValidator,
  resetPasswordValidator,
};