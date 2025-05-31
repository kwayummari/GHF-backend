const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * Budget model
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       required:
 *         - quarter_id
 *         - department_id
 *         - activity_name
 *         - responsible_person_id
 *         - amount
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Budget ID
 *         quarter_id:
 *           type: integer
 *           description: Quarter ID
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         activity_name:
 *           type: string
 *           description: Name of the activity
 *         responsible_person_id:
 *           type: integer
 *           description: User ID of responsible person
 *         description:
 *           type: string
 *           description: Budget description
 *         amount:
 *           type: number
 *           format: float
 *           description: Budget amount
 *         status:
 *           type: string
 *           enum: [draft, submitted, approved, rejected]
 *           description: Budget status
 *         created_by:
 *           type: integer
 *           description: User ID who created this budget
 *         approved_by:
 *           type: integer
 *           description: User ID who approved this budget
 */
const Budget = sequelize.define('Budget', {
  quarter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quarters',
      key: 'id',
    },
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  activity_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  responsible_person_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft',
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
  tableName: 'budgets',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Budget.associate = (models) => {
  Budget.belongsTo(models.Quarter, {
    foreignKey: 'quarter_id',
    as: 'quarter',
  });
  
  Budget.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });
  
  Budget.belongsTo(models.User, {
    foreignKey: 'responsible_person_id',
    as: 'responsiblePerson',
  });
  
  Budget.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  Budget.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
  
  Budget.hasMany(models.BudgetExpense, {
    foreignKey: 'budget_id',
    as: 'budgetExpenses',
  });
  
  Budget.hasMany(models.PurchaseRequest, {
    foreignKey: 'budget_id',
    as: 'purchaseRequests',
  });
};

module.exports = Budget;