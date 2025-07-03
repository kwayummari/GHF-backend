
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const PerformanceMetric = sequelize.define('PerformanceMetric', {
  metricName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  metricType: {
    type: DataTypes.ENUM('rating', 'number', 'text'),
    allowNull: false
  },
  target: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  actual: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3,1),
    allowNull: true
  }
}, {
  tableName: 'performance_metrics',
  timestamps: true,
  underscored: true
});

// Associations
PerformanceMetric.associate = (models) => {
  PerformanceMetric.belongsTo(models.PerformanceReview, {
    foreignKey: 'review_id',
    as: 'review'
  });
};

module.exports = PerformanceMetric;
