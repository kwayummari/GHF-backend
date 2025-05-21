const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * PurchaseRequest model
 * @swagger
 * components:
 *   schemas:
 *     PurchaseRequest:
 *       type: object
 *       required:
 *         - item
 *         - budget_id
 *         - requester_id
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Purchase request ID
 *         item:
 *           type: string
 *           description: Item to purchase
 *         budget_id:
 *           type: integer
 *           description: Budget ID
 *         requester_id:
 *           type: integer
 *           description: User ID of requester
 *         quantity:
 *           type: integer
 *           description: Quantity to purchase
 *         estimated_cost:
 *           type: number
 *           format: float
 *           description: Estimated cost
 *         status:
 *           type: string
 *           enum: [draft, submitted, approved, rejected, processed]
 *           description: Request status
 *         approved_by:
 *           type: integer
 *           description: User ID of approver
 */
const PurchaseRequest = sequelize.define('PurchaseRequest', {
  item: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  budget_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id',
    },
  },
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'processed'),
    defaultValue: 'draft',
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
  tableName: 'purchase_requests',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
PurchaseRequest.associate = (models) => {
  PurchaseRequest.belongsTo(models.Budget, {
    foreignKey: 'budget_id',
    as: 'budget',
  });
  
  PurchaseRequest.belongsTo(models.User, {
    foreignKey: 'requester_id',
    as: 'requester',
  });
  
  PurchaseRequest.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
};

module.exports = PurchaseRequest;