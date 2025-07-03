
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);


/**
 * PurchaseRequest model
 * @swagger
 * components:
 *   schemas:
 *     PurchaseRequest:
 *       type: object
 *       required:
 *         - title
 *         - department_id
 *         - requested_by
 *         - priority
 *         - required_date
 *         - estimated_cost
 *       properties:
 *         id:
 *           type: integer
 *           description: Purchase request ID
 *         requisition_number:
 *           type: string
 *           description: Unique requisition number
 *         title:
 *           type: string
 *           description: Purchase request title
 *         description:
 *           type: string
 *           description: Detailed description
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         requested_by:
 *           type: integer
 *           description: User ID who requested
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level
 *         required_date:
 *           type: string
 *           format: date
 *           description: Required delivery date
 *         estimated_cost:
 *           type: number
 *           description: Estimated total cost
 *         actual_cost:
 *           type: number
 *           description: Actual cost after procurement
 *         status:
 *           type: string
 *           enum: [draft, pending, approved, rejected, cancelled]
 *           description: Request status
 *         approval_stage:
 *           type: integer
 *           description: Current approval stage
 *         total_stages:
 *           type: integer
 *           description: Total approval stages
 *         budget_id:
 *           type: integer
 *           description: Budget ID
 *         justification:
 *           type: string
 *           description: Business justification
 *         notes:
 *           type: string
 *           description: Additional notes
 *         approved_by:
 *           type: integer
 *           description: User ID who approved
 *         approved_date:
 *           type: string
 *           format: date-time
 *           description: Approval date
 *         rejected_by:
 *           type: integer
 *           description: User ID who rejected
 *         rejected_date:
 *           type: string
 *           format: date-time
 *           description: Rejection date
 *         rejection_reason:
 *           type: string
 *           description: Reason for rejection
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           description: Submission date
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */
const PurchaseRequest = sequelize.define('PurchaseRequest', {
  requisition_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  required_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  actual_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'draft',
  },
  approval_stage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_stages: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  budget_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'budgets',
      key: 'id',
    },
  },
  justification: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
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
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejected_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rejected_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'purchase_requests',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
PurchaseRequest.associate = (models) => {
  // Department association
  if (models.Department) {
    PurchaseRequest.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
  }

  // User associations
  if (models.User) {
    PurchaseRequest.belongsTo(models.User, {
      foreignKey: 'requested_by',
      as: 'requester',
    });

    PurchaseRequest.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approved_by_user',
    });

    PurchaseRequest.belongsTo(models.User, {
      foreignKey: 'rejected_by',
      as: 'rejected_by_user',
    });
  }

  // Budget association (commented out until Budget model is created)
  // if (models.Budget) {
  //   PurchaseRequest.belongsTo(models.Budget, {
  //     foreignKey: 'budget_id',
  //     as: 'budget',
  //   });
  // }

  // RequisitionItem association
  if (models.RequisitionItem) {
    PurchaseRequest.hasMany(models.RequisitionItem, {
      foreignKey: 'purchase_request_id',
      as: 'items',
    });
  }

  // RequisitionAttachment association
  if (models.RequisitionAttachment) {
    PurchaseRequest.hasMany(models.RequisitionAttachment, {
      foreignKey: 'purchase_request_id',
      as: 'attachments',
    });
  }

  // RequisitionWorkflow association
  if (models.RequisitionWorkflow) {
    PurchaseRequest.hasMany(models.RequisitionWorkflow, {
      foreignKey: 'purchase_request_id',
      as: 'workflow_history',
    });
  }
};

module.exports = PurchaseRequest; 