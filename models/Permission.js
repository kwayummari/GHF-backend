const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

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
const Permission = sequelize.define('Permission', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM('create', 'read', 'update', 'delete'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Permission.associate = (models) => {
  Permission.belongsToMany(models.Role, {
    through: models.RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles',
  });
};

module.exports = Permission;