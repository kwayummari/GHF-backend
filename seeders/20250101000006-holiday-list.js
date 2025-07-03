module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('holiday_list', [
      {
        name: 'New Year\'s Day',
        date: new Date('2025-01-01'),
        status: 'non-editable',
        is_workday: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // admin
        updated_by: 1
      },
      {
        name: 'Independence Day',
        date: new Date('2025-12-09'),
        status: 'editable',
        is_workday: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // admin
        updated_by: 1
      },
      {
        name: 'Eid al-Fitr',
        date: new Date('2025-04-20'),
        status: 'editable',
        is_workday: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // admin
        updated_by: 1
      },
      {
        name: 'Eid al-Adha',
        date: new Date('2025-06-28'),
        status: 'editable',
        is_workday: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // admin
        updated_by: 1
      },
      {
        name: 'Christmas Day',
        date: new Date('2025-12-25'),
        status: 'non-editable',
        is_workday: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1, // admin
        updated_by: 1
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('holiday_list', null, {});
  }
};
