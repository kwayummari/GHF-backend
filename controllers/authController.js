const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize'); // Import Op directly from sequelize
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const { comparePassword } = require('../utils/hashUtils');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendEmail } = require('../services/mailer');
const logger = require('../utils/logger');
const crypto = require('crypto');
const config = require('../config/config');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = async (req, res, next) => {
  try {
    const { 
      first_name, 
      middle_name, 
      sur_name, 
      email, 
      phone_number, 
      gender, 
      password 
    } = req.body;
    
    // Check if user already exists - Fixed the Op usage
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone_number }],
      },
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone_number';
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'User already exists',
        [{ field, message: 'Already in use' }]
      );
    }
    
    // Create user
    const newUser = await User.create({
      first_name,
      middle_name,
      sur_name,
      email,
      phone_number,
      gender,
      password,
      status: 'active'
    });
    
    // Assign default employee role
    const employeeRole = await Role.findOne({
      where: { 
        role_name: 'Employee',
        is_default: true
      }
    });
    
    if (employeeRole) {
      await UserRole.create({
        user_id: newUser.id,
        role_id: employeeRole.id
      });
    }
    
    // Generate token
    const token = generateToken({ id: newUser.id });
    
    // Send welcome email (optional - comment out if email service isn't configured)
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to GHF HR System',
        template: 'welcome',
        templateData: {
          firstName: first_name,
          fullName: `${first_name} ${sur_name}`,
        },
      });
    } catch (emailError) {
      logger.warn('Failed to send welcome email:', emailError.message);
      // Don't fail registration if email fails
    }
    
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
    
    // Find user with roles
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }, // Don't include junction table
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }, // Don't include junction table
            }
          ]
        }
      ]
    });
    
    // Check if user exists
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid credentials'
      );
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        `Account is ${user.status}`
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
    await user.update({ last_login: new Date() });
    
    // Flatten permissions for easier access
    const userRoles = user.roles ? user.roles.map(role => role.role_name) : [];
    const userPermissions = [];
    
    if (user.roles) {
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => {
            userPermissions.push(`${permission.module}:${permission.action}`);
          });
        }
      });
    }
    
    // Generate tokens
    const token = generateToken({ 
      id: user.id,
      roles: userRoles,
      permissions: userPermissions
    });
    
    const refreshToken = generateRefreshToken({ id: user.id });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Login successful',
      {
        user: {
          ...user.toJSON(),
          roles: userRoles,
          permissions: userPermissions
        },
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
 * Get authenticated user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find user with roles and permissions
    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            }
          ]
        }
      ]
    });
    
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }
    
    // Flatten permissions for easier access
    const userRoles = user.roles ? user.roles.map(role => role.role_name) : [];
    const userPermissions = [];
    
    if (user.roles) {
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => {
            userPermissions.push(`${permission.module}:${permission.action}`);
          });
        }
      });
    }
    
    return successResponse(
      res,
      StatusCodes.OK,
      'User profile retrieved successfully',
      {
        ...user.toJSON(),
        roles: userRoles,
        permissions: userPermissions
      }
    );
  } catch (error) {
    logger.error('Get profile error:', error);
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
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT.REFRESH_SECRET);
    } catch (error) {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid refresh token'
      );
    }
    
    const userId = decoded.id;
    
    // Find user with roles
    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            }
          ]
        }
      ]
    });
    
    if (!user || user.status !== 'active') {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid refresh token'
      );
    }
    
    // Flatten permissions for easier access
    const userRoles = user.roles ? user.roles.map(role => role.role_name) : [];
    const userPermissions = [];
    
    if (user.roles) {
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => {
            userPermissions.push(`${permission.module}:${permission.action}`);
          });
        }
      });
    }
    
    // Generate new tokens
    const token = generateToken({ 
      id: user.id,
      roles: userRoles,
      permissions: userPermissions
    });
    
    const newRefreshToken = generateRefreshToken({ id: user.id });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Token refreshed successfully',
      {
        token,
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
    
    // Send confirmation email (optional - comment out if email service isn't configured)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Changed',
        template: 'password-changed',
        templateData: {
          firstName: user.first_name,
        },
      });
    } catch (emailError) {
      logger.warn('Failed to send password change confirmation email:', emailError.message);
      // Don't fail the password change if email fails
    }
    
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

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
  changePassword,
};