
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);


/**
 * RequisitionWorkflow model
 * @swagger
 * components:
 *   schemas:
 *     RequisitionWorkflow:
 *       type: object
 *       required:
 *         - purchase_request_id
 *         - stage
 *         - approver_role
 *         - approver_id
 *         - action
 *       properties:
 *         id:
 *           type: integer
 *           description: Workflow record ID
 *         purchase_request_id:
 *           type: integer
 *           description: Purchase request ID
 *         stage:
 *           type: integer
 *           description: Approval stage number
 *         stage_name:
 *           type: string
 *           description: Stage name
 *         approver_role:
 *           type: string
 *           description: Approver role
 *         approver_id:
 *           type: integer
 *           description: User ID of approver
 *         action:
 *           type: string
 *           enum: [approved, rejected, returned, forwarded]
 *           description: Action taken
 *         comments:
 *           type: string
 *           description: Comments from approver
 *         conditions:
 *           type: string
 *           description: Conditions attached to approval
 *         next_approver_id:
 *           type: integer
 *           description: Next approver ID
 *         completed_date:
 *           type: string
 *           format: date-time
 *           description: Completion date
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */
const RequisitionWorkflow = sequelize.define('RequisitionWorkflow', {
  purchase_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_requests',
      key: 'id',
    },
  },
  stage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stage_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  approver_role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  action: {
    type: DataTypes.ENUM('approved', 'rejected', 'returned', 'forwarded'),
    allowNull: false,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  conditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  next_approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'requisition_workflows',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
RequisitionWorkflow.associate = (models) => {
  // PurchaseRequest association
  if (models.PurchaseRequest) {
    RequisitionWorkflow.belongsTo(models.PurchaseRequest, {
      foreignKey: 'purchase_request_id',
      as: 'purchase_request',
    });
  }

  // User associations
  if (models.User) {
    RequisitionWorkflow.belongsTo(models.User, {
      foreignKey: 'approver_id',
      as: 'approver',
    });

    RequisitionWorkflow.belongsTo(models.User, {
      foreignKey: 'next_approver_id',
      as: 'next_approver',
    });
  }
};

module.exports = RequisitionWorkflow; 