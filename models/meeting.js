const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * Meeting model
 * @swagger
 * components:
 *   schemas:
 *     Meeting:
 *       type: object
 *       required:
 *         - meeting_title
 *         - meeting_date
 *         - start_time
 *         - end_time
 *         - chairperson
 *         - organizer
 *       properties:
 *         id:
 *           type: integer
 *           description: Meeting ID
 *         meeting_title:
 *           type: string
 *           description: Meeting title
 *         meeting_type:
 *           type: string
 *           enum: [board, management, department, team, project, one_on_one, client]
 *           description: Type of meeting
 *         meeting_date:
 *           type: string
 *           format: date
 *           description: Meeting date
 *         start_time:
 *           type: string
 *           format: time
 *           description: Meeting start time
 *         end_time:
 *           type: string
 *           format: time
 *           description: Meeting end time
 *         location:
 *           type: string
 *           description: Meeting location
 *         is_virtual:
 *           type: boolean
 *           description: Whether the meeting is virtual
 *         meeting_link:
 *           type: string
 *           description: Virtual meeting link
 *         chairperson:
 *           type: string
 *           description: Meeting chairperson
 *         organizer:
 *           type: string
 *           description: Meeting organizer
 *         agenda_items:
 *           type: array
 *           items:
 *             type: string
 *           description: Meeting agenda items
 *         status:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *           description: Meeting status
 *         minutes_document_id:
 *           type: integer
 *           description: ID of the meeting minutes document
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the meeting
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const Meeting = sequelize.define('Meeting', {
    meeting_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [1, 255],
            notEmpty: true,
        },
    },
    meeting_type: {
        type: DataTypes.ENUM(
            'board',
            'management',
            'department',
            'team',
            'project',
            'one_on_one',
            'client'
        ),
        allowNull: false,
        defaultValue: 'team',
    },
    meeting_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: DataTypes.NOW,
        },
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            isAfterStartTime(value) {
                if (value <= this.start_time) {
                    throw new Error('End time must be after start time');
                }
            },
        },
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_virtual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    meeting_link: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    chairperson: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    organizer: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    agenda_items: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled',
    },
    minutes_document_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'documents',
            key: 'id',
        },
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    tableName: 'meetings',
    timestamps: true,
    indexes: [
        {
            fields: ['meeting_date', 'status'],
        },
        {
            fields: ['created_by'],
        },
        {
            fields: ['chairperson'],
        },
    ],
});

// Model associations
Meeting.associate = (models) => {
    Meeting.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator',
    });

    Meeting.hasMany(models.MeetingAttendee, {
        foreignKey: 'meeting_id',
        as: 'attendees',
        onDelete: 'CASCADE',
    });

    Meeting.hasMany(models.MeetingTask, {
        foreignKey: 'meeting_id',
        as: 'tasks',
        onDelete: 'CASCADE',
    });

    Meeting.hasMany(models.MeetingDocument, {
        foreignKey: 'meeting_id',
        as: 'documents',
        onDelete: 'CASCADE',
    });

    Meeting.belongsTo(models.Document, {
        foreignKey: 'minutes_document_id',
        as: 'minutes',
    });
};

module.exports = Meeting;
