const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Department model
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - department_name
 *       properties:
 *         id:
 *           type: integer
 *           description: Department ID
 *         department_name:
 *           type: string
 *           description: Department name
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */
const Department = sequelize.define('Department', {
  department_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Department.associate = (models) => {
  Department.hasMany(models.BasicEmployeeData, {
    foreignKey: 'department_id',
    as: 'employees',
  });

  Department.hasMany(models.Budget, {
    foreignKey: 'department_id',
    as: 'budgets',
  });
};

module.exports = Department;