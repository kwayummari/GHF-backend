const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
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
  bank_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  account_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  branch: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  swift_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  iban: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  account_holder_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
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

module.exports = BankAccount;
