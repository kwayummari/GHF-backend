const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoanInstallment = sequelize.define('LoanInstallment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  loan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'loans',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  payroll_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'payrolls',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  installment_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
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

module.exports = LoanInstallment;
