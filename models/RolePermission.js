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
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id'],
    },
  ],
});

RolePermission.associate = (models) => {
  RolePermission.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });

  RolePermission.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater',
  });
};

module.exports = RolePermission;