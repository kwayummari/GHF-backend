const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * ExpenseReport model
 * @swagger
 * components:
 *   schemas:
 *     ExpenseReport:
 *       type: object
 *       required:
 *         - travel_advance_request_id
 *         - date
 *         - expense_title
 *         - expense_amount
 *         - deadline
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Expense report ID
 *         travel_advance_request_id:
 *           type: integer
 *           description: Travel advance request ID
 *         date:
 *           type: string
 *           format: date
 *           description: Date of expense report
 *         document_id:
 *           type: integer
 *           description: Supporting document ID
 *         expense_title:
 *           type: string
 *           description: Title of expense report
 *         receipt_document_id:
 *           type: integer
 *           description: Receipt document ID
 *         expense_amount:
 *           type: number
 *           format: float
 *           description: Total expense amount
 *         description:
 *           type: string
 *           description: Description of expenses
 *         budget_line:
 *           type: string
 *           description: Budget line reference
 *         deadline:
 *           type: string
 *           format: date
 *           description: Deadline for submission
 *         status:
 *           type: string
 *           enum: [draft, submitted, approved, rejected]
 *           description: Report status
 *         created_by:
 *           type: integer
 *           description: User ID who created this report
 *         approved_by:
 *           type: integer
 *           description: User ID who approved this report
 */
const ExpenseReport = sequelize.define('ExpenseReport', {
  travel_advance_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'travel_advance_requests',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
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
  expense_title: {
    type: DataTypes.STRING(255),
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
  expense_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budget_line: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'expense_reports',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
ExpenseReport.associate = (models) => {
  ExpenseReport.belongsTo(models.TravelAdvanceRequest, {
    foreignKey: 'travel_advance_request_id',
    as: 'travelAdvanceRequest',
  });
  
  ExpenseReport.belongsTo(models.Document, {
    foreignKey: 'document_id',
    as: 'document',
  });
  
  ExpenseReport.belongsTo(models.Document, {
    foreignKey: 'receipt_document_id',
    as: 'receiptDocument',
  });
  
  ExpenseReport.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  ExpenseReport.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
  
  ExpenseReport.hasMany(models.ExpenseLine, {
    foreignKey: 'expense_report_id',
    as: 'expenseLines',
  });
  
  ExpenseReport.hasMany(models.BudgetExpense, {
    foreignKey: 'expense_report_id',
    as: 'budgetExpenses',
  });
};

module.exports = ExpenseReport;