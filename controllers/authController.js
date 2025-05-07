/**
 * Auth Controller
 * Handles authentication-related operations
 */
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { comparePassword } = require('../utils/hashUtils');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
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
        'Account is deactivated'
      );
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid credentials'
      );
    }
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    // Generate tokens
    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Login successful',
      {
        user: user.toJSON(),
        token,
        refreshToken,
      }
    );
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Refresh token is required'
      );
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const userId = decoded.id;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActive) {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid refresh token'
      );
    }
    
    // Generate new tokens
    const newToken = generateToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Token refreshed successfully',
      {
        token: newToken,
        refreshToken: newRefreshToken,
      }
    );
  } catch (error) {
    logger.error('Token refresh error:', error);
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'Invalid refresh token'
    );
  }
};

/**
 * Forgot password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return successResponse(
        res,
        StatusCodes.OK,
        'If an account with that email exists, a password reset link has been sent'
      );
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // For this example, we'll assume there's a PasswordReset model
    // In a real implementation, you would need to create this model
    const PasswordReset = require('../models/PasswordReset');
    await PasswordReset.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    
    // Send reset email
    const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      template: 'password-reset',
      templateData: {
        firstName: user.firstName,
        resetUrl,
      },
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'If an account with that email exists, a password reset link has been sent'
    );
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Hash the token from the request
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // For this example, we'll assume there's a PasswordReset model
    const PasswordReset = require('../models/PasswordReset');
    
    // Find valid reset request
    const resetRequest = await PasswordReset.findOne({
      where: {
        token: hashedToken,
        expiresAt: {
          [User.sequelize.Op.gt]: new Date(),
        },
      },
    });
    
    if (!resetRequest) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Invalid or expired token'
      );
    }
    
    // Find user
    const user = await User.findByPk(resetRequest.userId);
    
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'User not found'
      );
    }
    
    // Update password
    await user.update({ password });
    
    // Delete reset request
    await resetRequest.destroy();
    
    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Changed',
      template: 'password-changed',
      templateData: {
        firstName: user.firstName,
      },
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Password reset successful'
    );
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
};

/**
 * Get authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(
      res,
      StatusCodes.OK,
      'User retrieved successfully',
      req.user
    );
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Find user with password
    const user = await User.findByPk(userId);
    
    // Check current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Current password is incorrect'
      );
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Changed',
      template: 'password-changed',
      templateData: {
        firstName: user.firstName,
      },
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Password changed successfully'
    );
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

// Export all controller functions
module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword
};