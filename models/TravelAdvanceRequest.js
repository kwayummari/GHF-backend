const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * TravelAdvanceRequest model
 * @swagger
 * components:
 *   schemas:
 *     TravelAdvanceRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - departure_date
 *         - return_date
 *         - total_cost
 *         - flat_rate_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Travel advance request ID
 *         user_id:
 *           type: integer
 *           description: User ID requesting travel advance
 *         approval_status:
 *           type: string
 *           enum: [draft, approved by supervisor, approved by finance, rejected]
 *           description: Approval status
 *         document_id:
 *           type: integer
 *           description: Supporting document ID
 *         departure_date:
 *           type: string
 *           format: date
 *           description: Date of departure
 *         return_date:
 *           type: string
 *           format: date
 *           description: Date of return
 *         total_cost:
 *           type: number
 *           format: float
 *           description: Total cost of travel
 *         flat_rate_id:
 *           type: integer
 *           description: Flat rate ID for daily allowance
 *         rejection_reason:
 *           type: string
 *           description: Reason for rejection if rejected
 *         approved_by:
 *           type: integer
 *           description: User ID who approved the request
 */
const TravelAdvanceRequest = sequelize.define('TravelAdvanceRequest', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approval_status: {
    type: DataTypes.ENUM('draft', 'approved by supervisor', 'approved by finance', 'rejected'),
    defaultValue: 'draft',
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
  departure_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  total_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  flat_rate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'flat_rates',
      key: 'id',
    },
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  tableName: 'travel_advance_requests',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
TravelAdvanceRequest.associate = (models) => {
  TravelAdvanceRequest.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  TravelAdvanceRequest.belongsTo(models.Document, {
    foreignKey: 'document_id',
    as: 'document',
  });
  
  TravelAdvanceRequest.belongsTo(models.FlatRate, {
    foreignKey: 'flat_rate_id',
    as: 'flatRate',
  });
  
  TravelAdvanceRequest.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
  
  TravelAdvanceRequest.hasMany(models.ExpenseReport, {
    foreignKey: 'travel_advance_request_id',
    as: 'expenseReports',
  });
};

module.exports = TravelAdvanceRequest;
```

## models/ExpenseReport.js
```javascript
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
```

## models/ExpenseLine.js
```javascript
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