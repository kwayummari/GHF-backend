module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permissions', [
      { name: 'view_dashboard', description: 'View dashboard', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_employees', description: 'Manage employee records', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_leave', description: 'Manage leave requests', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_performance', description: 'Manage performance reviews', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_training', description: 'Manage training programs', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_recruitment', description: 'Manage recruitment process', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_payroll', description: 'Manage payroll', created_at: new Date(), updated_at: new Date() },
      { name: 'view_reports', description: 'View reports', created_at: new Date(), updated_at: new Date() },
      { name: 'manage_settings', description: 'Manage system settings', created_at: new Date(), updated_at: new Date() },
      { name: 'create_employee', description: 'Create employee records', created_at: new Date(), updated_at: new Date() },
      { name: 'edit_employee', description: 'Edit employee records', created_at: new Date(), updated_at: new Date() },
      { name: 'delete_employee', description: 'Delete employee records', created_at: new Date(), updated_at: new Date() },
      { name: 'create_leave', description: 'Create leave requests', created_at: new Date(), updated_at: new Date() },
      { name: 'approve_leave', description: 'Approve leave requests', created_at: new Date(), updated_at: new Date() },
      { name: 'create_performance', description: 'Create performance reviews', created_at: new Date(), updated_at: new Date() },
      { name: 'approve_performance', description: 'Approve performance reviews', created_at: new Date(), updated_at: new Date() },
      { name: 'create_training', description: 'Create training programs', created_at: new Date(), updated_at: new Date() },
      { name: 'approve_training', description: 'Approve training programs', created_at: new Date(), updated_at: new Date() },
      { name: 'create_recruitment', description: 'Create recruitment posts', created_at: new Date(), updated_at: new Date() },
      { name: 'approve_recruitment', description: 'Approve recruitment posts', created_at: new Date(), updated_at: new Date() },
      { name: 'create_payroll', description: 'Create payroll records', created_at: new Date(), updated_at: new Date() },
      { name: 'approve_payroll', description: 'Approve payroll records', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
