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
          model: 'Menus',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      role: {
        type: Sequelize.STRING(50),
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
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MenuPermissions');
  }
};
