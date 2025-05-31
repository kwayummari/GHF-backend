const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

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