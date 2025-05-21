const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * PersonalEmployeeData model
 * @swagger
 * components:
 *   schemas:
 *     PersonalEmployeeData:
 *       type: object
 *       required:
 *         - user_id
 *         - location
 *         - education_level
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *         location:
 *           type: string
 *           description: Employee's home location
 *         education_level:
 *           type: string
 *           description: Employee's education level
 */
const PersonalEmployeeData = sequelize.define('PersonalEmployeeData', {
  location: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  education_level: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'personal_employee_data',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
PersonalEmployeeData.associate = (models) => {
  PersonalEmployeeData.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = PersonalEmployeeData;