module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expense_lines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      has_receipt: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      expense_report_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('expense_lines');
  }
};
