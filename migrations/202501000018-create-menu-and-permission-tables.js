module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create menus table
    await queryInterface.createTable('menus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'menus',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      route: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Create menu_permissions table
    await queryInterface.createTable('menu_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      menu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'menus',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('menus', {
      fields: ['parentId'],
      type: 'foreign key',
      name: 'fk_menus_parent',
      references: {
        table: 'menus',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('menu_permissions', {
      fields: ['menu_id'],
      type: 'foreign key',
      name: 'fk_menu_permissions_menu',
      references: {
        table: 'menus',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('menu_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'fk_menu_permissions_permission',
      references: {
        table: 'permissions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for menu_permissions
    await queryInterface.addConstraint('menu_permissions', {
      fields: ['menu_id', 'permission_id'],
      type: 'unique',
      name: 'unique_menu_permission'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('menus', 'fk_menus_parent');
    await queryInterface.removeConstraint('menu_permissions', 'fk_menu_permissions_menu');
    await queryInterface.removeConstraint('menu_permissions', 'fk_menu_permissions_permission');
    await queryInterface.removeConstraint('menu_permissions', 'unique_menu_permission');

    // Drop tables
    await queryInterface.dropTable('menu_permissions');
    await queryInterface.dropTable('menus');
  }
};
