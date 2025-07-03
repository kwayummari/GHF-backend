
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const User = require('./User');
const Department = require('./Department');
const Budget = require('./Budget');

const ExpenseReport = sequelize.define('expense_report', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  report_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Department,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  budget_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Budget,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'paid'),
    allowNull: false,
    defaultValue: 'draft'
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  paid_at: {
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
  tableName: 'expense_reports'
});

// Associations
ExpenseReport.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

ExpenseReport.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approvedBy'
});

ExpenseReport.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

ExpenseReport.belongsTo(Budget, {
  foreignKey: 'budget_id',
  as: 'budget'
});

module.exports = ExpenseReport;
