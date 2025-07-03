
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const TravelAdvanceRequest = require('./TravelAdvanceRequest');
const User = require('./User');
const ExpenseLine = require('./ExpenseLine');

const TravelAdvanceExpense = sequelize.define('travel_advance_expense', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  travel_advance_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TravelAdvanceRequest,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  expense_line_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ExpenseLine,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
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
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'set null'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'travel_advance_expenses'
});

// Associations
TravelAdvanceExpense.belongsTo(TravelAdvanceRequest, {
  foreignKey: 'travel_advance_request_id',
  as: 'travelAdvanceRequest'
});

TravelAdvanceExpense.belongsTo(ExpenseLine, {
  foreignKey: 'expense_line_id',
  as: 'expenseLine'
});

TravelAdvanceExpense.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approvedBy'
});

module.exports = TravelAdvanceExpense;
