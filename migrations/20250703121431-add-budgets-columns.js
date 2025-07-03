module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('budgets', 'department_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.addColumn('budgets', 'responsible_person_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.addColumn('budgets', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('budgets', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('budgets', 'department_id');
    await queryInterface.removeColumn('budgets', 'responsible_person_id');
    await queryInterface.removeColumn('budgets', 'created_by');
    await queryInterface.removeColumn('budgets', 'approved_by');
  }
};
