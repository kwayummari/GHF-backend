module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'admin',
        description: 'System Administrator',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'hr_manager',
        description: 'Human Resources Manager',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'finance_manager',
        description: 'Finance Manager',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'it_manager',
        description: 'IT Manager',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'employee',
        description: 'Regular Employee',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
