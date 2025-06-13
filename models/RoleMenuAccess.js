const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

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
 */
const RoleMenuAccess = sequelize.define('RoleMenuAccess', {
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id',
        },
    },
    menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'menus',
            key: 'id',
        },
    },
    can_access: {
        type: DataTypes.BOOLEAN,
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
    ],
});

// Model associations
RoleMenuAccess.associate = (models) => {
    RoleMenuAccess.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role',
    });

    RoleMenuAccess.belongsTo(models.Menu, {
        foreignKey: 'menu_id',
        as: 'menu',
    });
};

module.exports = RoleMenuAccess;