const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * Timesheet model
 * Represents monthly timesheet submissions by employees
 */
const Timesheet = sequelize.define('Timesheet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 12,
        },
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 2020,
            max: 2050,
        },
    },
    status: {
        type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'processing'),
        defaultValue: 'draft',
        allowNull: false,
    },
    total_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
    },
    total_working_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    rejected_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    supervisor_comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    tableName: 'timesheets',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'month', 'year'],
            name: 'unique_user_month_year',
        },
        {
            fields: ['status'],
        },
        {
            fields: ['submitted_at'],
        },
        {
            fields: ['approved_by'],
        },
    ],
});

// Model associations
Timesheet.associate = (models) => {
    // Timesheet belongs to a user (employee)
    Timesheet.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'employee',
    });

    // Timesheet approved by a user (supervisor)
    Timesheet.belongsTo(models.User, {
        foreignKey: 'approved_by',
        as: 'approver',
    });

    // Timesheet rejected by a user (supervisor)
    Timesheet.belongsTo(models.User, {
        foreignKey: 'rejected_by',
        as: 'rejector',
    });

    // Timesheet created by a user
    Timesheet.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator',
    });

    // Timesheet updated by a user
    Timesheet.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater',
    });

    // Timesheet has many timesheet entries
    Timesheet.hasMany(models.TimesheetEntry, {
        foreignKey: 'timesheet_id',
        as: 'entries',
        onDelete: 'CASCADE',
    });
};

module.exports = Timesheet;