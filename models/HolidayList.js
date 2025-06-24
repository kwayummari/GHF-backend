const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * HolidayList model
 * @swagger
 * components:
 *   schemas:
 *     HolidayList:
 *       type: object
 *       required:
 *         - name
 *         - date
 *       properties:
 *         id:
 *           type: integer
 *           description: Holiday ID
 *         name:
 *           type: string
 *           description: Holiday name
 *         date:
 *           type: string
 *           format: date
 *           description: Holiday date
 *         status:
 *           type: string
 *           enum: [editable, non-editable]
 *           description: Whether the holiday can be edited
 *         is_workday:
 *           type: boolean
 *           description: Whether employees work on this holiday
 *         created_by:
 *           type: integer
 *           description: User ID who created this holiday
 *         updated_by:
 *           type: integer
 *           description: User ID who last updated this holiday
 */
const HolidayList = sequelize.define('HolidayList', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('editable', 'non-editable'),
    defaultValue: 'editable',
  },
  is_workday: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'holiday_list',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
HolidayList.associate = (models) => {
  HolidayList.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  HolidayList.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater',
  });
};

module.exports = HolidayList;