const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * LeaveType model
 * @swagger
 * components:
 *   schemas:
 *     LeaveType:
 *       type: object
 *       required:
 *         - name
 *         - minimum_days
 *         - maximum_days
 *       properties:
 *         id:
 *           type: integer
 *           description: Leave type ID
 *         name:
 *           type: string
 *           description: Leave type name
 *         minimum_days:
 *           type: integer
 *           description: Minimum number of days
 *         maximum_days:
 *           type: integer
 *           description: Maximum number of days
 *         description:
 *           type: string
 *           description: Description of leave type
 */
const LeaveType = sequelize.define('LeaveType', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  minimum_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  maximum_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'leave_types',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
LeaveType.associate = (models) => {
  LeaveType.hasMany(models.LeaveApplication, {
    foreignKey: 'type_id',
    as: 'leaveApplications',
  });
};

module.exports = LeaveType;