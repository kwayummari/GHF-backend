const User = require('../models/User');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * User Controller
 * Handles all user-related operations including CRUD operations,
 * profile management, and user status management
 */

/**
 * Get all users with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, department_id, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) whereClause.role = role;
    if (department_id) whereClause.department_id = department_id;
    if (status) whereClause.status = status;

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] }
    });

    const totalPages = Math.ceil(users.count / limit);
    
    return successResponse(res, {
      users: users.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: users.count,
        itemsPerPage: parseInt(limit)
      }
    }, 'Users retrieved successfully');

  } catch (error) {
    logger.error('Error in getAllUsers:', error);
    return errorResponse(res, 'Failed to retrieve users', 500);
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User retrieved successfully');

  } catch (error) {
    logger.error('Error in getUserById:', error);
    return errorResponse(res, 'Failed to retrieve user', 500);
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Remove password from update data if present
    delete updateData.password;

    await user.update(updateData);

    // Return user without password
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    return successResponse(res, updatedUser, 'User updated successfully');

  } catch (error) {
    logger.error('Error in updateUser:', error);
    return errorResponse(res, 'Failed to update user', 500);
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.destroy();

    return successResponse(res, null, 'User deleted successfully');

  } catch (error) {
    logger.error('Error in deleteUser:', error);
    return errorResponse(res, 'Failed to delete user', 500);
  }
};

/**
 * Activate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.update({ status: 'active' });

    return successResponse(res, { status: 'active' }, 'User activated successfully');

  } catch (error) {
    logger.error('Error in activateUser:', error);
    return errorResponse(res, 'Failed to activate user', 500);
  }
};

/**
 * Deactivate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.update({ status: 'inactive' });

    return successResponse(res, { status: 'inactive' }, 'User deactivated successfully');

  } catch (error) {
    logger.error('Error in deactivateUser:', error);
    return errorResponse(res, 'Failed to deactivate user', 500);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'Profile retrieved successfully');

  } catch (error) {
    logger.error('Error in getProfile:', error);
    return errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

/**
 * Update current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Only allow updating certain fields for profile
    const allowedFields = ['firstName', 'lastName', 'phone'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);

    // Return updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    return successResponse(res, updatedUser, 'Profile updated successfully');

  } catch (error) {
    logger.error('Error in updateProfile:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getProfile,
  updateProfile
};
