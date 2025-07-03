
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const TimeOffPolicy = sequelize.define('TimeOffPolicy', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('PTO', 'Sick', 'Vacation', 'Maternity', 'Paternity'),
    allowNull: false
  },
  accrualRate: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true
  },
  accrualPeriod: {
    type: DataTypes.ENUM('monthly', 'annually'),
    allowNull: true
  },
  maximumBalance: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true
  },
  carryOver: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'time_off_policies',
  timestamps: true,
  underscored: true
});

// Associations
TimeOffPolicy.associate = (models) => {
  TimeOffPolicy.hasMany(models.TimeOffBalance, {
    foreignKey: 'policy_id',
    as: 'balances'
  });

  TimeOffPolicy.hasMany(models.TimeOffRequest, {
    foreignKey: 'policy_id',
    as: 'requests'
  });
};

module.exports = TimeOffPolicy;
