const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AutomatedTask = sequelize.define('AutomatedTask', {
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('attendance', 'workflow', 'maintenance', 'notification', 'report'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  schedule: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Cron expression for task scheduling'
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  last_run_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_run_status: {
    type: DataTypes.ENUM('success', 'failed', 'pending'),
    allowNull: true
  }
}, {
  tableName: 'automated_tasks',
  timestamps: true
});

module.exports = AutomatedTask;
