const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const Menu = require('../models/Menu');
const logger = require('../utils/logger');

/**
 * Route to permission mapping configuration
 * This maps HTTP method + route pattern to required permissions
 */
const ROUTE_PERMISSIONS = {
    // Authentication routes (no permissions required)
    'POST:/api/v1/auth/login': { public: true },
    'POST:/api/v1/auth/register': { public: true },
    'POST:/api/v1/auth/refresh-token': { public: true },
    'GET:/api/v1/auth/profile': { authenticated: true },
    'POST:/api/v1/auth/change-password': { authenticated: true },

    // User management
    'GET:/api/v1/users': { permissions: ['Users:read'], roles: ['Admin', 'HR Manager'] },
    'POST:/api/v1/users': { permissions: ['Users:create'], roles: ['Admin', 'HR Manager'] },
    'GET:/api/v1/users/:id': { permissions: ['Users:read'], roles: ['Admin', 'HR Manager'], allowOwn: true },
    'PUT:/api/v1/users/:id': { permissions: ['Users:update'], roles: ['Admin', 'HR Manager'] },
    'DELETE:/api/v1/users/:id': { permissions: ['Users:delete'], roles: ['Admin'] },

    // Department management
    'GET:/api/v1/departments': { permissions: ['HR:read'], roles: ['Admin', 'HR Manager', 'Department Head'] },
    'POST:/api/v1/departments': { permissions: ['HR:create'], roles: ['Admin', 'HR Manager'] },
    'GET:/api/v1/departments/:id': { permissions: ['HR:read'], roles: ['Admin', 'HR Manager', 'Department Head'] },
    'PUT:/api/v1/departments/:id': { permissions: ['HR:update'], roles: ['Admin', 'HR Manager'] },
    'DELETE:/api/v1/departments/:id': { permissions: ['HR:delete'], roles: ['Admin'] },
    'GET:/api/v1/departments/:id/employees': { permissions: ['HR:read'], roles: ['Admin', 'HR Manager', 'Department Head'] },

    // Leave management
    'GET:/api/v1/leaves/types': { authenticated: true },
    'POST:/api/v1/leaves': { permissions: ['Leaves:create'], roles: ['Admin', 'HR Manager', 'Department Head', 'Employee'] },
    'GET:/api/v1/leaves': { permissions: ['Leaves:read'], roles: ['Admin', 'HR Manager', 'Department Head'], allowOwn: true },
    'GET:/api/v1/leaves/:id': { permissions: ['Leaves:read'], roles: ['Admin', 'HR Manager', 'Department Head'], allowOwn: true },
    'PUT:/api/v1/leaves/:id/status': { permissions: ['Leaves:update'], roles: ['Admin', 'HR Manager', 'Department Head'] },
    'PUT:/api/v1/leaves/:id': { permissions: ['Leaves:update'], roles: ['Admin', 'HR Manager'], allowOwn: true },
    'PUT:/api/v1/leaves/:id/cancel': { permissions: ['Leaves:update'], roles: ['Admin', 'HR Manager'], allowOwn: true },

    // Attendance management
    'POST:/api/v1/attendance/clock-in': { authenticated: true },
    'POST:/api/v1/attendance/clock-out': { authenticated: true },
    'GET:/api/v1/attendance/my': { authenticated: true },
    'GET:/api/v1/attendance/employee/:id': { permissions: ['HR:read'], roles: ['Admin', 'HR Manager', 'Department Head'] },
    'GET:/api/v1/attendance/department/:id/report': { permissions: ['HR:read'], roles: ['Admin', 'HR Manager', 'Department Head'] },
    'PUT:/api/v1/attendance/:id': { permissions: ['HR:update'], roles: ['Admin', 'HR Manager'] },
    'GET:/api/v1/attendance/schedule': { authenticated: true },
    'PUT:/api/v1/attendance/schedule/:id': { permissions: ['Settings:update'], roles: ['Admin'] },
    'GET:/api/v1/attendance/holidays': { authenticated: true },
    'POST:/api/v1/attendance/holidays': { permissions: ['Settings:create'], roles: ['Admin', 'HR Manager'] },
    'PUT:/api/v1/attendance/holidays/:id': { permissions: ['Settings:update'], roles: ['Admin', 'HR Manager'] },
    'DELETE:/api/v1/attendance/holidays/:id': { permissions: ['Settings:delete'], roles: ['Admin'] },

    // Document management
    'POST:/api/v1/documents/upload': { permissions: ['Documents:create'], roles: ['Admin', 'HR Manager', 'Department Head', 'Employee'] },
    'GET:/api/v1/documents/my': { authenticated: true },
    'GET:/api/v1/documents/user/:id': { permissions: ['Documents:read'], roles: ['Admin', 'HR Manager'] },
    'GET:/api/v1/documents/:id': { permissions: ['Documents:read'], roles: ['Admin', 'HR Manager'], allowOwn: true },
    'GET:/api/v1/documents/:id/download': { permissions: ['Documents:read'], roles: ['Admin', 'HR Manager'], allowOwn: true },
    'PUT:/api/v1/documents/:id': { permissions: ['Documents:update'], roles: ['Admin', 'HR Manager'], allowOwn: true },
    'DELETE:/api/v1/documents/:id': { permissions: ['Documents:delete'], roles: ['Admin', 'HR Manager'], allowOwn: true },

    // Role and permission management
    'GET:/api/v1/roles': { permissions: ['Settings:read'], roles: ['Admin'] },
    'POST:/api/v1/roles': { permissions: ['Settings:create'], roles: ['Admin'] },
    'GET:/api/v1/roles/:id': { permissions: ['Settings:read'], roles: ['Admin'] },
    'PUT:/api/v1/roles/:id': { permissions: ['Settings:update'], roles: ['Admin'] },
    'DELETE:/api/v1/roles/:id': { permissions: ['Settings:delete'], roles: ['Admin'] },
    'GET:/api/v1/roles/permissions': { permissions: ['Settings:read'], roles: ['Admin'] },
    'POST:/api/v1/roles/assign': { permissions: ['Settings:update'], roles: ['Admin'] },
    'DELETE:/api/v1/roles/:role_id/users/:user_id': { permissions: ['Settings:delete'], roles: ['Admin'] },
    'GET:/api/v1/roles/:id/menu-permissions': { permissions: ['Settings:read'], roles: ['Admin'] },
    'PUT:/api/v1/roles/:id/menu-permissions': { permissions: ['Settings:update'], roles: ['Admin'] },

    // Menu management
    'GET:/api/v1/menus/user': { authenticated: true },
    'GET:/api/v1/menus': { permissions: ['Settings:read'], roles: ['Admin'] },
    'POST:/api/v1/menus': { permissions: ['Settings:create'], roles: ['Admin'] },
    'GET:/api/v1/menus/:id': { permissions: ['Settings:read'], roles: ['Admin'] },
    'PUT:/api/v1/menus/:id': { permissions: ['Settings:update'], roles: ['Admin'] },
    'DELETE:/api/v1/menus/:id': { permissions: ['Settings:delete'], roles: ['Admin'] },
    'PUT:/api/v1/menus/roles/:role_id/menus/:menu_id/access': { permissions: ['Settings:update'], roles: ['Admin'] },

    // Dashboard
    'GET:/api/v1/dashboard/stats': { permissions: ['Dashboard:read'], roles: ['Admin', 'HR Manager', 'Department Head', 'Employee'] },

    // Finance (if you add these routes later)
    'GET:/api/v1/finance/budgets': { permissions: ['Finance:read'], roles: ['Admin', 'Finance Manager'] },
    'POST:/api/v1/finance/budgets': { permissions: ['Finance:create'], roles: ['Admin', 'Finance Manager'] },
    'GET:/api/v1/finance/expense-reports': { permissions: ['Finance:read'], roles: ['Admin', 'Finance Manager'] },
    'POST:/api/v1/finance/expense-reports': { permissions: ['Finance:create'], roles: ['Admin', 'Finance Manager', 'Department Head', 'Employee'] },

    // Reports
    'GET:/api/v1/reports/attendance': { permissions: ['Reports:read'], roles: ['Admin', 'HR Manager'] },
    'GET:/api/v1/reports/leave': { permissions: ['Reports:read'], roles: ['Admin', 'HR Manager'] },
    'GET:/api/v1/reports/payroll': { permissions: ['Reports:read'], roles: ['Admin', 'Finance Manager'] },
    'GET:/api/v1/reports/budget': { permissions: ['Reports:read'], roles: ['Admin', 'Finance Manager'] },
    'GET:/api/v1/reports/performance': { permissions: ['Reports:read'], roles: ['Admin', 'HR Manager'] },

    // Add these to your ROUTE_PERMISSIONS object:
    'GET:/api/v1/menus/user': { authenticated: true },
    'GET:/api/v1/menus': { permissions: ['Settings:read'], roles: ['Admin'] },
    'POST:/api/v1/menus': { permissions: ['Settings:create'], roles: ['Admin'] },
    'GET:/api/v1/menus/:id': { permissions: ['Settings:read'], roles: ['Admin'] },
    'PUT:/api/v1/menus/:id': { permissions: ['Settings:update'], roles: ['Admin'] },
    'DELETE:/api/v1/menus/:id': { permissions: ['Settings:delete'], roles: ['Admin'] },
    'PUT:/api/v1/menus/roles/:role_id/menus/:menu_id/access': { permissions: ['Settings:update'], roles: ['Admin'] },
};

