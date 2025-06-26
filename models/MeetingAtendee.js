const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * MeetingAttendee model
 * @swagger
 * components:
 *   schemas:
 *     MeetingAttendee:
 *       type: object
 *       required:
 *         - meeting_id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Attendee ID
 *         meeting_id:
 *           type: integer
 *           description: Meeting ID
 *         user_id:
 *           type: integer
 *           description: User ID (if internal employee)
 *         name:
 *           type: string
 *           description: Attendee name
 *         email:
 *           type: string
 *           description: Attendee email
 *         role:
 *           type: string
 *           description: Attendee role in meeting
 *         attendance_status:
 *           type: string
 *           enum: [invited, confirmed, attended, absent, cancelled]
 *           description: Attendance status
 *         is_required:
 *           type: boolean
 *           description: Whether attendance is required
 *         notes:
 *           type: string
 *           description: Additional notes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const MeetingAttendee = sequelize.define('MeetingAttendee', {
    meeting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'meetings',
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100],
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    role: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    attendance_status: {
        type: DataTypes.ENUM('invited', 'confirmed', 'attended', 'absent', 'cancelled'),
        defaultValue: 'invited',
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'meeting_attendees',
    timestamps: true,
    indexes: [
        {
            fields: ['meeting_id'],
        },
        {
            fields: ['user_id'],
        },
        {
            fields: ['email'],
        },
        {
            unique: true,
            fields: ['meeting_id', 'email'],
        },
    ],
});

// Model associations
MeetingAttendee.associate = (models) => {
    MeetingAttendee.belongsTo(models.Meeting, {
        foreignKey: 'meeting_id',
        as: 'meeting',
    });

    MeetingAttendee.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
    });
};

module.exports = MeetingAttendee;