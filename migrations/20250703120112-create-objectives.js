module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('objectives', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      target: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      weight: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 1.00
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
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
    await queryInterface.dropTable('objectives');
  }
};
