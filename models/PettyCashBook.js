const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * PettyCashBook model
 * @swagger
 * components:
 *   schemas:
 *     PettyCashBook:
 *       type: object
 *       required:
 *         - user_id
 *         - amount_received
 *         - date
 *         - balance
 *       properties:
 *         id:
 *           type: integer
 *           description: Petty cash book ID
 *         user_id:
 *           type: integer
 *           description: User ID responsible for this petty cash
 *         amount_received:
 *           type: number
 *           format: float
 *           description: Amount received
 *         date:
 *           type: string
 *           format: date
 *           description: Date of receipt
 *         maximum_amount:
 *           type: number
 *           format: float
 *           description: Maximum allowed amount
 *         minimum_amount:
 *           type: number
 *           format: float
 *           description: Minimum threshold for replenishment
 *         balance:
 *           type: number
 *           format: float
 *           description: Current balance
 */
const PettyCashBook = sequelize.define('PettyCashBook', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  amount_received: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  maximum_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 750000.00,
  },
  minimum_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 120000.00,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
}, {
  tableName: 'petty_cash_book',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
PettyCashBook.associate = (models) => {
  PettyCashBook.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  PettyCashBook.hasMany(models.PettyCashExpense, {
    foreignKey: 'petty_cash_book_id',
    as: 'expenses',
  });
  
  PettyCashBook.hasMany(models.ReplenishmentRequest, {
    foreignKey: 'petty_cash_book_id',
    as: 'replenishmentRequests',
  });
};

module.exports = PettyCashBook;