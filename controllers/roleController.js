const { StatusCodes } = require('http-status-codes');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { updateAllUserPermissions } = require('../utils/permissionUpdater');

/**
 * Get all roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllRoles = async (req, res, next) => {
  try {
    console.log('Fetching all roles');
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] } // Don't include junction table
        }
      ],
      order: [['role_name', 'ASC']]
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Roles retrieved successfully',
      roles
    );
  } catch (error) {
    logger.error('Get all roles error:', error);
    next(error);
  }
};

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createRole = async (req, res, next) => {
  try {
    const { role_name, description, permission_ids = [] } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({
      where: { role_name }
    });
    
    if (existingRole) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'Role already exists',
        [{ field: 'role_name', message: 'Role name already in use' }]
      );
    }
    
    // Check if all permissions exist
    if (permission_ids.length > 0) {
      const permissions = await Permission.findAll({
        where: { id: { [Op.in]: permission_ids } }
      });
      
      if (permissions.length !== permission_ids.length) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Some permissions do not exist',
          [{ field: 'permission_ids', message: 'One or more permission IDs are invalid' }]
        );
      }
    }
    
    // Start a transaction
    const transaction = await Role.sequelize.transaction();
    
    try {
      // Create the role
      const newRole = await Role.create({
        role_name,
        description,
        is_default: false
      }, { transaction });
      
      // Assign permissions
      for (const permissionId of permission_ids) {
        await RolePermission.create({
          role_id: newRole.id,
          permission_id: permissionId,
          created_by: req.user.id
        }, { transaction });
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Get the created role with permissions
      const createdRole = await Role.findOne({
        where: { id: newRole.id },
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }
        ]
      });

      updateAllUserPermissions();
      
      return successResponse(
        res,
        StatusCodes.CREATED,
        'Role created successfully',
        createdRole
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Create role error:', error);
    next(error);
  }
};

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findOne({
      where: { id },
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!role) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Role not found'
      );
    }
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Role retrieved successfully',
      role
    );
  } catch (error) {
    logger.error('Get role by ID error:', error);
    next(error);
  }
};

/**
 * Update role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_name, description, permission_ids } = req.body;
    
    // Check if role exists
    const role = await Role.findByPk(id);
    
    if (!role) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Role not found'
      );
    }
    
    // Check if role is default and prevent name change if it is
    if (role.is_default && role_name && role_name !== role.role_name) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'Cannot change the name of a default role',
        [{ field: 'role_name', message: 'Default roles cannot be renamed' }]
      );
    }
    
    // Check if new name conflicts with another role
    if (role_name && role_name !== role.role_name) {
      const existingRole = await Role.findOne({
        where: { role_name }
      });
      
      if (existingRole) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'Role name already in use',
          [{ field: 'role_name', message: 'Role name already exists' }]
        );
      }
    }
    
    // Check if all permissions exist
    if (permission_ids && permission_ids.length > 0) {
      const permissions = await Permission.findAll({
        where: { id: { [Op.in]: permission_ids } }
      });
      
      if (permissions.length !== permission_ids.length) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Some permissions do not exist',
          [{ field: 'permission_ids', message: 'One or more permission IDs are invalid' }]
        );
      }
    }
    
    // Start a transaction
    const transaction = await Role.sequelize.transaction();
    
    try {
      // Update role
      await role.update({
        role_name: role_name || role.role_name,
        description: description !== undefined ? description : role.description
      }, { transaction });
      
      // Update permissions if provided
      if (permission_ids) {
        // Remove existing permissions
        await RolePermission.destroy({
          where: { role_id: id },
          transaction
        });
        
        // Add new permissions
        for (const permissionId of permission_ids) {
          await RolePermission.create({
            role_id: id,
            permission_id: permissionId,
            created_by: req.user.id,
            updated_by: req.user.id
          }, { transaction });
        }
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Get updated role with permissions
      const updatedRole = await Role.findOne({
        where: { id },
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }
        ]
      });

      updateAllUserPermissions();
      
      return successResponse(
        res,
        StatusCodes.OK,
        'Role updated successfully',
        updatedRole
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update role error:', error);
    next(error);
  }
};

/**
 * Delete role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const role = await Role.findByPk(id);
    
    if (!role) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Role not found'
      );
    }
    
    // Check if role is default
    if (role.is_default) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'Cannot delete a default role'
      );
    }
    
    // Check if any users have this role
    const userCount = await UserRole.count({
      where: { role_id: id }
    });
    
    if (userCount > 0) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Role is assigned to users',
        [{ field: 'id', message: `${userCount} users have this role assigned` }]
      );
    }
    
    // Start a transaction
    const transaction = await Role.sequelize.transaction();
    
    try {
      // Delete role permissions
      await RolePermission.destroy({
        where: { role_id: id },
        transaction
      });
      
      // Delete role
      await role.destroy({ transaction });
      
      // Commit transaction
      await transaction.commit();
      
      return successResponse(
        res,
        StatusCodes.OK,
        'Role deleted successfully'
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Delete role error:', error);
    next(error);
  }
};

/**
 * Get all permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({
      order: [['module', 'ASC'], ['name', 'ASC']]
    });
    
    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      
      acc[permission.module].push(permission);
      
      return acc;
    }, {});
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Permissions retrieved successfully',
      {
        grouped: groupedPermissions,
        all: permissions
      }
    );
  } catch (error) {
    logger.error('Get all permissions error:', error);
    next(error);
  }
};

/**
 * Assign role to user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const assignRoleToUser = async (req, res, next) => {
  try {
    const { user_id, role_id, role_ids } = req.body;

    // Support both single role_id and multiple role_ids
    const roleIdsToAssign = role_ids || [role_id];

    if (!roleIdsToAssign || roleIdsToAssign.length === 0) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Role ID(s) are required'
      );
    }

    // Check if user exists
    const user = await User.findByPk(user_id);

    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    // Check if all roles exist
    const roles = await Role.findAll({
      where: { id: { [Op.in]: roleIdsToAssign } }
    });

    if (roles.length !== roleIdsToAssign.length) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Some roles not found'
      );
    }

    // Start transaction
    const transaction = await Role.sequelize.transaction();

    try {
      // Remove existing roles for this user
      await UserRole.destroy({
        where: { user_id },
        transaction
      });

      // Add new roles
      const userRoleData = roleIdsToAssign.map(roleId => ({
        user_id,
        role_id: roleId
      }));

      await UserRole.bulkCreate(userRoleData, { transaction });

      await transaction.commit();

      // Get user with updated roles
      const updatedUser = await User.findOne({
        where: { id: user_id },
        attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] }
          }
        ]
      });

      // Update user permissions
      const { updateUserPermissions } = require('../utils/permissionUpdater');
      updateUserPermissions(user_id);

      return successResponse(
        res,
        StatusCodes.OK,
        'Roles assigned to user successfully',
        updatedUser
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Assign role to user error:', error);
    next(error);
  }
};

/**
 * Remove role from user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const removeRoleFromUser = async (req, res, next) => {
  try {
    const { user_id, role_id } = req.params;
    
    // Check if user-role relationship exists
    const userRole = await UserRole.findOne({
      where: {
        user_id,
        role_id
      }
    });
    
    if (!userRole) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User does not have this role',
        [{ field: 'role_id', message: 'Role not assigned to user' }]
      );
    }
    
    // Check if this is the user's only role
    const userRolesCount = await UserRole.count({
      where: { user_id }
    });
    
    if (userRolesCount === 1) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Cannot remove the only role from a user',
        [{ field: 'role_id', message: 'User must have at least one role' }]
      );
    }
    
    // Remove role from user
    await userRole.destroy();
    
    // Get user with updated roles
    const updatedUser = await User.findOne({
      where: { id: user_id },
      attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Role removed from user successfully',
      updatedUser
    );
  } catch (error) {
    logger.error('Remove role from user error:', error);
    next(error);
  }
};

/**
 * Get role menu permissions (with proper associations)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRoleMenuPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await Role.findByPk(id);

    if (!role) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Role not found'
      );
    }

    // Get role permissions with proper associations
    const rolePermissions = await RolePermission.findAll({
      where: { role_id: id },
      include: [
        {
          model: Permission,
          as: 'permission', // This should match the association alias
          attributes: ['id', 'name', 'action', 'module']
        }
      ]
    });

    // Extract permission IDs
    const permissionIds = rolePermissions.map(rp => rp.permission_id);

    return successResponse(
      res,
      StatusCodes.OK,
      'Role menu permissions retrieved successfully',
      {
        role_id: parseInt(id),
        permissions: permissionIds,
        menu_permissions: rolePermissions,
        permission_details: rolePermissions.map(rp => rp.permission)
      }
    );
  } catch (error) {
    logger.error('Get role menu permissions error:', error);
    next(error);
  }
};

/**
 * Update role menu permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateRoleMenuPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions, menu_permissions, permission_ids } = req.body;

    // Use any of the provided permission formats
    const permissionsList = permissions || menu_permissions || permission_ids || [];

    // Check if role exists
    const role = await Role.findByPk(id);

    if (!role) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Role not found'
      );
    }

    // Validate permission IDs if provided
    if (permissionsList.length > 0) {
      const validPermissions = await Permission.findAll({
        where: { id: { [Op.in]: permissionsList } }
      });

      if (validPermissions.length !== permissionsList.length) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Some permissions do not exist'
        );
      }
    }

    // Start transaction
    const transaction = await Role.sequelize.transaction();

    try {
      // Remove existing role permissions
      await RolePermission.destroy({
        where: { role_id: id },
        transaction
      });

      // Add new permissions
      if (permissionsList.length > 0) {
        const rolePermissionsData = permissionsList.map(permissionId => ({
          role_id: parseInt(id),
          permission_id: permissionId,
          created_by: req.user.id
        }));

        await RolePermission.bulkCreate(rolePermissionsData, { transaction });
      }

      await transaction.commit();

      // Update user permissions cache
      updateAllUserPermissions();

      return successResponse(
        res,
        StatusCodes.OK,
        'Role menu permissions updated successfully',
        {
          role_id: parseInt(id),
          permissions_updated: permissionsList.length,
          permission_ids: permissionsList
        }
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update role menu permissions error:', error);
    next(error);
  }
};

module.exports = {
  getAllRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getAllPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getRoleMenuPermissions,
  updateRoleMenuPermissions
};