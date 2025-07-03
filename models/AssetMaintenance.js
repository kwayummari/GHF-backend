const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * AssetMaintenance model
 * @swagger
 * components:
 *   schemas:
 *     AssetMaintenance:
 *       type: object
 *       required:
 *         - asset_id
 *         - maintenance_type
 *         - title
 *         - scheduled_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Maintenance record ID
 *         maintenance_number:
 *           type: string
 *           description: Unique maintenance number
 *         asset_id:
 *           type: integer
 *           description: Asset ID
 *         maintenance_type:
 *           type: string
 *           enum: [preventive, corrective, emergency]
 *           description: Type of maintenance
 *         title:
 *           type: string
 *           description: Maintenance title
 *         description:
 *           type: string
 *           description: Detailed description
 *         scheduled_date:
 *           type: string
 *           format: date
 *           description: Scheduled maintenance date
 *         completed_date:
 *           type: string
 *           format: date
 *           description: Actual completion date
 *         estimated_duration:
 *           type: string
 *           description: Estimated duration (e.g., "2 hours")
 *         actual_duration:
 *           type: string
 *           description: Actual duration taken
 *         estimated_cost:
 *           type: number
 *           description: Estimated cost
 *         actual_cost:
 *           type: number
 *           description: Actual cost incurred
 *         assigned_to:
 *           type: string
 *           description: Person/team assigned
 *         vendor_id:
 *           type: string
 *           description: Vendor ID (or "internal" for internal maintenance)
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Maintenance priority
 *         maintenance_category:
 *           type: string
 *           description: Category of maintenance
 *         status:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *           description: Maintenance status
 *         completion_percentage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Completion percentage
 *         notes:
 *           type: string
 *           description: Additional notes
 *         completion_notes:
 *           type: string
 *           description: Notes upon completion
 *         created_by:
 *           type: integer
 *           description: User ID who created this record
 *         completed_by:
 *           type: integer
 *           description: User ID who completed the maintenance
 */
const AssetMaintenance = sequelize.define('AssetMaintenance', {
  maintenance_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'id',
    },
  },
  maintenance_type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'emergency'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  completed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  estimated_duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  actual_duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  actual_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  assigned_to: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  vendor_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  maintenance_category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  completion_notes: {
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
  completed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'asset_maintenance',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
AssetMaintenance.associate = (models) => {
  AssetMaintenance.belongsTo(models.Asset, {
    foreignKey: 'asset_id',
    as: 'asset',
  });

  AssetMaintenance.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  AssetMaintenance.belongsTo(models.User, {
    foreignKey: 'completed_by',
    as: 'completer',
  });
};

module.exports = AssetMaintenance; 