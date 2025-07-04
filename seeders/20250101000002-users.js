module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        first_name: 'Alice',
        last_name: 'Smith',
        role: 'admin',
        is_active: true,
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        id: 2,
        username: 'bob',
        email: 'bob@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        first_name: 'Bob',
        last_name: 'Johnson',
        role: 'user',
        is_active: true,
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        id: 3,
        username: 'charlie',
        email: 'charlie@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        first_name: 'Charlie',
        last_name: 'Brown',
        role: 'user',
        is_active: true,
        created_at: new Date('2025-06-13 19:05:21'),
        updated_at: new Date('2025-06-13 19:05:21')
      },
      {
        id: 4,
        username: 'hrmanager',
        email: 'hrmanager@example.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        first_name: 'HR',
        last_name: 'Manager',
        role: 'hr_manager',
        is_active: true,
        created_at: new Date('2025-06-16 00:06:26'),
        updated_at: new Date('2025-06-16 00:06:26')
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
