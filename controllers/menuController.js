const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const Menu = require('../models/Menu');
const Permission = require('../models/Permission');
const MenuPermission = require('../models/MenuPermission');
const Role = require('../models/Role');
const RoleMenuAccess = require('../models/RoleMenuAccess');
const RolePermission = require('../models/RolePermission');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Get user's accessible menu structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserMenus = async (req, res, next) => {
    try {
        // Add validation for req.user
        if (!req.user || !req.user.id) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'User not authenticated',
                [{ field: 'user', message: 'User authentication required' }]
            );
        }

        const userId = req.user.id;

        // Get user's roles
        const userRoles = await Role.findAll({
            include: [
                {
                    model: require('../models/User'),
                    as: 'users',
                    where: { id: userId },
                    through: { attributes: [] }
                }
            ]
        });

        const roleIds = userRoles.map(role => role.id);

        if (roleIds.length === 0) {
            return successResponse(
                res,
                StatusCodes.OK,
                'No menus available for user',
                []
            );
        }

        // Rest of the function remains the same...
        // Get user's permissions through roles
        const userPermissions = await Permission.findAll({
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { id: { [Op.in]: roleIds } },
                    through: { attributes: [] }
                }
            ]
        });

        const userPermissionIds = userPermissions.map(permission => permission.id);

        // Get menus that the user has access to through role-menu access
        const accessibleMenus = await Menu.findAll({
            where: {
                is_active: true
            },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { id: { [Op.in]: roleIds } },
                    through: {
                        attributes: [],
                        where: { can_access: true }
                    },
                    required: false
                },
                {
                    model: Permission,
                    as: 'permissions',
                    where: { id: { [Op.in]: userPermissionIds } },
                    through: { attributes: [] },
                    required: false
                }
            ],
            order: [['menu_order', 'ASC'], ['menu_label', 'ASC']]
        });

        // Filter menus based on permissions
        const authorizedMenus = accessibleMenus.filter(menu => {
            // If menu has no specific permissions, it's accessible if role has access
            if (menu.permissions.length === 0) {
                return menu.roles.length > 0;
            }

            // Check if user has any of the required permissions for this menu
            return menu.permissions.some(permission =>
                userPermissionIds.includes(permission.id)
            );
        });

        // Build hierarchical menu structure
        const menuHierarchy = buildMenuHierarchy(authorizedMenus);

        return successResponse(
            res,
            StatusCodes.OK,
            'User menus retrieved successfully',
            menuHierarchy
        );
    } catch (error) {
        logger.error('Get user menus error:', error);
        next(error);
    }
};

