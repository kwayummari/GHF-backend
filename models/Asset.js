
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);

/**
 * Asset model
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       required:
 *         - asset_code
 *         - asset_name
 *         - category
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Asset ID
 *         asset_code:
 *           type: string
 *           description: Unique asset code
 *         asset_name:
 *           type: string
 *           description: Asset name/description
 *         asset_tag:
 *           type: string
 *           description: Physical asset tag
 *         category:
 *           type: string
 *           description: Asset category (IT Equipment, Furniture, Vehicle, etc.)
 *         subcategory:
 *           type: string
 *           description: Asset subcategory
 *         status:
 *           type: string
 *           enum: [active, inactive, maintenance, disposed, lost]
 *           description: Asset status
 *         location:
 *           type: string
 *           description: Current location
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         custodian_id:
 *           type: integer
 *           description: User ID of custodian
 *         purchase_date:
 *           type: string
 *           format: date
 *           description: Date of purchase
 *         purchase_cost:
 *           type: number
 *           description: Purchase cost
 *         current_value:
 *           type: number
 *           description: Current estimated value
 *         supplier_id:
 *           type: integer
 *           description: Supplier ID
 *         warranty_expiry:
 *           type: string
 *           format: date
 *           description: Warranty expiry date
 *         serial_number:
 *           type: string
 *           description: Serial number
 *         model:
 *           type: string
 *           description: Model information
 *         manufacturer:
 *           type: string
 *           description: Manufacturer
 *         description:
 *           type: string
 *           description: Additional description
 *         notes:
 *           type: string
 *           description: Additional notes
 *         created_by:
 *           type: integer
 *           description: User ID who created this asset
 */
const Asset = sequelize.define('Asset', {
  asset_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  asset_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  asset_tag: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'disposed', 'lost'),
    defaultValue: 'active',
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  custodian_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  current_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'id',
    },
  },
  warranty_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Asset.associate = (models) => {
  // Department association
  if (models.Department) {
    Asset.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
  }

  // User associations
  if (models.User) {
    Asset.belongsTo(models.User, {
      foreignKey: 'custodian_id',
      as: 'custodian',
    });

    Asset.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
  }

  // Supplier association (commented out until Supplier model is created)
  // if (models.Supplier) {
  //   Asset.belongsTo(models.Supplier, {
  //     foreignKey: 'supplier_id',
  //     as: 'supplier',
  //   });
  // }

  // AssetMaintenance association
  if (models.AssetMaintenance) {
    Asset.hasMany(models.AssetMaintenance, {
      foreignKey: 'asset_id',
      as: 'maintenanceRecords',
    });
  }
};

module.exports = Asset; 