const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Department Model
 * Represents organizational departments
 */
const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  department_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
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
  tableName: 'departments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Define associations
Department.associate = (models) => {
  Department.hasMany(models.User, {
    foreignKey: 'department_id',
    as: 'employees',
  });
  
  Department.belongsTo(models.User, {
    foreignKey: 'manager_id',
    as: 'manager',
  });
};

module.exports = Department; 