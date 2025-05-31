const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Objective model
 * @swagger
 * components:
 *   schemas:
 *     Objective:
 *       type: object
 *       required:
 *         - user_id
 *         - title
 *         - description
 *         - implementation_quarter
 *         - fiscal_year_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Objective ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         title:
 *           type: string
 *           description: Objective title
 *         description:
 *           type: string
 *           description: Objective description
 *         is_approved:
 *           type: boolean
 *           description: Whether objective is approved
 *         implementation_quarter:
 *           type: string
 *           enum: [Q1, Q2, Q3, Q4]
 *           description: Quarter for implementation
 *         fiscal_year_id:
 *           type: integer
 *           description: Fiscal year ID
 */
const Objective = sequelize.define('Objective', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  implementation_quarter: {
    type: DataTypes.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
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
}, {
  tableName: 'objectives',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Objective.associate = (models) => {
  Objective.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  Objective.belongsTo(models.FiscalYear, {
    foreignKey: 'fiscal_year_id',
    as: 'fiscalYear',
  });

  Objective.hasMany(models.AppraisalForm, {
    foreignKey: 'objective_id',
    as: 'appraisalForms',
  });
};

module.exports = Objective;