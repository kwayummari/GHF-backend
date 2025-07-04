module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Departments', [
      {
        id: 1,
        department_name: 'Human Resources',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        id: 2,
        department_name: 'Finance',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        department_name: 'Operations',
        description: 'Oversees day-to-day operations and project management',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('departments', null, {});
  }
};
