module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Departments', [
      {
        department_name: 'Administration',
        description: 'Responsible for administrative functions and operations',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        department_name: 'Finance',
        description: 'Handles financial planning, budgeting, and accounting',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        department_name: 'Human Resources',
        description: 'Manages personnel, recruitment, and employee relations',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        department_name: 'Information Technology',
        description: 'Manages IT infrastructure and systems',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
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
