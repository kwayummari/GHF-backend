module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('basic_employee_data', [
      {
        user_id: 1, // admin
        employee_number: 'EMP0001',
        first_name: 'System',
        last_name: 'Administrator',
        gender: 'other',
        date_of_birth: new Date('1990-01-01'),
        phone_number: '+255712345678',
        address: 'System Admin Office',
        nationality: 'Tanzania',
        marital_status: 'single',
        employment_status: 'active',
        employment_type: 'permanent',
        date_joined: new Date('2024-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2, // hr_manager
        employee_number: 'EMP0002',
        first_name: 'HR',
        last_name: 'Manager',
        gender: 'other',
        date_of_birth: new Date('1985-01-01'),
        phone_number: '+255712345679',
        address: 'HR Department',
        nationality: 'Tanzania',
        marital_status: 'married',
        employment_status: 'active',
        employment_type: 'permanent',
        date_joined: new Date('2024-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3, // finance_manager
        employee_number: 'EMP0003',
        first_name: 'Finance',
        last_name: 'Manager',
        gender: 'other',
        date_of_birth: new Date('1980-01-01'),
        phone_number: '+255712345680',
        address: 'Finance Department',
        nationality: 'Tanzania',
        marital_status: 'married',
        employment_status: 'active',
        employment_type: 'permanent',
        date_joined: new Date('2024-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 4, // it_manager
        employee_number: 'EMP0004',
        first_name: 'IT',
        last_name: 'Manager',
        gender: 'other',
        date_of_birth: new Date('1985-01-01'),
        phone_number: '+255712345681',
        address: 'IT Department',
        nationality: 'Tanzania',
        marital_status: 'single',
        employment_status: 'active',
        employment_type: 'permanent',
        date_joined: new Date('2024-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('basic_employee_data', null, {});
  }
};
