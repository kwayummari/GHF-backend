const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * Menu model
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       required:
 *         - menu_name
 *         - menu_label
 *       properties:
 *         id:
 *           type: integer
 *           description: Menu ID
 *         menu_name:
 *           type: string
 *           description: Menu identifier/name
 *         menu_label:
 *           type: string
 *           description: Menu display label
 *         menu_icon:
 *           type: string
 *           description: Menu icon (FontAwesome class)
 *         menu_url:
 *           type: string
 *           description: Menu URL/route
 *         parent_id:
 *           type: integer
 *           description: Parent menu ID for nested menus
 *         menu_order:
 *           type: integer
 *           description: Menu display order
 *         is_active:
 *           type: boolean
 *           description: Whether menu is active
 */
const Menu = sequelize.define('Menu', {
  menu_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  menu_label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  menu_icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  menu_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'menus',
      key: 'id',
    },
  },
  menu_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'menus',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Menu.associate = (models) => {
  // Self-referencing association for parent-child relationships
  Menu.belongsTo(Menu, {
    foreignKey: 'parent_id',
    as: 'parent',
  });
  
  Menu.hasMany(Menu, {
    foreignKey: 'parent_id',
    as: 'children',
  });
  
  // Many-to-many relationship with permissions
  Menu.belongsToMany(models.Permission, {
    through: models.MenuPermission,
    foreignKey: 'menu_id',
    otherKey: 'permission_id',
    as: 'permissions',
  });
  
  // Many-to-many relationship with roles through role_menu_access
  Menu.belongsToMany(models.Role, {
    through: models.RoleMenuAccess,
    foreignKey: 'menu_id',
    otherKey: 'role_id',
    as: 'roles',
  });
};

module.exports = Menu;