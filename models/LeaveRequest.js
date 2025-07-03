
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const LeaveRequest = sequelize.define('LeaveRequest', {
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
    allowNull: false
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'leave_requests',
  timestamps: true,
  underscored: true
});

// Associations
LeaveRequest.associate = (models) => {
  LeaveRequest.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'requester'
  });

  LeaveRequest.belongsTo(models.LeaveType, {
    foreignKey: 'leave_type_id',
    as: 'type'
  });

  LeaveRequest.belongsTo(models.User, {
    foreignKey: 'approvedBy',
    as: 'approver'
  });
};

module.exports = LeaveRequest;
