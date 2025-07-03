
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const User = require('./User');
const Department = require('./Department');

const PettyCashBook = sequelize.define('petty_cash_book', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  book_number: {
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
  opening_balance: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false,
    defaultValue: 0.00
  },
  current_balance: {
    type: DataTypes.DECIMAL(15,2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'closed'),
    allowNull: false,
    defaultValue: 'active'
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
  tableName: 'petty_cash_books'
});

// Associations
PettyCashBook.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

PettyCashBook.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

module.exports = PettyCashBook;
