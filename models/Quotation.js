const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Quotation model
 * @swagger
 * components:
 *   schemas:
 *     Quotation:
 *       type: object
 *       required:
 *         - supplier_id
 *         - date
 *         - procurement_title
 *         - amount
 *         - submitted_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Quotation ID
 *         supplier_id:
 *           type: integer
 *           description: Supplier ID
 *         document_id:
 *           type: integer
 *           description: Document ID for quotation attachment
 *         date:
 *           type: string
 *           format: date
 *           description: Quotation date
 *         procurement_title:
 *           type: string
 *           description: Title of procurement
 *         amount:
 *           type: number
 *           format: float
 *           description: Quotation amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         description:
 *           type: string
 *           description: Quotation description
 *         submitted_by:
 *           type: integer
 *           description: User ID who submitted the quotation
 */
const Quotation = sequelize.define('Quotation', {
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id',
    },
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  procurement_title: {
    type: DataTypes.STRING(255),
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
  submitted_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'quotations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Quotation.associate = (models) => {
  Quotation.belongsTo(models.Supplier, {
    foreignKey: 'supplier_id',
    as: 'supplier',
  });

  Quotation.belongsTo(models.Document, {
    foreignKey: 'document_id',
    as: 'document',
  });

  Quotation.belongsTo(models.User, {
    foreignKey: 'submitted_by',
    as: 'submitter',
  });
};

module.exports = Quotation;