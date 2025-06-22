const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * RoleMenuAccess model - Junction table for Role-Menu access control
 * @swagger
 * components:
 *   schemas:
 *     RoleMenuAccess:
 *       type: object
 *       required:
 *         - role_id
 *         - menu_id
 *       properties:
 *         id:
 *           type: integer
 *           description: RoleMenuAccess ID
 *         role_id:
 *           type: integer
 *           description: Role ID
 *         menu_id:
 *           type: integer
 *           description: Menu ID
 *         can_access:
 *           type: boolean
 *           description: Whether the role can access this menu
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */
const RoleMenuAccess = sequelize.define('RoleMenuAccess', {
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'menus',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    can_access: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'role_menu_access',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['role_id', 'menu_id'],
        },
        {
            fields: ['role_id'],
        },
        {
            fields: ['menu_id'],
        },
        {
            fields: ['can_access'],
        },
    ],
});

module.exports = RoleMenuAccess;