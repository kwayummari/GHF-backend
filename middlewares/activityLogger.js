const activityLogRepository = require('../repositories/activityLogRepository');
const logger = require('../utils/logger');

/**
 * Activity logging middleware
 * @param {string} action - Action performed
 * @param {string} module - Module/feature
 * @param {string|Function} getDescription - Description or function to generate description
 * @returns {Function} Express middleware
 */
const logActivity = (action, module, getDescription) => {
    return async (req, res, next) => {
        try {
            const originalSend = res.send;
            res.send = function (data) {
                // Only log successful operations (2xx status codes)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Generate description
                    const description = typeof getDescription === 'function'
                        ? getDescription(req, res, data)
                        : getDescription;

                    // Prepare log data
                    const logData = {
                        user_id: req.user?.id,
                        user_name: req.user?.firstName && req.user?.lastName
                            ? `${req.user.firstName} ${req.user.lastName}`
                            : req.user?.username || 'Unknown User',
                        user_role: req.user?.role || 'Unknown',
                        action,
                        module,
                        description,
                        ip_address: req.ip || req.connection.remoteAddress,
                        user_agent: req.get('User-Agent'),
                        status: 'success',
                        metadata: req.logMetadata || {}
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
            logger.error('Activity logger middleware error:', error);
            next(); // Don't break the request flow
        }
    };
};

/**
 * Log authentication events
 * @param {Object} req - Express request object
 * @param {Object} user - User object
 * @param {string} action - Action (login, logout, failed_login)
 * @param {string} status - Status (success, failed)
 * @param {Object} metadata - Additional metadata
 */
const logAuthEvent = async (req, user, action, status = 'success', metadata = {}) => {
    try {
        const logData = {
            user_id: user?.id || null,
            user_name: user ? (user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username) : 'Unknown',
            user_role: user?.role || 'Unknown',
            action,
            module: 'auth',
            description: `User ${action === 'login' ? 'logged in' : action === 'logout' ? 'logged out' : 'failed to login'}`,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            status,
            metadata
        };

        await activityLogRepository.create(logData);
    } catch (error) {
        logger.error('Failed to log auth event:', error);
    }
};

module.exports = {
    logActivity,
    logAuthEvent
};