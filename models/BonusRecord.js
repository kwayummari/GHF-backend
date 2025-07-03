const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BonusRecord = sequelize.define('BonusRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  bonus_type: {
    type: DataTypes.ENUM('performance', 'annual', 'festival', 'retention', 'referral', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true
  },
  pay_period: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'YYYY-MM format'
  },
  is_taxable: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
    allowNull: false,
    defaultValue: 'pending'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
});

module.exports = BonusRecord;
