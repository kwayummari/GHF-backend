const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);

const BioData = sequelize.define('BioData', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },
  fingerprint_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  marital_status: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: false
  },
  national_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: false
  },
  blood_group: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
});

module.exports = BioData;
