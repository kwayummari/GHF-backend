const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * LPO (Local Purchase Order) model
 * @swagger
 * components:
 *   schemas:
 *     LPO:
 *       type: object
 *       required:
 *         - po_number
 *         - supplier_id
 *         - item_name
 *         - amount
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: LPO ID
 *         po_number:
 *           type: string
 *           description: Purchase order number
 *         supplier_id:
 *           type: integer
 *           description: Supplier ID
 *         item_name:
 *           type: string
 *           description: Name of item to purchase
 *         invoice_document_id:
 *           type: integer
 *           description: Document ID for invoice
 *         delivery_note_document_id:
 *           type: integer
 *           description: Document ID for delivery note
 *         amount:
 *           type: number
 *           format: float
 *           description: Order amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         status:
 *           type: string
 *           enum: [pending, delivered, paid, cancelled]
 *           description: Order status
 *         created_by:
 *           type: integer
 *           description: User ID who created this order
 *         approved_by:
 *           type: integer
 *           description: User ID who approved this order
 */
const LPO = sequelize.define('LPO', {
  po_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id',
    },
  },
  item_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  invoice_document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
  delivery_note_document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TZS',
  },
  status: {
    type: DataTypes.ENUM('pending', 'delivered', 'paid', 'cancelled'),
    defaultValue: 'pending',
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
  tableName: 'lpo',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
LPO.associate = (models) => {
  LPO.belongsTo(models.Supplier, {
    foreignKey: 'supplier_id',
    as: 'supplier',
  });
  
  LPO.belongsTo(models.Document, {
    foreignKey: 'invoice_document_id',
    as: 'invoiceDocument',
  });
  
  LPO.belongsTo(models.Document, {
    foreignKey: 'delivery_note_document_id',
    as: 'deliveryNoteDocument',
  });
  
  LPO.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  LPO.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
};

module.exports = LPO;
```

## models/FlatRate.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * FlatRate model for travel allowances
 * @swagger
 * components:
 *   schemas:
 *     FlatRate:
 *       type: object
 *       required:
 *         - location_category
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Flat rate ID
 *         location_category:
 *           type: string
 *           description: Location category (e.g., Urban, Rural)
 *         amount:
 *           type: number
 *           format: float
 *           description: Daily allowance amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         description:
 *           type: string
 *           description: Description of the flat rate
 */
const FlatRate = sequelize.define('FlatRate', {
  location_category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TZS',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'flat_rates',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
FlatRate.associate = (models) => {
  FlatRate.hasMany(models.TravelAdvanceRequest, {
    foreignKey: 'flat_rate_id',
    as: 'travelRequests',
  });
};

module.exports = FlatRate;
```

## models/TravelAdvanceRequest.js
```javascript
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