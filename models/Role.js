const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * Role model
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - role_name
 *       properties:
 *         id:
 *           type: integer
 *           description: Role ID
 *         role_name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *         is_default:
 *           type: boolean
 *           description: Whether this is a default role
 */
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'roles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['role_name']
    }
  ]
});

module.exports = Role;