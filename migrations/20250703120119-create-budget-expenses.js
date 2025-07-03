module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('budget_expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      budget_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      expense_report_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('budget_expenses');
  }
};
