const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { comparePassword } = require('../utils/hashUtils');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendEmail } = require('../services/mailer');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [{ email }, { username }],
      },
    });
    
    if (existingUser) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'User already exists',
        [{ field: existingUser.email === email ? 'email' : 'username', message: 'Already in use' }]
      );
    }
    
    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });
    
    // Generate tokens
    const token = generateToken({ id: newUser.id });
    
    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Our Platform',
      template: 'welcome',
      templateData: {
        firstName,
        username,
      },
    });
    
    // Return response
    return successResponse(
      res,
      StatusCodes.CREATED,
      'User registered successfully',
      {
        user: newUser.toJSON(),
        token,
      }
    );
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid credentials'
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'Account is deactiv