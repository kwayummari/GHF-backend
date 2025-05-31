const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * FiscalYear model
 * @swagger
 * components:
 *   schemas:
 *     FiscalYear:
 *       type: object
 *       required:
 *         - year
 *         - start_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Fiscal year ID
 *         year:
 *           type: string
 *           description: Fiscal year (e.g., "2024-2025")
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of fiscal year
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of fiscal year
 *         status:
 *           type: string
 *           enum: [active, inactive, closed]
 *           description: Status of fiscal year
 *         created_by:
 *           type: integer
 *           description: User ID who created this fiscal year
 */
const FiscalYear = sequelize.define('FiscalYear', {
  year: {
    type: DataTypes.STRING(9),
    allowNull: false,
    unique: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'closed'),
    defaultValue: 'inactive',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'fiscal_years',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
FiscalYear.associate = (models) => {
  FiscalYear.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  FiscalYear.hasMany(models.Quarter, {
    foreignKey: 'fiscal_year_id',
    as: 'quarters',
  });

  FiscalYear.hasMany(models.Objective, {
    foreignKey: 'fiscal_year_id',
    as: 'objectives',
  });

  FiscalYear.hasMany(models.Increment, {
    foreignKey: 'fiscal_year_id',
    as: 'increments',
  });
};

module.exports = FiscalYear;