module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('budgets', 'quarter_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('budgets', 'quarter_id');
  }
};
