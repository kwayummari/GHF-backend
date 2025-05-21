const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const BioData = require('../models/BioData');
const PersonalEmployeeData = require('../models/PersonalEmployeeData');
const Department = require('../models/Department');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const { formatDate } = require('../utils/dateUtils');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      gender = '', 
      department = '',
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { sur_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (gender) {
      whereConditions.gender = gender;
    }
    
    // Build association options for department filter
    const includeOptions = [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'role_name']
      }
    ];
    
    if (department) {
      includeOptions.push({
        model: BasicEmployeeData,
        as: 'basicEmployeeData',
        required: true,
        include: [
          {
            model: Department,
            as: 'department',
            where: { id: department },
            attributes: ['id', 'department_name']
          }
        ]
      });
    } else {
      includeOptions.push({
        model: BasicEmployeeData,
        as: 'basicEmployeeData',
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'department_name']
          }
        ]
      });
    }
    
    // Execute query
    const { count, rows } = await User.findAndCountAll({
      where: whereConditions,
      include: includeOptions,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });
    
    // Format user data
    const users = rows.map(user => {
      const userData = user.toJSON();
      
      // Format department data
      if (userData.basicEmployeeData && userData.basicEmployeeData.department) {
        userData.department = userData.basicEmployeeData.department.department_name;
        userData.department_id = userData.basicEmployeeData.department.id;
      } else {
        userData.department = null;
        userData.department_id = null;
      }
      
      // Format roles
      userData.roleNames = userData.roles.map(role => role.role_name);
      
      // Extract essential fields from basicEmployeeData
      if (userData.basicEmployeeData) {
        userData.designation = userData.basicEmployeeData.designation;
        userData.employment_type = userData.basicEmployeeData.employment_type;
        userData.date_joined = userData.basicEmployeeData.date_joined;
      }
      
      // Remove nested objects to make response cleaner
      delete userData.basicEmployeeData;
      
      return userData;
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    
    return paginatedResponse(
      res,
      StatusCodes.OK,
      'Users retrieved successfully',
      users,
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    );
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

/**
 * Get user by ID with detailed information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find user with all related information
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: BasicEmployeeData,
          as: 'basicEmployeeData',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'department_name']
            },
            {
              model: User,
              as: 'supervisor',
              attributes: ['id', 'first_name', 'middle_name', 'sur_name']
            }
          ]
        },
        {
          model: BioData,
          as: 'bioData'
        },
        {
          model: PersonalEmployeeData,
          as: 'personalEmployeeData'
        },
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'role_name']
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
    
    // Format user data
    const userData = user.toJSON();
    
    // Format roles
    userData.roles = userData.roles.map(role => ({
      id: role.id,
      name: role.role_name
    }));
    
    return successResponse(
      res,
      StatusCodes.OK,
      'User retrieved successfully',
      userData
    );
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

/**
 * Update user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      first_name, 
      middle_name, 
      sur_name, 
      email, 
      phone_number, 
      gender, 
      status,
      basic_employee_data,
      bio_data,
      personal_employee_data,
      roles
    } = req.body;
    
    // Find the user
    const user = await User.findByPk(id);
    
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }
    
    // Start a transaction
    const transaction = await User.sequelize.transaction();
    
    try {
      // Update user base information
      await user.update({
        first_name: first_name || user.first_name,
        middle_name,
        sur_name: sur_name || user.sur_name,
        email: email || user.email,
        phone_number,
        gender: gender || user.gender,
        status: status || user.status
      }, { transaction });
      
      // Update/create basic employee data if provided
      if (basic_employee_data) {
        let employeeData = await BasicEmployeeData.findOne({ 
          where: { user_id: id },
          transaction
        });
        
        if (employeeData) {
          await employeeData.update(basic_employee_data, { transaction });
        } else {
          await BasicEmployeeData.create({
            user_id: id,
            ...basic_employee_data
          }, { transaction });
        }
      }
      
      // Update/create bio data if provided
      if (bio_data) {
        let existingBioData = await BioData.findOne({ 
          where: { user_id: id },
          transaction
        });
        
        if (existingBioData) {
          await existingBioData.update(bio_data, { transaction });
        } else {
          await BioData.create({
            user_id: id,
            ...bio_data
          }, { transaction });
        }
      }
      
      // Update/create personal employee data if provided
      if (personal_employee_data) {
        let personalData = await PersonalEmployeeData.findOne({ 
          where: { user_id: id },
          transaction
        });
        
        if (personalData) {
          await personalData.update(personal_employee_data, { transaction });
        } else {
          await PersonalEmployeeData.create({
            user_id: id,
            ...personal_employee_data
          }, { transaction });
        }
      }
      
      // Update roles if provided
      if (roles && Array.isArray(roles)) {
        // Delete current roles
        await UserRole.destroy({
          where: { user_id: id },
          transaction
        });
        
        // Add new roles
        for (const roleId of roles) {
          await UserRole.create({
            user_id: id,
            role_id: roleId
          }, { transaction });
        }
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Get updated user with all related information
      const updatedUser = await User.findOne({
        where: { id },
        include: [
          {
            model: BasicEmployeeData,
            as: 'basicEmployeeData',
            include: [
              {
                model: Department,
                as: 'department',
                attributes: ['id', 'department_name']
              }
            ]
          },
          {
            model: BioData,
            as: 'bioData'
          },
          {
            model: PersonalEmployeeData,
            as: 'personalEmployeeData'
          },
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id', 'role_name']
          }
        ]
      });
      
      return successResponse(
        res,
        StatusCodes.OK,
        'User updated successfully',
        updatedUser
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the user
    const user = await User.findByPk(id);
    
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }
    
    // We don't actually delete the user, we just set status to inactive
    await user.update({ status: 'inactive' });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'User deactivated successfully'
    );
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};