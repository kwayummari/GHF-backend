const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * MeetingRecord model
 * @swagger
 * components:
 *   schemas:
 *     MeetingRecord:
 *       type: object
 *       required:
 *         - date
 *         - title
 *         - uploader_user_id
 *         - chairperson_user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Meeting record ID
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of meeting
 *         title:
 *           type: string
 *           description: Meeting title
 *         description:
 *           type: string
 *           description: Meeting description
 *         uploader_user_id:
 *           type: integer
 *           description: User ID who uploaded the record
 *         chairperson_user_id:
 *           type: integer
 *           description: User ID of meeting chairperson
 *         document_id:
 *           type: integer
 *           description: Document ID for meeting minutes
 */
const MeetingRecord = sequelize.define('MeetingRecord', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  uploader_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  chairperson_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
}, {
  tableName: 'meeting_records',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
MeetingRecord.associate = (models) => {
  MeetingRecord.belongsTo(models.User, {
    foreignKey: 'uploader_user_id',
    as: 'uploader',
  });
  
  MeetingRecord.belongsTo(models.User, {
    foreignKey: 'chairperson_user_id',
    as: 'chairperson',
  });
  
  MeetingRecord.belongsTo(models.Document, {
    foreignKey: 'document_id',
    as: 'document',
  });
  
  MeetingRecord.hasMany(models.MeetingTask, {
    foreignKey: 'meeting_id',
    as: 'tasks',
  });
};

module.exports = MeetingRecord;