/**
 * Cache for user permissions to avoid repeated database queries
 */
const userPermissionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear expired cache entries
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userPermissionCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            userPermissionCache.delete(key);
        }
    }
}, CACHE_DURATION);

/**
 * Get user permissions with caching
 * @param {number} userId - User ID
 * @returns {Object} - User permissions and roles
 */
const getUserPermissions = async (userId) => {
    const cacheKey = `user_${userId}`;
    const cached = userPermissionCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }

    try {
        // Get user with roles and permissions
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
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return { roles: [], permissions: [], menuAccess: [] };
        }

        // Extract roles and permissions
        const roles = user.roles.map(role => role.role_name);
        const permissions = [];

        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                const permissionKey = `${permission.module}:${permission.action}`;
                if (!permissions.includes(permissionKey)) {
                    permissions.push(permissionKey);
                }
            });
        });

        // Get accessible menus
        const roleIds = user.roles.map(role => role.id);
        const accessibleMenus = [];

        if (roleIds.length > 0) {
            const menus = await Menu.findAll({
                where: { is_active: true },
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
                        through: { attributes: [] },
                        required: false
                    }
                ]
            });

            menus.forEach(menu => {
                // Check if user has required permissions for this menu
                let hasAccess = true;

                if (menu.permissions && menu.permissions.length > 0) {
                    hasAccess = menu.permissions.some(menuPermission => {
                        const menuPermissionKey = `${menuPermission.module}:${menuPermission.action}`;
                        return permissions.includes(menuPermissionKey);
                    });
                }

                if (hasAccess && menu.roles.length > 0) {
                    accessibleMenus.push(menu.menu_name);
                }
            });
        }

        const result = { roles, permissions, menuAccess: accessibleMenus };

        // Cache the result
        userPermissionCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (error) {
        logger.error('Error getting user permissions:', error);
        return { roles: [], permissions: [], menuAccess: [] };
    }
};

