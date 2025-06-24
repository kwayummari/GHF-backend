const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * MenuPermission model - Junction table for Menu-Permission many-to-many relationship
 * @swagger
 * components:
 *   schemas:
 *     MenuPermission:
 *       type: object
 *       required:
 *         - menu_id
 *         - permission_id
 *       properties:
 *         id:
 *           type: integer
 *           description: MenuPermission ID
 *         menu_id:
 *           type: integer
 *           description: Menu ID
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 */
const MenuPermission = sequelize.define('MenuPermission', {
    menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'menus',
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
}, {
    tableName: 'menu_permissions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['menu_id', 'permission_id'],
        },
    ],
});

module.exports = MenuPermission;