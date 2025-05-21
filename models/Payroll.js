const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Payroll model
 * @swagger
 * components:
 *   schemas:
 *     Payroll:
 *       type: object
 *       required:
 *         - user_id
 *         - date
 *         - base_salary
 *         - total_earnings
 *         - total_deductions
 *         - net_pay
 *       properties:
 *         id:
 *           type: integer
 *           description: Payroll ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         date:
 *           type: string
 *           format: date
 *           description: Payroll date
 *         base_salary:
 *           type: number
 *           format: float
 *           description: Base salary amount
 *         increment_id:
 *           type: integer
 *           description: Increment ID if applicable
 *         total_earnings:
 *           type: number
 *           format: float
 *           description: Total earnings amount
 *         total_deductions:
 *           type: number
 *           format: float
 *           description: Total deductions amount
 *         net_pay:
 *           type: number
 *           format: float
 *           description: Net pay amount
 *         status:
 *           type: string
 *           enum: [draft, processed, approved, paid]
 *           description: Payroll status
 *         processed_by:
 *           type: integer
 *           description: User ID who processed the payroll
 *         approved_by:
 *           type: integer
 *           description: User ID who approved the payroll
 */
const Payroll = sequelize.define('Payroll', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  base_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  increment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'increments',
      key: 'id',
    },
  },
  total_earnings: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  total_deductions: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  net_pay: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'processed', 'approved', 'paid'),
    defaultValue: 'draft',
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'payroll',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Payroll.associate = (models) => {
  Payroll.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  Payroll.belongsTo(models.Increment, {
    foreignKey: 'increment_id',
    as: 'increment',
  });
  
  Payroll.belongsTo(models.User, {
    foreignKey: 'processed_by',
    as: 'processor',
  });
  
  Payroll.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
};

module.exports = Payroll;