
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const ExpenseReport = require('./ExpenseReport');
const TravelAdvanceRequest = require('./TravelAdvanceRequest');

const ExpenseLine = sequelize.define('expense_line', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  expense_report_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: ExpenseReport,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  travel_advance_request_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TravelAdvanceRequest,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  receipt_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  underscored: true,
  tableName: 'expense_lines'
});

// Associations
ExpenseLine.belongsTo(ExpenseReport, {
  foreignKey: 'expense_report_id',
  as: 'expenseReport'
});

ExpenseLine.belongsTo(TravelAdvanceRequest, {
  foreignKey: 'travel_advance_request_id',
  as: 'travelAdvanceRequest'
});

module.exports = ExpenseLine;
