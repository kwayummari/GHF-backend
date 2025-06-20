const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Permission model
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - name
 *         - module
 *         - action
 *       properties:
 *         id:
 *           type: integer
 *           description: Permission ID
 *         name:
 *           type: string
 *           description: Permission name
 *         module:
 *           type: string
 *           description: Module this permission applies to
 *         action:
 *           type: string
 *           enum: [create, read, update, delete]
 *           description: Action type for this permission
 *         description:
 *           type: string
 *           description: Permission description
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  permission_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'manage'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['permission_name']
    },
    {
      fields: ['module']
    },
    {
      fields: ['action']
    }
  ]
});

module.exports = Permission;