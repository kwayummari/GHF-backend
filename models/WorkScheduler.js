const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * WorkScheduler model
 * @swagger
 * components:
 *   schemas:
 *     WorkScheduler:
 *       type: object
 *       required:
 *         - day_of_week
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: integer
 *           description: Work scheduler ID
 *         day_of_week:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *           description: Day of the week
 *         start_time:
 *           type: string
 *           format: time
 *           description: Work start time
 *         end_time:
 *           type: string
 *           format: time
 *           description: Work end time
 */
const WorkScheduler = sequelize.define('WorkScheduler', {
  day_of_week: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  tableName: 'work_scheduler',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WorkScheduler;