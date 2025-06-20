const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * UserRole model - Junction table for User-Role many-to-many relationship
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       required:
 *         - user_id
 *         - role_id
 *       properties:
 *         id:
 *           type: integer
 *           description: UserRole ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         role_id:
 *           type: integer
 *           description: Role ID
 */
const UserRole = sequelize.define('UserRole', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
}, {
  tableName: 'user_roles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role_id'],
    },
  ],
});

module.exports = UserRole;