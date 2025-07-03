
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const PerformanceReview = sequelize.define('PerformanceReview', {
  reviewPeriod: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  reviewDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'reviewed', 'completed'),
    allowNull: false,
    defaultValue: 'draft'
  },
  overallRating: {
    type: DataTypes.DECIMAL(3,1),
    allowNull: true
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'performance_reviews',
  timestamps: true,
  underscored: true
});

// Associations
PerformanceReview.associate = (models) => {
  PerformanceReview.belongsTo(models.User, {
    foreignKey: 'employee_id',
    as: 'employee'
  });

  PerformanceReview.belongsTo(models.User, {
    foreignKey: 'review_by',
    as: 'reviewer'
  });

  PerformanceReview.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver'
  });

  PerformanceReview.hasMany(models.PerformanceMetric, {
    foreignKey: 'review_id',
    as: 'metrics'
  });
};

module.exports = PerformanceReview;
