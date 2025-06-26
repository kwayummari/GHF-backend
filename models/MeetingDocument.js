const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * MeetingDocument model
 * @swagger
 * components:
 *   schemas:
 *     MeetingDocument:
 *       type: object
 *       required:
 *         - meeting_id
 *         - document_name
 *         - file_path
 *       properties:
 *         id:
 *           type: integer
 *           description: Document ID
 *         meeting_id:
 *           type: integer
 *           description: Meeting ID
 *         document_name:
 *           type: string
 *           description: Document name
 *         file_path:
 *           type: string
 *           description: File path on server
 *         file_size:
 *           type: integer
 *           description: File size in bytes
 *         file_type:
 *           type: string
 *           description: File MIME type
 *         document_type:
 *           type: string
 *           enum: [agenda, minutes, presentation, report, attachment]
 *           description: Type of document
 *         uploaded_by:
 *           type: integer
 *           description: ID of the user who uploaded the document
 *         upload_date:
 *           type: string
 *           format: date-time
 *           description: Upload timestamp
 *         description:
 *           type: string
 *           description: Document description
 *         is_public:
 *           type: boolean
 *           description: Whether document is accessible to all attendees
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const MeetingDocument = sequelize.define('MeetingDocument', {
    meeting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'meetings',
            key: 'id',
        },
    },
    document_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [1, 255],
            notEmpty: true,
        },
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            len: [1, 500],
            notEmpty: true,
        },
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    file_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    document_type: {
        type: DataTypes.ENUM('agenda', 'minutes', 'presentation', 'report', 'attachment'),
        defaultValue: 'attachment',
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'meeting_documents',
    timestamps: true,
    indexes: [
        {
            fields: ['meeting_id'],
        },
        {
            fields: ['uploaded_by'],
        },
        {
            fields: ['document_type'],
        },
        {
            fields: ['upload_date'],
        },
    ],
});

// Model associations
MeetingDocument.associate = (models) => {
    MeetingDocument.belongsTo(models.Meeting, {
        foreignKey: 'meeting_id',
        as: 'meeting',
    });

    MeetingDocument.belongsTo(models.User, {
        foreignKey: 'uploaded_by',
        as: 'uploader',
    });
};

module.exports = MeetingDocument;