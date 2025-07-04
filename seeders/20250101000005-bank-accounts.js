module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('BankAccounts', [
      {
        id: 1,
        user_id: 1,
        bank_name: 'CRDB Bank',
        account_number: '1234567890',
        account_type: 'salary',
        branch_code: '001',
        is_primary: 1,
        is_active: 1,
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 2,
        user_id: 2,
        bank_name: 'NMB Bank',
        account_number: '0987654321',
        account_type: 'salary',
        branch_code: '002',
        is_primary: 1,
        is_active: 1,
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 3,
        user_id: 3,
        bank_name: 'NBC Bank',
        account_number: '1122334455',
        account_type: 'salary',
        branch_code: '003',
        is_primary: 1,
        is_active: 1,
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 4,
        user_id: 4,
        bank_name: 'CRDB Bank',
        account_number: '5566778899',
        account_type: 'salary',
        branch_code: '001',
        is_primary: 1,
        is_active: 1,
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      },
      {
        id: 5,
        user_id: 5,
        bank_name: 'NMB Bank',
        account_number: '9988776655',
        account_type: 'salary',
        branch_code: '002',
        is_primary: 1,
        is_active: 1,
        created_at: new Date('2025-07-02 12:32:29'),
        updated_at: new Date('2025-07-02 12:32:29')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('BankAccounts', null, {});
  }
};
