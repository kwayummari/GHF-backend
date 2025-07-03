
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const TimeOffRequest = sequelize.define('TimeOffRequest', {
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalDays: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'time_off_requests',
  timestamps: true,
  underscored: true
});

// Associations
TimeOffRequest.associate = (models) => {
  TimeOffRequest.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'requester'
  });

  TimeOffRequest.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver'
  });

  TimeOffRequest.belongsTo(models.TimeOffPolicy, {
    foreignKey: 'policy_id',
    as: 'policy'
  });
};

module.exports = TimeOffRequest;
