
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const LeaveBalance = sequelize.define('LeaveBalance', {
  balance: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false,
    defaultValue: 0.00
  },
  carryForward: {
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
  tableName: 'leave_balance',
  timestamps: true,
  underscored: true
});

// Associations
LeaveBalance.associate = (models) => {
  LeaveBalance.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  LeaveBalance.belongsTo(models.LeaveType, {
    foreignKey: 'leave_type_id',
    as: 'type'
  });
};

module.exports = LeaveBalance;
