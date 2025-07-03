
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const User = require('./User');
const Department = require('./Department');
const Budget = require('./Budget');

const TravelAdvanceRequest = sequelize.define('travel_advance_request', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  request_number: {
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
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false
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
  tableName: 'travel_advance_requests'
});

// Associations
TravelAdvanceRequest.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

TravelAdvanceRequest.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approvedBy'
});

TravelAdvanceRequest.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

TravelAdvanceRequest.belongsTo(Budget, {
  foreignKey: 'budget_id',
  as: 'budget'
});

module.exports = TravelAdvanceRequest;
