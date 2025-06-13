const { clearUserCache, clearAllCache } = require('../middlewares/autoPermissionMiddleware');
const logger = require('./logger');

/**
 * Clear user cache when user roles are updated
 * @param {number} userId - User ID
 */
const updateUserPermissions = (userId) => {
    try {
        clearUserCache(userId);
        logger.info(`Permission cache cleared for user ${userId}`);
    } catch (error) {
        logger.error('Error updating user permissions:', error);
    }
};

/**
 * Clear all permission cache when role permissions are updated
 */
const updateAllUserPermissions = () => {
    try {
        clearAllCache();
        logger.info('All permission cache cleared');
    } catch (error) {
        logger.error('Error updating all user permissions:', error);
    }
};

module.exports = {
    updateUserPermissions,
    updateAllUserPermissions,
};