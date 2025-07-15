const activityLogRepository = require('../repositories/activityLogRepository');
const logger = require('../utils/logger');

// Action mapping based on HTTP methods and routes
const getActionFromRequest = (method, originalUrl, body) => {
    const lowerMethod = method.toLowerCase();

    // Standard REST API mapping
    if (lowerMethod === 'post') return 'create';
    if (lowerMethod === 'put' || lowerMethod === 'patch') return 'update';
    if (lowerMethod === 'delete') return 'delete';
    if (lowerMethod === 'get') return 'view';

    // Special cases based on URL patterns
    if (originalUrl.includes('/login')) return 'login';
    if (originalUrl.includes('/logout')) return 'logout';
    if (originalUrl.includes('/approve')) return 'approve';
    if (originalUrl.includes('/reject')) return 'reject';
    if (originalUrl.includes('/submit')) return 'submit';
    if (originalUrl.includes('/cancel')) return 'cancel';
    if (originalUrl.includes('/export')) return 'export';
    if (originalUrl.includes('/import')) return 'import';
    if (originalUrl.includes('/backup')) return 'backup';
    if (originalUrl.includes('/restore')) return 'restore';

    return lowerMethod;
};

// Module mapping based on URL patterns
const getModuleFromUrl = (originalUrl) => {
    const url = originalUrl.toLowerCase();

    if (url.includes('/auth')) return 'auth';
    if (url.includes('/users') || url.includes('/employees')) return 'employees';
    if (url.includes('/leaves')) return 'leaves';
    if (url.includes('/attendance')) return 'attendance';
    if (url.includes('/payroll')) return 'payroll';
    if (url.includes('/finance') || url.includes('/budget')) return 'finance';
    if (url.includes('/assets')) return 'assets';
    if (url.includes('/procurement')) return 'procurement';
    if (url.includes('/meetings')) return 'meetings';
    if (url.includes('/documents')) return 'documents';
    if (url.includes('/settings')) return 'settings';
    if (url.includes('/reports')) return 'reports';
    if (url.includes('/roles') || url.includes('/permissions')) return 'security';

    return 'system';
};

// Generate description based on request
const generateDescription = (req, res, responseData) => {
    const { method, originalUrl, body, params } = req;
    const action = getActionFromRequest(method, originalUrl, body);
    const module = getModuleFromUrl(originalUrl);

    // Try to extract entity name/ID from response or request
    let entityInfo = '';

    // Get entity ID from params
    if (params.id) {
        entityInfo = ` ID: ${params.id}`;
    }

    // Try to get entity name from response data
    try {
        const parsedResponse = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        if (parsedResponse?.data) {
            const data = parsedResponse.data;

            // Common name fields
            const nameFields = ['name', 'title', 'firstName', 'lastName', 'username', 'email', 'description'];
            for (const field of nameFields) {
                if (data[field]) {
                    entityInfo = ` - ${data[field]}`;
                    break;
                }
            }

            // Combine first and last name
            if (data.firstName && data.lastName) {
                entityInfo = ` - ${data.firstName} ${data.lastName}`;
            }
        }
    } catch (e) {
        // Ignore parsing errors
    }

    // Generate description based on action and module
    const actionMap = {
        create: `Created new ${module.slice(0, -1)}${entityInfo}`,
        update: `Updated ${module.slice(0, -1)}${entityInfo}`,
        delete: `Deleted ${module.slice(0, -1)}${entityInfo}`,
        view: `Viewed ${module}${entityInfo}`,
        login: 'User logged into the system',
        logout: 'User logged out of the system',
        approve: `Approved ${module.slice(0, -1)}${entityInfo}`,
        reject: `Rejected ${module.slice(0, -1)}${entityInfo}`,
        submit: `Submitted ${module.slice(0, -1)}${entityInfo}`,
        export: `Exported ${module} data`,
        backup: 'Created system backup'
    };

    return actionMap[action] || `Performed ${action} on ${module}${entityInfo}`;
};

// Routes to exclude from logging (to avoid noise)
const excludedRoutes = [
    '/api/v1/settings/logs', // Don't log the logging endpoints themselves
    '/api-docs',
    '/favicon.ico',
    '/health'
];

// Routes that should not be logged (read-only operations that happen frequently)
const skipLogRoutes = [
    'GET /api/v1/settings/logs',
    'GET /api/v1/users/profile',
    'GET /api/v1/menus/user'
];

/**
 * Global activity logging middleware
 * Automatically logs all API activities
 */
const globalActivityLogger = () => {
    return async (req, res, next) => {
        // Skip if route is excluded
        if (excludedRoutes.some(route => req.originalUrl.startsWith(route))) {
            return next();
        }

        // Skip specific method+route combinations
        const routeKey = `${req.method} ${req.originalUrl.split('?')[0]}`;
        if (skipLogRoutes.includes(routeKey)) {
            return next();
        }

        // Skip if no user (unauthenticated requests)
        if (!req.user && !req.originalUrl.includes('/auth/')) {
            return next();
        }

        try {
            const originalSend = res.send;

            res.send = function (data) {
                // Only log successful operations (2xx status codes)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const action = getActionFromRequest(req.method, req.originalUrl, req.body);
                    const module = getModuleFromUrl(req.originalUrl);
                    const description = generateDescription(req, res, data);

                    // Prepare metadata
                    const metadata = {
                        method: req.method,
                        url: req.originalUrl,
                        status_code: res.statusCode,
                        ...(req.logMetadata || {})
                    };

                    // Add request body for create/update operations (excluding sensitive data)
                    if (['create', 'update'].includes(action) && req.body) {
                        const sanitizedBody = { ...req.body };
                        delete sanitizedBody.password;
                        delete sanitizedBody.token;
                        delete sanitizedBody.refresh_token;
                        metadata.request_data = sanitizedBody;
                    }

                    // Prepare log data
                    const logData = {
                        user_id: req.user?.id || null,
                        user_name: req.user ? (req.user.first_name && req.user.sur_name
                            ? `${req.user.first_name} ${req.user.sur_name}`
                            : req.user.email) : 'System', // Fixed field names
                        user_role: req.user?.role || 'Unknown',
                        action,
                        module,
                        description,
                        ip_address: req.ip || req.connection.remoteAddress,
                        user_agent: req.get('User-Agent'),
                        status: 'success',
                        metadata
                      };

                    // Log activity asynchronously to avoid blocking response
                    activityLogRepository.create(logData).catch(err => {
                        logger.error('Failed to log activity:', err);
                    });
                }

                originalSend.call(this, data);
            };

            next();
        } catch (error) {
            logger.error('Global activity logger error:', error);
            next(); // Don't break the request flow
        }
    };
};

/**
 * Enhanced logging for specific operations
 * Use this when you need custom descriptions or metadata
 */
const logSpecificActivity = (customDescription, customMetadata = {}) => {
    return (req, res, next) => {
        req.logMetadata = { ...req.logMetadata, ...customMetadata };
        req.customDescription = customDescription;
        next();
    };
};

module.exports = {
    globalActivityLogger,
    logSpecificActivity
};