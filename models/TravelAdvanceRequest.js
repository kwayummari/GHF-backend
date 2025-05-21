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