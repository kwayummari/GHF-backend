const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * ReplenishmentRequest model
 * @swagger
 * components:
 *   schemas:
 *     ReplenishmentRequest:
 *       type: object
 *       required:
 *         - petty_cash_book_id
 *         - date
 *         - amount
 *         - requested_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Replenishment request ID
 *         petty_cash_book_id:
 *           type: integer
 *           description: Petty cash book ID
 *         date:
 *           type: string
 *           format: date
 *           description: Date of request
 *         amount:
 *           type: number
 *           format: float
 *           description: Requested amount
 *         status:
 *           type: string
 *           enum: [draft, submitted, approved, rejected]
 *           description: Request status
 *         description:
 *           type: string
 *           description: Request description
 *         requested_by:
 *           type: integer
 *           description: User ID who made the request
 *         approved_by:
 *           type: integer
 *           description: User ID who approved the request
 */
const ReplenishmentRequest = sequelize.define('ReplenishmentRequest', {
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
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  requested_by: {
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
  tableName: 'replenishment_requests',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
ReplenishmentRequest.associate = (models) => {
  ReplenishmentRequest.belongsTo(models.PettyCashBook, {
    foreignKey: 'petty_cash_book_id',
    as: 'pettyCashBook',
  });

  ReplenishmentRequest.belongsTo(models.User, {
    foreignKey: 'requested_by',
    as: 'requester',
  });

  ReplenishmentRequest.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
};

module.exports = ReplenishmentRequest;