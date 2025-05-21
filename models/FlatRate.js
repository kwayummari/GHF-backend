const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * FlatRate model for travel allowances
 * @swagger
 * components:
 *   schemas:
 *     FlatRate:
 *       type: object
 *       required:
 *         - location_category
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Flat rate ID
 *         location_category:
 *           type: string
 *           description: Location category (e.g., Urban, Rural)
 *         amount:
 *           type: number
 *           format: float
 *           description: Daily allowance amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         description:
 *           type: string
 *           description: Description of the flat rate
 */
const FlatRate = sequelize.define('FlatRate', {
  location_category: {
    type: DataTypes.STRING(100),
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
}, {
  tableName: 'flat_rates',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
FlatRate.associate = (models) => {
  FlatRate.hasMany(models.TravelAdvanceRequest, {
    foreignKey: 'flat_rate_id',
    as: 'travelRequests',
  });
};

module.exports = FlatRate;