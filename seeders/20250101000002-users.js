module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        status: 'active',
        department_id: 1, // Administration
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'hr_manager',
        email: 'hr@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        first_name: 'HR',
        last_name: 'Manager',
        role: 'hr_manager',
        status: 'active',
        department_id: 3, // Human Resources
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'finance_manager',
        email: 'finance@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        first_name: 'Finance',
        last_name: 'Manager',
        role: 'finance_manager',
        status: 'active',
        department_id: 2, // Finance
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'it_manager',
        email: 'it@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        first_name: 'IT',
        last_name: 'Manager',
        role: 'it_manager',
        status: 'active',
        department_id: 4, // Information Technology
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
