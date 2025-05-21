'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert demo departments
    await queryInterface.bulkInsert('departments', [
      {
        department_name: 'Human Resources',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        department_name: 'Finance',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        department_name: 'IT',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        department_name: 'Operations',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        department_name: 'Marketing',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        department_name: 'Sales',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        department_name: 'Legal',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', null, {});
  }
};