module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('BioData', [
      {
        user_id: 1,
        fingerprint_id: 'FINGER001',
        signature: 'alice_signature_base64',
        marital_status: 'married',
        national_id: 'NATID-001',
        dob: new Date('1985-05-10'),
        blood_group: 'O+',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-15 22:39:20')
      },
      {
        user_id: 2,
        fingerprint_id: 'FINGER002',
        signature: 'bob_signature_base64',
        marital_status: 'single',
        national_id: 'NATID-002',
        dob: new Date('1990-11-22'),
        blood_group: 'B-',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        user_id: 3,
        fingerprint_id: 'FINGER003',
        signature: 'charlie_signature_base64',
        marital_status: 'divorced',
        national_id: 'NATID-003',
        dob: new Date('1978-01-01'),
        blood_group: 'O+',
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        user_id: 4,
        fingerprint_id: '34567898765',
        signature: '',
        marital_status: 'single',
        national_id: '12345678987654456',
        dob: new Date('2001-06-20'),
        blood_group: 'O+',
        created_at: new Date('2025-06-16 00:06:26'),
        updated_at: new Date('2025-06-16 00:06:26')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('BioData', null, {});
  }
};
