const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * SalaryComponent model
 * @swagger
 * components:
 *   schemas:
 *     SalaryComponent:
 *       type: object
 *       required:
 *         - user_id
 *         - type
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *           description: Salary component ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         type:
 *           type: string
 *           enum: [deduction, earning]
 *           description: Component type
 *         title:
 *           type: string
 *           description: Component title
 *         employee_percentage:
 *           type: number
 *           format: float
 *           description: Employee contribution percentage
 *         employer_percentage:
 *           type: number
 *           format: float
 *           description: Employer contribution percentage
 *         fixed_amount:
 *           type: number
 *           format: float
 *           description: Fixed amount
 *         description:
 *           type: string
 *           description: Component description
 *         is_taxable:
 *           type: boolean
 *           description: Whether this component is taxable
 *         is_active:
 *           type: boolean
 *           description: Whether this component is active
 */
const SalaryComponent = sequelize.define('SalaryComponent', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('deduction', 'earning'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  employee_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  employer_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  fixed_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'salary_components',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
SalaryComponent.associate = (models) => {
  SalaryComponent.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = SalaryComponent;