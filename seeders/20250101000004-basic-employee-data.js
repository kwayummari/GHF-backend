module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('BasicEmployeeData', [
      {
        user_id: 1,
        status: 'active',
        registration_number: 'REG001',
        date_joined: new Date('2020-01-15'),
        designation: 'System Administrator',
        employment_type: 'full time',
        department_id: 3,
        salary: 5000000.00,
        supervisor_id: 3,
        bank_name: 'CRDB Bank',
        account_number: '1234567890',
        nida: 'NIDA-12345',
        bima: 'BIMA-111',
        nssf: 'NSSF-222',
        helsb: 'HELSB-333',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-15 22:39:20')
      },
      {
        user_id: 2,
        status: 'active',
        registration_number: 'REG002',
        date_joined: new Date('2021-03-01'),
        designation: 'Software Developer',
        employment_type: 'full time',
        department_id: 3,
        salary: 3500000.00,
        supervisor_id: 1,
        bank_name: 'NMB Bank',
        account_number: '0987654321',
        nida: 'NIDA-67890',
        bima: 'BIMA-444',
        nssf: 'NSSF-555',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        user_id: 3,
        status: 'active',
        registration_number: 'REG003',
        date_joined: new Date('2019-07-20'),
        designation: 'IT Department Head',
        employment_type: 'full time',
        department_id: 3,
        salary: 4000000.00,
        supervisor_id: 1,
        bank_name: 'Standard Chartered',
        account_number: '1122334455',
        nida: 'NIDA-13579',
        bima: 'BIMA-777',
        nssf: 'NSSF-888',
        helsb: 'HELSB-999',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        user_id: 4,
        status: 'active',
        registration_number: 'REG213243',
        date_joined: new Date('2025-06-10'),
        designation: 'HR MANAGER',
        employment_type: 'full time',
        department_id: 1,
        salary: 2500000.00,
        supervisor_id: 1,
        bank_name: 'CRDB Bank',
        account_number: '0129832893721',
        nida: '21345678',
        bima: '3289217821',
        nssf: '23823129',
        helsb: '3892637461',
        created_at: new Date('2025-06-16 00:06:26'),
        updated_at: new Date('2025-06-16 00:06:26')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('BasicEmployeeData', null, {});
  }
};
