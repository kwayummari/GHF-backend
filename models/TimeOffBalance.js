
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const TimeOffBalance = sequelize.define('TimeOffBalance', {
  balance: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 0.00
  },
  carryOver: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 0.00
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'time_off_balances',
  timestamps: true,
  underscored: true
});

// Associations
TimeOffBalance.associate = (models) => {
  TimeOffBalance.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  TimeOffBalance.belongsTo(models.TimeOffPolicy, {
    foreignKey: 'policy_id',
    as: 'policy'
  });
};

module.exports = TimeOffBalance;
