const { Op } = require('sequelize');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

/**
 * Create activity log
 * @param {Object} logData - Activity log data
 * @returns {Promise<Object>} - Created activity log
 */
const create = async (logData) => {
    return ActivityLog.create(logData);
};

/**
 * Find activity logs with filtering and pagination
 * @param {Object} filters - Search filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Activity logs with pagination
 */
const findAll = async (filters = {}, options = {}) => {
    const {
        search,
        action,
        module,
        status,
        user,
        user_id,
        date_from,
        date_to
    } = filters;

    const {
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'DESC'
    } = options;

    const where = {};
    const offset = (page - 1) * limit;

    // Apply filters
    if (search) {
        where.description = { [Op.like]: `%${search}%` };
    }
    if (action) where.action = action;
    if (module) where.module = module;
    if (status) where.status = status;
    if (user) where.user_name = { [Op.like]: `%${user}%` };
    if (user_id) where.user_id = user_id;
    if (date_from && date_to) {
        where.timestamp = {
            [Op.between]: [new Date(date_from), new Date(date_to)]
        };
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder]],
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'sur_name', 'email'], // Fixed field names
                required: false
            }
        ]
    });

    return {
        data: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit)
    };
};

/**
 * Get recent activities
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} - Recent activities
 */
const getRecent = async (limit = 10) => {
    return ActivityLog.findAll({
        limit: parseInt(limit),
        order: [['timestamp', 'DESC']],
        attributes: ['id', 'user_name', 'action', 'module', 'description', 'status', 'timestamp', 'created_at'],
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'sur_name'], // Fixed field names
                required: false
            }
        ]
    });
};

/**
 * Get activity statistics
 * @returns {Promise<Object>} - Activity statistics
 */
const getStats = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, weekCount, monthCount, failedLogins, securityEvents] = await Promise.all([
        ActivityLog.count({ where: { timestamp: { [Op.gte]: today } } }),
        ActivityLog.count({ where: { timestamp: { [Op.gte]: weekStart } } }),
        ActivityLog.count({ where: { timestamp: { [Op.gte]: monthStart } } }),
        ActivityLog.count({ where: { action: 'failed_login', timestamp: { [Op.gte]: monthStart } } }),
        ActivityLog.count({ where: { module: 'security', timestamp: { [Op.gte]: monthStart } } })
    ]);

    return {
        today: todayCount,
        this_week: weekCount,
        this_month: monthCount,
        failed_logins: failedLogins,
        security_events: securityEvents
    };
};

/**
 * Get audit trail for specific entity
 * @param {string} entityType - Entity type
 * @param {number} entityId - Entity ID
 * @returns {Promise<Array>} - Audit trail
 */
const getAuditTrail = async (entityType, entityId) => {
    return ActivityLog.findAll({
        where: {
            metadata: {
                [Op.like]: `%"${entityType}_id":${entityId}%`
            }
        },
        order: [['timestamp', 'DESC']],
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'sur_name'], // Fixed field names
                required: false
            }
        ]
    });
};

/**
 * Find activity log by ID
 * @param {number} id - Activity log ID
 * @returns {Promise<Object>} - Activity log
 */
const findById = async (id) => {
    return ActivityLog.findByPk(id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'sur_name', 'email'], // Fixed field names
                required: false
            }
        ]
    });
};

module.exports = {
    create,
    findAll,
    getRecent,
    getStats,
    getAuditTrail,
    findById
};