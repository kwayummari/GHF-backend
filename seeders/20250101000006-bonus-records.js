module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('BonusRecords', [
      {
        id: 1,
        user_id: 1,
        bonus_type: 'performance',
        amount: 200000.00,
        percentage: 8.00,
        pay_period: '2024-06',
        is_taxable: 1,
        reason: 'Outstanding performance Q2',
        status: 'approved',
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 2,
        user_id: 2,
        bonus_type: 'annual',
        amount: 300000.00,
        percentage: 12.00,
        pay_period: '2024-06',
        is_taxable: 1,
        reason: 'Annual bonus 2024',
        status: 'approved',
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 3,
        user_id: 3,
        bonus_type: 'festival',
        amount: 100000.00,
        pay_period: '2024-06',
        is_taxable: 1,
        reason: 'Eid al-Fitr bonus',
        status: 'approved',
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 4,
        user_id: 4,
        bonus_type: 'retention',
        amount: 150000.00,
        percentage: 6.00,
        pay_period: '2024-06',
        is_taxable: 1,
        reason: '5-year service bonus',
        status: 'pending',
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('BonusRecords', null, {});
  }
};
