
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);


/**
 * RequisitionItem model
 * @swagger
 * components:
 *   schemas:
 *     RequisitionItem:
 *       type: object
 *       required:
 *         - purchase_request_id
 *         - item_name
 *         - quantity
 *         - unit_price
 *       properties:
 *         id:
 *           type: integer
 *           description: Item ID
 *         purchase_request_id:
 *           type: integer
 *           description: Purchase request ID
 *         item_name:
 *           type: string
 *           description: Item name
 *         description:
 *           type: string
 *           description: Item description
 *         quantity:
 *           type: integer
 *           description: Quantity required
 *         unit_price:
 *           type: number
 *           description: Unit price
 *         total_price:
 *           type: number
 *           description: Total price (quantity * unit_price)
 *         specifications:
 *           type: string
 *           description: Technical specifications
 *         category:
 *           type: string
 *           description: Item category
 *         supplier_preference:
 *           type: string
 *           description: Preferred supplier
 *         brand:
 *           type: string
 *           description: Brand preference
 *         model:
 *           type: string
 *           description: Model preference
 *         unit_of_measure:
 *           type: string
 *           description: Unit of measure
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */
const RequisitionItem = sequelize.define('RequisitionItem', {
  purchase_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_requests',
      key: 'id',
    },
  },
  item_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  specifications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  supplier_preference: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  unit_of_measure: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'piece',
  },
}, {
  tableName: 'requisition_items',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (item) => {
      if (item.quantity && item.unit_price) {
        item.total_price = item.quantity * item.unit_price;
      }
    },
    beforeUpdate: (item) => {
      if (item.changed('quantity') || item.changed('unit_price')) {
        item.total_price = item.quantity * item.unit_price;
      }
    },
  },
});

// Model associations
RequisitionItem.associate = (models) => {
  // PurchaseRequest association
  if (models.PurchaseRequest) {
    RequisitionItem.belongsTo(models.PurchaseRequest, {
      foreignKey: 'purchase_request_id',
      as: 'purchase_request',
    });
  }
};

module.exports = RequisitionItem; 