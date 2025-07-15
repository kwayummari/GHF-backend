const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * ActivityLog model
 * @swagger
 * components:
 *   schemas:
 *     ActivityLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity log ID
 *         user_id:
 *           type: integer
 *           description: User ID who performed the action
 *         user_name:
 *           type: string
 *           description: User's full name
 *         user_role:
 *           type: string
 *           description: User's role
 *         action:
 *           type: string
 *           description: Action performed
 *         module:
 *           type: string
 *           description: System module
 *         description:
 *           type: string
 *           description: Activity description
 *         ip_address:
 *           type: string
 *           description: User's IP address
 *         user_agent:
 *           type: string
 *           description: User's browser/client info
 *         metadata:
 *           type: object
 *           description: Additional activity data
 *         status:
 *           type: string
 *           enum: [success, failed, pending, error, warning]
 *           description: Activity status
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the activity occurred
 */
const ActivityLog = sequelize.define('ActivityLog', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    user_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    user_role: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [['create', 'update', 'delete', 'view', 'login', 'logout', 'approve', 'reject', 'submit', 'cancel', 'export', 'import', 'backup', 'restore', 'failed_login', 'password_change']]
        }
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [['auth', 'employees', 'users', 'leaves', 'attendance', 'payroll', 'finance', 'assets', 'budget', 'procurement', 'meetings', 'documents', 'settings', 'system', 'security', 'backup', 'reports']]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('success', 'failed', 'pending', 'error', 'warning'),
        defaultValue: 'success'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['action'] },
        { fields: ['module'] },
        { fields: ['status'] },
        { fields: ['timestamp'] },
        { fields: ['created_at'] }
    ]
});

// Model associations
ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = ActivityLog;