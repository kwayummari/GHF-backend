const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Quarter model
 * @swagger
 * components:
 *   schemas:
 *     Quarter:
 *       type: object
 *       required:
 *         - fiscal_year_id
 *         - title
 *         - start_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Quarter ID
 *         fiscal_year_id:
 *           type: integer
 *           description: Fiscal year ID
 *         title:
 *           type: string
 *           description: Quarter title (e.g., "Q1")
 *         start_date:
 *           type: string
 *           format: date
 *           description: Start date of quarter
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of quarter
 */
const Quarter = sequelize.define('Quarter', {
  fiscal_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fiscal_years',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'quarters',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Quarter.associate = (models) => {
  Quarter.belongsTo(models.FiscalYear, {
    foreignKey: 'fiscal_year_id',
    as: 'fiscalYear',
  });

  Quarter.hasMany(models.Budget, {
    foreignKey: 'quarter_id',
    as: 'budgets',
  });
};

module.exports = Quarter;