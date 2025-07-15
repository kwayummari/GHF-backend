const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * MeetingTask model
 * @swagger
 * components:
 *   schemas:
 *     MeetingTask:
 *       type: object
 *       required:
 *         - meeting_id
 *         - task_description
 *         - assigned_to
 *         - due_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Task ID
 *         meeting_id:
 *           type: integer
 *           description: Meeting ID
 *         task_description:
 *           type: string
 *           description: Task description
 *         assigned_to:
 *           type: string
 *           description: Person assigned to the task
 *         assigned_user_id:
 *           type: integer
 *           description: User ID if assigned to internal employee
 *         due_date:
 *           type: string
 *           format: date
 *           description: Task due date
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Task priority
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, cancelled, overdue]
 *           description: Task status
 *         progress:
 *           type: integer
 *           description: Task progress percentage (0-100)
 *         notes:
 *           type: string
 *           description: Additional notes
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const MeetingTask = sequelize.define('MeetingTask', {
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'meetings',
      key: 'id',
    },
  },
  task_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000],
      notEmpty: true,
    },
  },
  assigned_to: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
      notEmpty: true,
    },
  },
  assigned_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'cancelled', 'overdue'),
    defaultValue: 'not_started',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  notes: {
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
}, {
  tableName: 'meeting_tasks',
  timestamps: true,
  indexes: [
    {
      fields: ['meeting_id'],
    },
    {
      fields: ['assigned_user_id'],
    },
    {
      fields: ['due_date', 'status'],
    },
    {
      fields: ['priority'],
    },
  ],
  hooks: {
    beforeSave: (task) => {
      // Auto-update status based on progress
      if (task.progress === 100 && task.status !== 'completed') {
        task.status = 'completed';
      } else if (task.progress > 0 && task.progress < 100 && task.status === 'not_started') {
        task.status = 'in_progress';
      }

      // Check for overdue tasks
      const now = new Date();
      const dueDate = new Date(task.due_date);
      if (dueDate < now && task.status !== 'completed' && task.status !== 'cancelled') {
        task.status = 'overdue';
      }
    },
  },
});

// Model associations
MeetingTask.associate = (models) => {
  MeetingTask.belongsTo(models.Meeting, {
    foreignKey: 'meeting_id',
    as: 'meeting',
  });

  MeetingTask.belongsTo(models.User, {
    foreignKey: 'assigned_user_id',
    as: 'assignedUser',
  });

  MeetingTask.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};

module.exports = MeetingTask;