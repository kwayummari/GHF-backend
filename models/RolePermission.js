const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * RolePermission model - Junction table for Role-Permission many-to-many relationship
 * @swagger
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       required:
 *         - role_id
 *         - permission_id
 *       properties:
 *         id:
 *           type: integer
 *           description: RolePermission ID
 *         role_id:
 *           type: integer
 *           description: Role ID
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *         created_by:
 *           type: integer
 *           description: User ID who created this association
 *         updated_by:
 *           type: integer
 *           description: User ID who last updated this association
 */

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id']
    }
  ]
});

module.exports = RolePermission;