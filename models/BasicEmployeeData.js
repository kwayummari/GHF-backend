const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * BasicEmployeeData Model
 * Stores basic employee salary and employment information
 */
const BasicEmployeeData = sequelize.define('BasicEmployeeData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  employee_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  basic_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  position: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  employment_type: {
    type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'temporary'),
    defaultValue: 'full_time',
  },
  tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bank_account: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bank_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'basic_employee_data',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Define associations
BasicEmployeeData.associate = (models) => {
  BasicEmployeeData.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = BasicEmployeeData; 