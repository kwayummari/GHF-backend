const { StatusCodes } = require('http-status-codes');
const activityLogRepository = require('../repositories/activityLogRepository');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Get activity logs with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getActivityLogs = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            action: req.query.action,
            module: req.query.module,
            status: req.query.status,
            user: req.query.user,
            user_id: req.query.user_id,
            date_from: req.query.date_from,
            date_to: req.query.date_to
        };

        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 50,
            sortBy: req.query.sortBy || 'timestamp',
            sortOrder: req.query.sortOrder || 'DESC'
        };

        const result = await activityLogRepository.findAll(filters, options);

        return successResponse(res, StatusCodes.OK, 'Activity logs retrieved successfully', result);
    } catch (error) {
        logger.error('Get activity logs error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve activity logs');
    }
};

/**
 * Get recent activities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRecentActivities = async (req, res, next) => {
    try {
        const limit = req.query.limit || 10;
        const activities = await activityLogRepository.getRecent(limit);

        return successResponse(res, StatusCodes.OK, 'Recent activities retrieved successfully', activities);
    } catch (error) {
        logger.error('Get recent activities error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve recent activities');
    }
};

/**
 * Get activity statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getActivityStats = async (req, res, next) => {
    try {
        const stats = await activityLogRepository.getStats();

        return successResponse(res, StatusCodes.OK, 'Activity statistics retrieved successfully', stats);
    } catch (error) {
        logger.error('Get activity stats error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve activity statistics');
    }
};

/**
 * Export activity logs to Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const exportActivityLogs = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            action: req.query.action,
            module: req.query.module,
            status: req.query.status,
            user: req.query.user,
            user_id: req.query.user_id,
            date_from: req.query.date_from,
            date_to: req.query.date_to
        };

        const options = {
            page: 1,
            limit: 10000, // Export maximum 10k records
            sortBy: 'timestamp',
            sortOrder: 'DESC'
        };

        const result = await activityLogRepository.findAll(filters, options);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Activity Logs');

        // Add headers
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User', key: 'user_name', width: 20 },
            { header: 'Action', key: 'action', width: 15 },
            { header: 'Module', key: 'module', width: 15 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'IP Address', key: 'ip_address', width: 15 },
            { header: 'Timestamp', key: 'timestamp', width: 20 }
        ];

        // Add data
        result.data.forEach(log => {
            worksheet.addRow({
                id: log.id,
                user_name: log.user_name || 'System',
                action: log.action,
                module: log.module,
                description: log.description,
                status: log.status,
                ip_address: log.ip_address,
                timestamp: log.timestamp
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Set response headers for download
        const filename = `activity-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Send the workbook
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        logger.error('Export activity logs error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to export activity logs');
    }
};

/**
 * Log user action manually
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logUserAction = async (req, res, next) => {
    try {
        const { action, module, description, metadata = {} } = req.body;

        const logData = {
            user_id: req.user.id,
            user_name: req.user.firstName && req.user.lastName
                ? `${req.user.firstName} ${req.user.lastName}`
                : req.user.username,
            user_role: req.user.role,
            action,
            module,
            description,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            metadata,
            status: 'success'
        };

        await activityLogRepository.create(logData);

        return successResponse(res, StatusCodes.CREATED, 'Activity logged successfully');
    } catch (error) {
        logger.error('Log user action error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to log user action');
    }
};

/**
 * Get audit trail for specific entity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAuditTrail = async (req, res, next) => {
    try {
        const { entity_type, entity_id } = req.query;

        if (!entity_type || !entity_id) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, 'Entity type and ID are required');
        }

        const auditTrail = await activityLogRepository.getAuditTrail(entity_type, entity_id);

        return successResponse(res, StatusCodes.OK, 'Audit trail retrieved successfully', auditTrail);
    } catch (error) {
        logger.error('Get audit trail error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve audit trail');
    }
};

/**
 * Get activity log by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getActivityLogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activityLog = await activityLogRepository.findById(id);

        if (!activityLog) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Activity log not found');
        }

        return successResponse(res, StatusCodes.OK, 'Activity log retrieved successfully', activityLog);
    } catch (error) {
        logger.error('Get activity log by ID error:', error);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve activity log');
    }
};

module.exports = {
    getActivityLogs,
    getRecentActivities,
    getActivityStats,
    exportActivityLogs,
    logUserAction,
    getAuditTrail,
    getActivityLogById
};