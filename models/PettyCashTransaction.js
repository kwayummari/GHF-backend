
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const PettyCashBook = require('./PettyCashBook');
const User = require('./User');

const PettyCashTransaction = sequelize.define('petty_cash_transaction', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  petty_cash_book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PettyCashBook,
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  transaction_type: {
    type: DataTypes.ENUM('debit', 'credit'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reference_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'petty_cash_transactions'
});

// Associations
PettyCashTransaction.belongsTo(PettyCashBook, {
  foreignKey: 'petty_cash_book_id',
  as: 'pettyCashBook'
});

PettyCashTransaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

PettyCashTransaction.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approvedBy'
});

module.exports = PettyCashTransaction;
