const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * MeetingTask model
 * @swagger
 * components:
 *   schemas:
 *     MeetingTask:
 *       type: object
 *       required:
 *         - meeting_id
 *         - raised_by_user_id
 *         - assigned_to_user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Meeting task ID
 *         meeting_id:
 *           type: integer
 *           description: Meeting record ID
 *         raised_by_user_id:
 *           type: integer
 *           description: User ID who raised this task
 *         assigned_to_user_id:
 *           type: integer
 *           description: User ID assigned to this task
 *         status:
 *           type: string
 *           enum: [not started, in progress, completed]
 *           description: Task status
 *         follow_up_person_user_id:
 *           type: integer
 *           description: User ID responsible for follow-up
 *         comment:
 *           type: string
 *           description: Task comment/description
 *         due_date:
 *           type: string
 *           format: date
 *           description: Task due date
 */
const MeetingTask = sequelize.define('MeetingTask', {
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'meeting_records',
      key: 'id',
    },
  },
  raised_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  assigned_to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('not started', 'in progress', 'completed'),
    defaultValue: 'not started',
  },
  follow_up_person_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'meeting_tasks',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
MeetingTask.associate = (models) => {
  MeetingTask.belongsTo(models.MeetingRecord, {
    foreignKey: 'meeting_id',
    as: 'meeting',
  });

  MeetingTask.belongsTo(models.User, {
    foreignKey: 'raised_by_user_id',
    as: 'raisedBy',
  });

  MeetingTask.belongsTo(models.User, {
    foreignKey: 'assigned_to_user_id',
    as: 'assignedTo',
  });

  MeetingTask.belongsTo(models.User, {
    foreignKey: 'follow_up_person_user_id',
    as: 'followUpPerson',
  });
};

module.exports = MeetingTask;