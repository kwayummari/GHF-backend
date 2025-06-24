const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * TimesheetEntry model
 * Represents individual day entries within a timesheet
 */
const TimesheetEntry = sequelize.define('TimesheetEntry', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    timesheet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'timesheets',
            key: 'id',
        },
    },
    attendance_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'attendances',
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    arrival_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    departure_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    working_hours: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: 0.00,
    },
    activity: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('present', 'absent', 'on leave', 'half day', 'holiday', 'weekend'),
        defaultValue: 'present',
    },
    scheduler_status: {
        type: DataTypes.ENUM('working day', 'weekend', 'holiday in working day', 'holiday in weekend'),
        defaultValue: 'working day',
    },
    is_billable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    project_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    task_category: {
        type: DataTypes.STRING(50),
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
    tableName: 'timesheet_entries',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['timesheet_id'],
        },
        {
            fields: ['attendance_id'],
        },
        {
            fields: ['date'],
        },
        {
            fields: ['status'],
        },
        {
            unique: true,
            fields: ['timesheet_id', 'date'],
            name: 'unique_timesheet_date',
        },
    ],
});

// Model associations
TimesheetEntry.associate = (models) => {
    // TimesheetEntry belongs to a timesheet
    TimesheetEntry.belongsTo(models.Timesheet, {
        foreignKey: 'timesheet_id',
        as: 'timesheet',
    });

    // TimesheetEntry belongs to an attendance record
    TimesheetEntry.belongsTo(models.Attendance, {
        foreignKey: 'attendance_id',
        as: 'attendance',
    });

    // TimesheetEntry created by a user
    TimesheetEntry.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator',
    });

    // TimesheetEntry updated by a user
    TimesheetEntry.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater',
    });
};

module.exports = TimesheetEntry;