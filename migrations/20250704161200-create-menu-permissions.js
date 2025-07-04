module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MenuPermissions', {
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
          model: 'Menu',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      role: {
        type: Sequelize.ENUM('admin', 'hr_manager', 'finance_manager', 'user'),
        allowNull: false
      },
      can_view: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_create: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_edit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MenuPermissions');
  }
};
