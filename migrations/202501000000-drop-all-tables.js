module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of dependencies
    try {
      await queryInterface.dropTable('loan_installments', { cascade: true });
      await queryInterface.dropTable('loans', { cascade: true });
      await queryInterface.dropTable('lpos', { cascade: true });
      await queryInterface.dropTable('quotations', { cascade: true });
      await queryInterface.dropTable('expense_lines', { cascade: true });
      await queryInterface.dropTable('travel_advance_requests', { cascade: true });
      await queryInterface.dropTable('expense_reports', { cascade: true });
      await queryInterface.dropTable('user_permissions', { cascade: true });
      await queryInterface.dropTable('role_permissions', { cascade: true });
      await queryInterface.dropTable('permissions', { cascade: true });
      await queryInterface.dropTable('roles', { cascade: true });
      await queryInterface.dropTable('bio_data', { cascade: true });
      await queryInterface.dropTable('users', { cascade: true });
      await queryInterface.dropTable('departments', { cascade: true });
    } catch (error) {
      console.error('Error dropping tables:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No need to do anything in down since we're just dropping tables
  }
};
