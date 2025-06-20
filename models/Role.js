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
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Role.associate = (models) => {
  Role.belongsToMany(models.User, {
    through: models.UserRole,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users',
  });

  Role.belongsToMany(models.Permission, {
    through: models.RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions',
  });
};

module.exports = Role;