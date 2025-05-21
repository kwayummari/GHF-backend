const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * PettyCashExpense model
 * @swagger
 * components:
 *   schemas:
 *     PettyCashExpense:
 *       type: object
 *       required:
 *         - petty_cash_book_id
 *         - date
 *         - description
 *         - amount
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Petty cash expense ID
 *         petty_cash_book_id:
 *           type: integer
 *           description: Petty cash book ID
 *         date:
 *           type: string
 *           format: date
 *           description: Date of expense
 *         description:
 *           type: string
 *           description: Description of expense
 *         amount:
 *           type: number
 *           format: float
 *           description: Expense amount
 *         receipt_document_id:
 *           type: integer
 *           description: Document ID for receipt
 *         created_by:
 *           type: integer
 *           description: User ID who created this expense
 */
const PettyCashExpense = sequelize.define('PettyCashExpense', {
  petty_cash_book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'petty_cash_book',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  receipt_document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'petty_cash_expenses',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
PettyCashExpense.associate = (models) => {
  PettyCashExpense.belongsTo(models.PettyCashBook, {
    foreignKey: 'petty_cash_book_id',
    as: 'pettyCashBook',
  });
  
  PettyCashExpense.belongsTo(models.Document, {
    foreignKey: 'receipt_document_id',
    as: 'receiptDocument',
  });
  
  PettyCashExpense.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};

module.exports = PettyCashExpense;