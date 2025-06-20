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
 * @route GET /api/v1/roles
 */
const getAllRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, include_permissions = false } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { role_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const includeOptions = [];
    if (include_permissions === 'true') {
      includeOptions.push({
        model: Permission,
        through: { attributes: [] },
        as: 'permissions'
      });
    }

    const { count, rows: roles } = await Role.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // Add user count for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await UserRole.count({ where: { role_id: role.id } });
        const permissionCount = await RolePermission.count({ where: { role_id: role.id } });

        return {
          ...role.toJSON(),
          users_count: userCount,
          permissions_count: permissionCount
        };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: rolesWithCounts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 * @route GET /api/v1/roles/:id
 */
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { include_permissions = false } = req.query;

    const includeOptions = [];
    if (include_permissions === 'true') {
      includeOptions.push({
        model: Permission,
        through: { attributes: [] },
        as: 'permissions'
      });
    }

    const role = await Role.findByPk(id, {
      include: includeOptions
    });

    if (!role) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Add counts
    const userCount = await UserRole.count({ where: { role_id: role.id } });
    const permissionCount = await RolePermission.count({ where: { role_id: role.id } });

    const roleData = {
      ...role.toJSON(),
      users_count: userCount,
      permissions_count: permissionCount
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: roleData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new role
 * @route POST /api/v1/roles
 */
const createRole = async (req, res, next) => {
  try {
    const { role_name, description, is_default, permissions = [] } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ where: { role_name } });
    if (existingRole) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    const role = await Role.create({
      role_name,
      description,
      is_default: is_default || false
    });

    // Assign permissions if provided
    if (permissions.length > 0) {
      const permissionAssignments = permissions.map(permissionId => ({
        role_id: role.id,
        permission_id: permissionId
      }));
      await RolePermission.bulkCreate(permissionAssignments);
    }

    // Fetch the created role with permissions
    const createdRole = await Role.findByPk(role.id, {
      include: [{
        model: Permission,
        through: { attributes: [] },
        as: 'permissions'
      }]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: createdRole,
      message: 'Role created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 * @route PUT /api/v1/roles/:id
 */
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_name, description, is_default } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if role name already exists (excluding current role)
    if (role_name && role_name !== role.role_name) {
      const existingRole = await Role.findOne({
        where: {
          role_name,
          id: { [Op.ne]: id }
        }
      });
      if (existingRole) {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: 'Role with this name already exists'
        });
      }
    }

    await role.update({
      role_name: role_name || role.role_name,
      description: description !== undefined ? description : role.description,
      is_default: is_default !== undefined ? is_default : role.is_default
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: role,
      message: 'Role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 * @route DELETE /api/v1/roles/:id
 */
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if role is default
    if (role.is_default) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete default roles'
      });
    }

    // Check if role is assigned to users
    const userCount = await UserRole.count({ where: { role_id: id } });
    if (userCount > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Cannot delete role. It is assigned to ${userCount} user(s)`
      });
    }

    await role.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all permissions
 * @route GET /api/v1/roles/permissions
 */
const getAllPermissions = async (req, res, next) => {
  try {
    const { module, action } = req.query;

    const whereClause = {};
    if (module) whereClause.module = module;
    if (action) whereClause.action = action;

    const permissions = await Permission.findAll({
      where: whereClause,
      order: [['module', 'ASC'], ['action', 'ASC'], ['permission_name', 'ASC']]
    });

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {});

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        all: permissions,
        grouped: groupedPermissions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get role permissions
 * @route GET /api/v1/roles/:id/permissions
 */
const getRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Role not found'
      });
    }

    const permissions = await Permission.findAll({
      include: [{
        model: RolePermission,
        where: { role_id: id },
        attributes: []
      }]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: permissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role permissions
 * @route PUT /api/v1/roles/:id/permissions
 */
const updateRolePermissions = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { permissions = [] } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      await transaction.rollback();
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Validate permission IDs
    if (permissions.length > 0) {
      const validPermissions = await Permission.findAll({
        where: { id: { [Op.in]: permissions } },
        attributes: ['id']
      });

      const validPermissionIds = validPermissions.map(p => p.id);
      const invalidPermissions = permissions.filter(id => !validPermissionIds.includes(id));

      if (invalidPermissions.length > 0) {
        await transaction.rollback();
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Invalid permission IDs: ${invalidPermissions.join(', ')}`
        });
      }
    }

    // Remove existing permissions
    await RolePermission.destroy({
      where: { role_id: id },
      transaction
    });

    // Add new permissions
    if (permissions.length > 0) {
      const permissionAssignments = permissions.map(permissionId => ({
        role_id: id,
        permission_id: permissionId
      }));
      await RolePermission.bulkCreate(permissionAssignments, { transaction });
    }

    await transaction.commit();

    // Fetch updated permissions
    const updatedPermissions = await Permission.findAll({
      include: [{
        model: RolePermission,
        where: { role_id: id },
        attributes: []
      }]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedPermissions,
      message: 'Role permissions updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Assign role to user
 * @route POST /api/v1/roles/assign
 */
const assignRole = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { user_id, role_ids = [] } = req.body;

    // Validate user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      await transaction.rollback();
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate roles exist
    if (role_ids.length > 0) {
      const validRoles = await Role.findAll({
        where: { id: { [Op.in]: role_ids } },
        attributes: ['id']
      });

      const validRoleIds = validRoles.map(r => r.id);
      const invalidRoles = role_ids.filter(id => !validRoleIds.includes(id));

      if (invalidRoles.length > 0) {
        await transaction.rollback();
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Invalid role IDs: ${invalidRoles.join(', ')}`
        });
      }
    }

    // Remove existing user roles
    await UserRole.destroy({
      where: { user_id },
      transaction
    });

    // Assign new roles
    if (role_ids.length > 0) {
      const roleAssignments = role_ids.map(roleId => ({
        user_id,
        role_id: roleId,
        assigned_by: req.user?.id,
        assigned_at: new Date()
      }));
      await UserRole.bulkCreate(roleAssignments, { transaction });
    }

    await transaction.commit();

    // Fetch updated user with roles
    const updatedUser = await User.findByPk(user_id, {
      include: [{
        model: Role,
        through: { attributes: [] },
        as: 'roles'
      }]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedUser,
      message: 'Roles assigned successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getRolePermissions,
  updateRolePermissions,
  assignRole
};