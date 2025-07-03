module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('fiscal_years', [
      {
        year: 2024,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        year: 2025,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'planning',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Create quarters for each fiscal year
    const quarters = [];
    [2024, 2025].forEach(year => {
      const startDate = new Date(`${year}-01-01`);
      for (let i = 1; i <= 4; i++) {
        const quarterStart = new Date(startDate);
        quarterStart.setMonth((i - 1) * 3);
        const quarterEnd = new Date(quarterStart);
        quarterEnd.setMonth(quarterStart.getMonth() + 2, 31);

        quarters.push({
          fiscal_year: year,
          quarter_number: i,
          start_date: quarterStart,
          end_date: quarterEnd,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('quarters', quarters, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('quarters', null, {});
    await queryInterface.bulkDelete('fiscal_years', null, {});
  }
};