/**
 * Match route pattern with actual route
 * @param {string} pattern - Route pattern (e.g., '/api/v1/users/:id')
 * @param {string} actualRoute - Actual route (e.g., '/api/v1/users/123')
 * @returns {boolean} - Whether the route matches
 */
const matchRoute = (pattern, actualRoute) => {
    // Convert pattern to regex
    const regexPattern = pattern
        .replace(/:\w+/g, '\\d+') // Replace :id with \d+ for numeric IDs
        .replace(/\//g, '\\/'); // Escape forward slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(actualRoute);
};

/**
 * Extract resource ID from route for ownership checks
 * @param {string} route - The route path
 * @param {string} pattern - The route pattern
 * @returns {string|null} - Extracted ID or null
 */
const extractResourceId = (route, pattern) => {
    const patternParts = pattern.split('/');
    const routeParts = route.split('/');

    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            return routeParts[i];
        }
    }

    return null;
};

/**
 * Check if user owns the resource (for allowOwn checks)
 * @param {Object} req - Express request object
 * @param {string} resourceId - Resource ID
 * @param {string} route - Route path
 * @returns {Promise<boolean>} - Whether user owns the resource
 */
const checkResourceOwnership = async (req, resourceId, route) => {
    const userId = req.user.id;

    try {
        // Different ownership checks based on route type
        if (route.includes('/users/')) {
            // User can access their own profile
            return parseInt(resourceId) === userId;
        }

        if (route.includes('/leaves/')) {
            // User can access their own leave applications
            const LeaveApplication = require('../models/LeaveApplication');
            const leave = await LeaveApplication.findByPk(resourceId);
            return leave && leave.user_id === userId;
        }

        if (route.includes('/documents/')) {
            // User can access documents they own or uploaded
            const Document = require('../models/Document');
            const document = await Document.findByPk(resourceId);
            return document && (document.user_id === userId || document.uploaded_by === userId);
        }

        if (route.includes('/attendance/employee/')) {
            // User can access their own attendance
            return parseInt(resourceId) === userId;
        }

        // Add more ownership checks as needed
        return false;
    } catch (error) {
        logger.error('Error checking resource ownership:', error);
        return false;
    }
};

