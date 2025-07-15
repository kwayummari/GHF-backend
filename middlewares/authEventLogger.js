const activityLogRepository = require('../repositories/activityLogRepository');
const logger = require('../utils/logger');

/**
 * Log authentication events automatically
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
            user_name: user ? (user.first_name && user.sur_name
                ? `${user.first_name} ${user.sur_name}`
                : user.email) : req.body?.email || 'Unknown', // Fixed field names
            user_role: user?.role || 'Unknown',
            action,
            module: 'auth',
            description: getAuthDescription(action, status, user, metadata),
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            status,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        };

        await activityLogRepository.create(logData);
        logger.info(`Auth event logged: ${action} - ${status} for user: ${logData.user_name}`);
    } catch (error) {
        logger.error('Failed to log auth event:', error);
    }
  };

const getAuthDescription = (action, status, user, metadata) => {
    switch (action) {
        case 'login':
            return status === 'success'
                ? `User logged into the system successfully`
                : `Failed login attempt`;
        case 'logout':
            return 'User logged out of the system';
        case 'failed_login':
            return `Failed login attempt - ${metadata.reason || 'Invalid credentials'}`;
        case 'password_change':
            return 'User changed their password';
        case 'password_reset':
            return 'User reset their password';
        case 'register':
            return 'New user registered';
        default:
            return `Authentication action: ${action}`;
    }
};

module.exports = {
    logAuthEvent
};