const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Supplier model
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - supplier_id
 *         - name
 *         - type
 *       properties:
 *         id:
 *           type: integer
 *           description: Supplier ID
 *         supplier_id:
 *           type: string
 *           description: Supplier identifier
 *         name:
 *           type: string
 *           description: Supplier name
 *         type:
 *           type: string
 *           enum: [individual, company]
 *           description: Supplier type
 *         tax_id:
 *           type: string
 *           description: Tax identification number
 *         address:
 *           type: string
 *           description: Supplier address
 *         email:
 *           type: string
 *           format: email
 *           description: Supplier email address
 *         phone_number:
 *           type: string
 *           description: Supplier phone number
 *         contact_person:
 *           type: string
 *           description: Contact person name
 */
const Supplier = sequelize.define('Supplier', {
  supplier_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('individual', 'company'),
    allowNull: false,
  },
  tax_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'suppliers',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Supplier.associate = (models) => {
  Supplier.hasMany(models.LPO, {
    foreignKey: 'supplier_id',
    as: 'purchaseOrders',
  });
  
  Supplier.hasMany(models.Quotation, {
    foreignKey: 'supplier_id',
    as: 'quotations',
  });
};

module.exports = Supplier;