/**
 * Get all menus (admin function)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllMenus = async (req, res, next) => {
    try {
        const { include_permissions = false, include_roles = false } = req.query;

        const includeOptions = [];

        if (include_permissions === 'true') {
            includeOptions.push({
                model: Permission,
                as: 'permissions',
                through: { attributes: [] }
            });
        }

        if (include_roles === 'true') {
            includeOptions.push({
                model: Role,
                as: 'roles',
                through: { attributes: ['can_access'] }
            });
        }

        const menus = await Menu.findAll({
            include: includeOptions,
            order: [['menu_order', 'ASC'], ['menu_label', 'ASC']]
        });

        // Build hierarchical structure
        const menuHierarchy = buildMenuHierarchy(menus);

        return successResponse(
            res,
            StatusCodes.OK,
            'All menus retrieved successfully',
            {
                hierarchy: menuHierarchy,
                flat: menus
            }
        );
    } catch (error) {
        logger.error('Get all menus error:', error);
        next(error);
    }
};

/**
 * Create a new menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createMenu = async (req, res, next) => {
    try {
        const {
            menu_name,
            menu_label,
            menu_icon,
            menu_url,
            parent_id,
            menu_order = 0,
            is_active = true,
            permission_ids = [],
            role_ids = []
        } = req.body;

        // Check if menu_name already exists
        const existingMenu = await Menu.findOne({
            where: { menu_name }
        });

        if (existingMenu) {
            return errorResponse(
                res,
                StatusCodes.CONFLICT,
                'Menu name already exists',
                [{ field: 'menu_name', message: 'Menu name must be unique' }]
            );
        }

        // Validate parent menu if provided
        if (parent_id) {
            const parentMenu = await Menu.findByPk(parent_id);
            if (!parentMenu) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Parent menu not found',
                    [{ field: 'parent_id', message: 'Parent menu does not exist' }]
                );
            }
        }

        // Validate permissions if provided
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

        // Validate roles if provided
        if (role_ids.length > 0) {
            const roles = await Role.findAll({
                where: { id: { [Op.in]: role_ids } }
            });

            if (roles.length !== role_ids.length) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Some roles do not exist',
                    [{ field: 'role_ids', message: 'One or more role IDs are invalid' }]
                );
            }
        }

        // Start transaction
        const transaction = await Menu.sequelize.transaction();

        try {
            // Create the menu
            const newMenu = await Menu.create({
                menu_name,
                menu_label,
                menu_icon,
                menu_url,
                parent_id,
                menu_order,
                is_active
            }, { transaction });

            // Assign permissions to menu
            for (const permissionId of permission_ids) {
                await MenuPermission.create({
                    menu_id: newMenu.id,
                    permission_id: permissionId
                }, { transaction });
            }

            // Assign roles to menu
            for (const roleId of role_ids) {
                await RoleMenuAccess.create({
                    role_id: roleId,
                    menu_id: newMenu.id,
                    can_access: true
                }, { transaction });
            }

            // Commit transaction
            await transaction.commit();

            // Get created menu with associations
            const createdMenu = await Menu.findOne({
                where: { id: newMenu.id },
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] }
                    },
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: ['can_access'] }
                    }
                ]
            });

            return successResponse(
                res,
                StatusCodes.CREATED,
                'Menu created successfully',
                createdMenu
            );
        } catch (error) {
            // Rollback transaction in case of error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Create menu error:', error);
        next(error);
    }
};

/**
 * Update menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateMenu = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            menu_name,
            menu_label,
            menu_icon,
            menu_url,
            parent_id,
            menu_order,
            is_active,
            permission_ids,
            role_ids
        } = req.body;

        // Check if menu exists
        const menu = await Menu.findByPk(id);

        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        // Check if new menu_name conflicts with existing menu (if changed)
        if (menu_name && menu_name !== menu.menu_name) {
            const existingMenu = await Menu.findOne({
                where: {
                    menu_name,
                    id: { [Op.ne]: id }
                }
            });

            if (existingMenu) {
                return errorResponse(
                    res,
                    StatusCodes.CONFLICT,
                    'Menu name already exists',
                    [{ field: 'menu_name', message: 'Menu name must be unique' }]
                );
            }
        }

        // Validate parent menu if provided
        if (parent_id && parent_id !== menu.parent_id) {
            const parentMenu = await Menu.findByPk(parent_id);
            if (!parentMenu) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Parent menu not found',
                    [{ field: 'parent_id', message: 'Parent menu does not exist' }]
                );
            }

            // Check for circular reference
            if (parent_id === id) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Menu cannot be its own parent',
                    [{ field: 'parent_id', message: 'Circular reference not allowed' }]
                );
            }
        }

        // Validate permissions if provided
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

        // Validate roles if provided
        if (role_ids && role_ids.length > 0) {
            const roles = await Role.findAll({
                where: { id: { [Op.in]: role_ids } }
            });

            if (roles.length !== role_ids.length) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Some roles do not exist',
                    [{ field: 'role_ids', message: 'One or more role IDs are invalid' }]
                );
            }
        }

        // Start transaction
        const transaction = await Menu.sequelize.transaction();

        try {
            // Update menu
            await menu.update({
                menu_name: menu_name || menu.menu_name,
                menu_label: menu_label || menu.menu_label,
                menu_icon: menu_icon !== undefined ? menu_icon : menu.menu_icon,
                menu_url: menu_url !== undefined ? menu_url : menu.menu_url,
                parent_id: parent_id !== undefined ? parent_id : menu.parent_id,
                menu_order: menu_order !== undefined ? menu_order : menu.menu_order,
                is_active: is_active !== undefined ? is_active : menu.is_active
            }, { transaction });

            // Update permissions if provided
            if (permission_ids) {
                // Remove existing permissions
                await MenuPermission.destroy({
                    where: { menu_id: id },
                    transaction
                });

                // Add new permissions
                for (const permissionId of permission_ids) {
                    await MenuPermission.create({
                        menu_id: id,
                        permission_id: permissionId
                    }, { transaction });
                }
            }

            // Update roles if provided
            if (role_ids) {
                // Remove existing role access
                await RoleMenuAccess.destroy({
                    where: { menu_id: id },
                    transaction
                });

                // Add new role access
                for (const roleId of role_ids) {
                    await RoleMenuAccess.create({
                        role_id: roleId,
                        menu_id: id,
                        can_access: true
                    }, { transaction });
                }
            }

            // Commit transaction
            await transaction.commit();

            // Get updated menu with associations
            const updatedMenu = await Menu.findOne({
                where: { id },
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] }
                    },
                    {
                        model: Role,
                        as: 'roles',
                        through: { attributes: ['can_access'] }
                    }
                ]
            });

            return successResponse(
                res,
                StatusCodes.OK,
                'Menu updated successfully',
                updatedMenu
            );
        } catch (error) {
            // Rollback transaction in case of error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Update menu error:', error);
        next(error);
    }
};

/**
 * Delete menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteMenu = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if menu exists
        const menu = await Menu.findByPk(id);

        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        // Check if menu has children
        const childMenus = await Menu.count({
            where: { parent_id: id }
        });

        if (childMenus > 0) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'Cannot delete menu with child menus',
                [{ field: 'id', message: `Menu has ${childMenus} child menu(s)` }]
            );
        }

        // Start transaction
        const transaction = await Menu.sequelize.transaction();

        try {
            // Delete menu permissions
            await MenuPermission.destroy({
                where: { menu_id: id },
                transaction
            });

            // Delete role menu access
            await RoleMenuAccess.destroy({
                where: { menu_id: id },
                transaction
            });

            // Delete menu
            await menu.destroy({ transaction });

            // Commit transaction
            await transaction.commit();

            return successResponse(
                res,
                StatusCodes.OK,
                'Menu deleted successfully'
            );
        } catch (error) {
            // Rollback transaction in case of error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Delete menu error:', error);
        next(error);
    }
};

/**
 * Get menu by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMenuById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const menu = await Menu.findOne({
            where: { id },
            include: [
                {
                    model: Menu,
                    as: 'parent',
                    attributes: ['id', 'menu_name', 'menu_label']
                },
                {
                    model: Menu,
                    as: 'children',
                    attributes: ['id', 'menu_name', 'menu_label', 'menu_order']
                },
                {
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] }
                },
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: ['can_access'] }
                }
            ]
        });

        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        return successResponse(
            res,
            StatusCodes.OK,
            'Menu retrieved successfully',
            menu
        );
    } catch (error) {
        logger.error('Get menu by ID error:', error);
        next(error);
    }
};

/**
 * Update role menu access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateRoleMenuAccess = async (req, res, next) => {
    try {
        const { role_id, menu_id } = req.params;
        const { can_access } = req.body;

        // Check if role exists
        const role = await Role.findByPk(role_id);
        if (!role) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Role not found'
            );
        }

        // Check if menu exists
        const menu = await Menu.findByPk(menu_id);
        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        // Update or create role menu access
        const [roleMenuAccess, created] = await RoleMenuAccess.upsert({
            role_id,
            menu_id,
            can_access: can_access !== undefined ? can_access : true
        });

        return successResponse(
            res,
            StatusCodes.OK,
            created ? 'Role menu access created successfully' : 'Role menu access updated successfully',
            roleMenuAccess
        );
    } catch (error) {
        logger.error('Update role menu access error:', error);
        next(error);
    }
};

/**
 * Helper function to build hierarchical menu structure
 * @param {Array} menus - Flat array of menus
 * @returns {Array} - Hierarchical menu structure
 */
