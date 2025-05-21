const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * ExpenseLine model
 * @swagger
 * components:
 *   schemas:
 *     ExpenseLine:
 *       type: object
 *       required:
 *         - title
 *         - amount
 *         - expense_report_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Expense line ID
 *         title:
 *           type: string
 *           description: Title of expense line
 *         has_receipt:
 *           type: boolean
 *           description: Whether there's a receipt for this expense
 *         amount:
 *           type: number
 *           format: float
 *           description: Amount for this expense line
 *         document_id:
 *           type: integer
 *           description: Document ID for receipt
 *         expense_report_id:
 *           type: integer
 *           description: Expense report ID
 */
const ExpenseLine = sequelize.define('ExpenseLine', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  has_receipt: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
  expense_report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'expense_reports',
      key: 'id',
    },
  },
}, {
  tableName: 'expense_lines',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
ExpenseLine.associate = (models) => {
  ExpenseLine.belongsTo(models.ExpenseReport, {
    foreignKey: 'expense_report_id',
    as: 'expenseReport',
  });
  
  ExpenseLine.belongsTo(models.Document, {
    foreignKey: 'document_id',
    as: 'document',
  });
};

module.exports = ExpenseLine;
```

## models/BudgetExpense.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * BudgetExpense model - Junction table linking budgets to expense reports
 * @swagger
 * components:
 *   schemas:
 *     BudgetExpense:
 *       type: object
 *       required:
 *         - budget_id
 *         - expense_report_id
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Budget expense ID
 *         budget_id:
 *           type: integer
 *           description: Budget ID
 *         expense_report_id:
 *           type: integer
 *           description: Expense report ID
 *         amount:
 *           type: number
 *           format: float
 *           description: Amount charged to this budget
 */
const BudgetExpense = sequelize.define('BudgetExpense', {
  budget_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id',
    },
  },
  expense_report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'expense_reports',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
}, {
  tableName: 'budget_expenses',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: null,
});

// Model associations
BudgetExpense.associate = (models) => {
  BudgetExpense.belongsTo(models.Budget, {
    foreignKey: 'budget_id',
    as: 'budget',
  });
  
  BudgetExpense.belongsTo(models.ExpenseReport,