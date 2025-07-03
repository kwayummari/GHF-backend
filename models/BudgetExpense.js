const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BudgetExpense = sequelize.define('BudgetExpense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  budget_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  expense_report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'expense_reports',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = BudgetExpense;