const buildMenuHierarchy = (menus) => {
    const menuMap = new Map();
    const rootMenus = [];

    // Create a map of all menus
    menus.forEach(menu => {
        menuMap.set(menu.id, {
            ...menu.toJSON(),
            children: []
        });
    });

    // Build hierarchy
    menus.forEach(menu => {
        if (menu.parent_id) {
            const parent = menuMap.get(menu.parent_id);
            if (parent) {
                parent.children.push(menuMap.get(menu.id));
            }
        } else {
            rootMenus.push(menuMap.get(menu.id));
        }
    });

    // Sort children by menu_order
    const sortChildren = (menu) => {
        if (menu.children && menu.children.length > 0) {
            menu.children.sort((a, b) => a.menu_order - b.menu_order);
            menu.children.forEach(sortChildren);
        }
    };

    rootMenus.forEach(sortChildren);

    return rootMenus;
};

/**
 * Get menu permission matrix
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMenuPermissionMatrix = async (req, res, next) => {
    try {
        // Make sure to import these models at the top of your controller file
        const Role = require('../models/Role');
        const Menu = require('../models/Menu');
        const RoleMenuAccess = require('../models/RoleMenuAccess');

        // Get all roles
        const roles = await Role.findAll({
            attributes: ['id', 'role_name', 'description'],
            order: [['role_name', 'ASC']]
        });

        // Get all active menus (including submenus)
        const menus = await Menu.findAll({
            attributes: ['id', 'menu_name', 'menu_label', 'parent_id', 'menu_order', 'menu_url'],
            where: { is_active: true },
            order: [['menu_order', 'ASC'], ['menu_label', 'ASC']]
        });

        // Get ALL role-menu access records from the database
        const roleMenuAccessRecords = await RoleMenuAccess.findAll({
            where: { can_access: true }, // Only get records where access is granted
            attributes: ['role_id', 'menu_id', 'can_access']
        });

        // Build the permission matrix from actual database data
        const permissionMatrix = {};

        // Initialize all combinations as false
        roles.forEach(role => {
            menus.forEach(menu => {
                const key = `${role.id}-${menu.id}`;
                permissionMatrix[key] = false;
            });
        });

        // Set true for actual permissions from database
        roleMenuAccessRecords.forEach(access => {
            const key = `${access.role_id}-${access.menu_id}`;
            permissionMatrix[key] = access.can_access;
        });

        // Also get the hierarchical menu structure for better frontend display
        const buildMenuHierarchy = (menus, parentId = null) => {
            return menus
                .filter(menu => menu.parent_id === parentId)
                .sort((a, b) => a.menu_order - b.menu_order)
                .map(menu => ({
                    ...menu.toJSON(),
                    level: parentId === null ? 0 : 1, // Simple level calculation
                    children: buildMenuHierarchy(menus, menu.id)
                }));
        };

        const menuHierarchy = buildMenuHierarchy(menus);

        return successResponse(
            res,
            StatusCodes.OK,
            'Menu permission matrix retrieved successfully',
            {
                roles: roles,
                menus: menus,
                menuHierarchy: menuHierarchy,
                matrix: permissionMatrix,
                // Additional debug info
                totalPermissions: roleMenuAccessRecords.length,
                matrixSize: Object.keys(permissionMatrix).length
            }
        );
    } catch (error) {
        logger.error('Get menu permission matrix error:', error);
        next(error);
    }
};

const getMenuStatistics = async (req, res, next) => {
    try {
        const Menu = require('../models/Menu');
        const Role = require('../models/Role');
        const RoleMenuAccess = require('../models/RoleMenuAccess');

        // Get menu counts
        const totalMenus = await Menu.count();
        const activeMenus = await Menu.count({ where: { is_active: true } });
        const parentMenus = await Menu.count({ where: { parent_id: null } });
        const totalRoles = await Role.count();

        // Get permission counts
        const totalPermissions = await RoleMenuAccess.count();
        const activePermissions = await RoleMenuAccess.count({ where: { can_access: true } });

        return successResponse(
            res,
            StatusCodes.OK,
            'Menu statistics retrieved successfully',
            {
                totalMenus,
                activeMenus,
                parentMenus,
                totalRoles,
                totalPermissions,
                activePermissions
            }
        );
    } catch (error) {
        logger.error('Get menu statistics error:', error);
        next(error);
    }
};

/**
 * Update menu order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateMenuOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { menu_order, parent_id } = req.body;

        // Check if menu exists
        const menu = await Menu.findByPk(id);

        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        // Validate parent menu if provided
        if (parent_id && parent_id !== menu.parent_id) {
            const parentMenu = await Menu.findByPk(parent_id);
            if (!parentMenu) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Parent menu not found',
                    [{ field: 'parent_id', message: 'Parent menu does not exist' }]
                );
            }

            // Check for circular reference
            if (parent_id === id) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    'Menu cannot be its own parent',
                    [{ field: 'parent_id', message: 'Circular reference not allowed' }]
                );
            }
        }

        // Update menu order and parent
        await menu.update({
            menu_order: menu_order !== undefined ? menu_order : menu.menu_order,
            parent_id: parent_id !== undefined ? parent_id : menu.parent_id
        });

        // Get updated menu
        const updatedMenu = await Menu.findOne({
            where: { id },
            include: [
                {
                    model: Menu,
                    as: 'parent',
                    attributes: ['id', 'menu_name', 'menu_label']
                },
                {
                    model: Menu,
                    as: 'children',
                    attributes: ['id', 'menu_name', 'menu_label', 'menu_order']
                }
            ]
        });

        return successResponse(
            res,
            StatusCodes.OK,
            'Menu order updated successfully',
            updatedMenu
        );
    } catch (error) {
        logger.error('Update menu order error:', error);
        next(error);
    }
};

/**
 * Bulk update role-menu permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const bulkUpdateRoleMenuPermissions = async (req, res, next) => {
    try {
        const { permissions } = req.body;

        if (!permissions || !Array.isArray(permissions)) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'Invalid permissions data',
                [{ field: 'permissions', message: 'Permissions must be an array' }]
            );
        }

        // Start transaction
        const transaction = await Menu.sequelize.transaction();

        try {
            // Process each permission update
            for (const permission of permissions) {
                const { role_id, menu_id, can_access } = permission;

                // Validate role exists
                const role = await Role.findByPk(role_id);
                if (!role) {
                    throw new Error(`Role with ID ${role_id} not found`);
                }

                // Validate menu exists
                const menu = await Menu.findByPk(menu_id);
                if (!menu) {
                    throw new Error(`Menu with ID ${menu_id} not found`);
                }

                // Update or create role menu access
                await RoleMenuAccess.upsert({
                    role_id,
                    menu_id,
                    can_access: can_access !== undefined ? can_access : true
                }, { transaction });
            }

            // Commit transaction
            await transaction.commit();

            return successResponse(
                res,
                StatusCodes.OK,
                'Role menu permissions updated successfully',
                { updated_count: permissions.length }
            );
        } catch (error) {
            // Rollback transaction in case of error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Bulk update role menu permissions error:', error);
        next(error);
    }
};

/**
 * Get role menu permissions for a specific menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRoleMenuPermissions = async (req, res, next) => {
    try {
        const { menu_id } = req.params;

        // Check if menu exists
        const menu = await Menu.findByPk(menu_id);
        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        // Get all roles with their access status for this menu
        const roles = await Role.findAll({
            include: [
                {
                    model: Menu,
                    as: 'menus',
                    where: { id: menu_id },
                    through: {
                        attributes: ['can_access'],
                        as: 'access'
                    },
                    required: false
                }
            ],
            order: [['role_name', 'ASC']]
        });

        // Build permission matrix for this menu
        const permissionMatrix = {};
        roles.forEach(role => {
            const access = role.menus && role.menus.length > 0 ? role.menus[0].access.can_access : false;
            permissionMatrix[`${role.id}-${menu_id}`] = access;
        });

        return successResponse(
            res,
            StatusCodes.OK,
            'Role menu permissions retrieved successfully',
            {
                menu,
                roles,
                permissions: permissionMatrix
            }
        );
    } catch (error) {
        logger.error('Get role menu permissions error:', error);
        next(error);
    }
};

/**
 * Update role menu permissions for a specific menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateRoleMenuPermissions = async (req, res, next) => {
    try {
        const { menu_id } = req.params;
        const { role_permissions } = req.body;

        // Check if menu exists
        const menu = await Menu.findByPk(menu_id);
        if (!menu) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Menu not found'
            );
        }

        if (!role_permissions || typeof role_permissions !== 'object') {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'Invalid role permissions data',
                [{ field: 'role_permissions', message: 'Role permissions must be an object' }]
            );
        }

        // Start transaction
        const transaction = await Menu.sequelize.transaction();

        try {
            // Process each role permission
            for (const [key, can_access] of Object.entries(role_permissions)) {
                const [role_id] = key.split('-');

                if (!role_id || role_id === menu_id.toString()) continue;

                // Validate role exists
                const role = await Role.findByPk(role_id);
                if (!role) {
                    continue; // Skip invalid roles
                }

                // Update or create role menu access
                await RoleMenuAccess.upsert({
                    role_id: parseInt(role_id),
                    menu_id: parseInt(menu_id),
                    can_access: Boolean(can_access)
                }, { transaction });
            }

            // Commit transaction
            await transaction.commit();

            return successResponse(
                res,
                StatusCodes.OK,
                'Menu permissions updated successfully'
            );
        } catch (error) {
            // Rollback transaction in case of error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logger.error('Update role menu permissions error:', error);
        next(error);
    }
};

module.exports = {
    getUserMenus,
    getAllMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    getMenuById,
    updateRoleMenuAccess,
    getMenuPermissionMatrix,
    updateMenuOrder,
    bulkUpdateRoleMenuPermissions,
    getRoleMenuPermissions,
    updateRoleMenuPermissions,
    getMenuStatistics
};