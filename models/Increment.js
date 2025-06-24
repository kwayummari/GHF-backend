const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Increment model for salary increments
 * @swagger
 * components:
 *   schemas:
 *     Increment:
 *       type: object
 *       required:
 *         - user_id
 *         - increment_percentage
 *         - fiscal_year_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Increment ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         increment_percentage:
 *           type: number
 *           format: float
 *           description: Percentage of salary increment
 *         fiscal_year_id:
 *           type: integer
 *           description: Fiscal year ID
 *         approved_by:
 *           type: integer
 *           description: User ID who approved the increment
 */
const Increment = sequelize.define('Increment', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  increment_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  fiscal_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fiscal_years',
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
  tableName: 'increments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Increment.associate = (models) => {
  Increment.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  Increment.belongsTo(models.FiscalYear, {
    foreignKey: 'fiscal_year_id',
    as: 'fiscalYear',
  });

  Increment.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });

  Increment.hasMany(models.Payroll, {
    foreignKey: 'increment_id',
    as: 'payrolls',
  });
};

module.exports = Increment;