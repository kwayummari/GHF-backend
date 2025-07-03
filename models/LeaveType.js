
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const LeaveType = sequelize.define('LeaveType', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  maxDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  carryForward: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'leave_types',
  timestamps: true,
  underscored: true
});

// Associations
LeaveType.associate = (models) => {
  LeaveType.hasMany(models.LeaveBalance, {
    foreignKey: 'leave_type_id',
    as: 'balances'
  });

  LeaveType.hasMany(models.LeaveRequest, {
    foreignKey: 'leave_type_id',
    as: 'requests'
  });
};

module.exports = LeaveType;
