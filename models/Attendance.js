const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Attendance model
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - user_id
 *         - date
 *         - scheduler_status
 *       properties:
 *         id:
 *           type: integer
 *           description: Attendance record ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         arrival_time:
 *           type: string
 *           format: date-time
 *           description: Arrival time at work
 *         departure_time:
 *           type: string
 *           format: date-time
 *           description: Departure time from work
 *         scheduler_status:
 *           type: string
 *           enum: [working day, weekend, holiday in working day, holiday in weekend]
 *           description: Status of the day in work scheduler
 *         status:
 *           type: string
 *           enum: [absent, present, on leave, half day]
 *           description: Attendance status
 *         description:
 *           type: string
 *           description: Additional description/notes
 *         date:
 *           type: string
 *           format: date
 *           description: Date of attendance record
 *         activity:
 *           type: string
 *           description: Activity details for the day
 *         approval_status:
 *           type: string
 *           enum: [draft, approved, rejected]
 *           description: Approval status
 */
const Attendance = sequelize.define('Attendance', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  arrival_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  departure_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  scheduler_status: {
    type: DataTypes.ENUM('working day', 'weekend', 'holiday in working day', 'holiday in weekend'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('absent', 'present', 'on leave', 'half day'),
    defaultValue: 'absent',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  activity: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approval_status: {
    type: DataTypes.ENUM('draft', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'date'],
    },
  ],
});

// Model associations
Attendance.associate = (models) => {
  Attendance.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = Attendance;