/**
 * Main permission checking middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkPermissions = async (req, res, next) => {
    try {
        const method = req.method;
        const route = req.path;
        const routeKey = `${method}:${route}`;

        // Find matching route permission configuration
        let routeConfig = null;
        let matchedPattern = null;

        // First, try exact match
        if (ROUTE_PERMISSIONS[routeKey]) {
            routeConfig = ROUTE_PERMISSIONS[routeKey];
            matchedPattern = route;
        } else {
            // Try pattern matching
            for (const [pattern, config] of Object.entries(ROUTE_PERMISSIONS)) {
                const [patternMethod, patternRoute] = pattern.split(':');
                if (patternMethod === method && matchRoute(patternRoute, route)) {
                    routeConfig = config;
                    matchedPattern = patternRoute;
                    break;
                }
            }
        }

        // If no route configuration found, deny access by default
        if (!routeConfig) {
            logger.warn(`No permission configuration found for ${routeKey}`);
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied - route not configured',
            });
        }

        // Public routes - no authentication required
        if (routeConfig.public) {
            return next();
        }

        // Check if user is authenticated
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Routes that only require authentication
        if (routeConfig.authenticated) {
            return next();
        }

        // Get user permissions
        const userPermissions = await getUserPermissions(req.user.id);

        // Check role-based access
        if (routeConfig.roles && routeConfig.roles.length > 0) {
            const hasRequiredRole = routeConfig.roles.some(role =>
                userPermissions.roles.includes(role)
            );

            if (!hasRequiredRole) {
                // Check if this is an "allowOwn" route and user owns the resource
                if (routeConfig.allowOwn && matchedPattern) {
                    const resourceId = extractResourceId(route, matchedPattern);
                    if (resourceId) {
                        const ownsResource = await checkResourceOwnership(req, resourceId, route);
                        if (ownsResource) {
                            return next();
                        }
                    }
                }

                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Insufficient role permissions',
                });
            }
        }

        // Check permission-based access
        if (routeConfig.permissions && routeConfig.permissions.length > 0) {
            const hasRequiredPermission = routeConfig.permissions.some(permission =>
                userPermissions.permissions.includes(permission)
            );

            if (!hasRequiredPermission) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Insufficient permissions',
                });
            }
        }

        // All checks passed
        next();
    } catch (error) {
        logger.error('Permission check error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error checking permissions',
        });
    }
};

/**
 * Clear user permission cache (call when user roles/permissions change)
 * @param {number} userId - User ID
 */
const clearUserCache = (userId) => {
    const cacheKey = `user_${userId}`;
    userPermissionCache.delete(cacheKey);
};

/**
 * Clear all permission cache
 */
const clearAllCache = () => {
    userPermissionCache.clear();
};

module.exports = {
    checkPermissions,
    clearUserCache,
    clearAllCache,
    ROUTE_PERMISSIONS, // Export for testing or external configuration
};