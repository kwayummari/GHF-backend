const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * BudgetExpense model - Junction table linking budgets to expense reports
 * @swagger
 * components:
 *   schemas:
 *     BudgetExpense:
 *       type: object
 *       required:
 *         - budget_id
 *         - expense_report_id
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Budget expense ID
 *         budget_id:
 *           type: integer
 *           description: Budget ID
 *         expense_report_id:
 *           type: integer
 *           description: Expense report ID
 *         amount:
 *           type: number
 *           format: float
 *           description: Amount charged to this budget
 */
const BudgetExpense = sequelize.define('BudgetExpense', {
  budget_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id',
    },
  },
  expense_report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'expense_reports',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
}, {
  tableName: 'budget_expenses',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: null,
});

// Model associations
BudgetExpense.associate = (models) => {
  BudgetExpense.belongsTo(models.Budget, {
    foreignKey: 'budget_id',
    as: 'budget',
  });
  
  BudgetExpense.belongsTo(models.ExpenseReport,