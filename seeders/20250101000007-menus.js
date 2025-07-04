module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Menus', [
      // Main menu items
      {
        menu_name: 'Dashboard',
        menu_label: 'Dashboard',
        menu_icon: 'dashboard',
        menu_url: '/dashboard',
        menu_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Employees',
        menu_label: 'Employees',
        menu_icon: 'people',
        menu_url: '/employees',
        menu_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Leave Management',
        menu_label: 'Leave Management',
        menu_icon: 'calendar',
        menu_url: '/leave',
        menu_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Performance',
        menu_label: 'Performance',
        menu_icon: 'assessment',
        menu_url: '/performance',
        menu_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Training',
        menu_label: 'Training',
        menu_icon: 'school',
        menu_url: '/training',
        menu_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Recruitment',
        menu_label: 'Recruitment',
        menu_icon: 'work',
        menu_url: '/recruitment',
        menu_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Payroll',
        menu_label: 'Payroll',
        menu_icon: 'attach_money',
        menu_url: '/payroll',
        menu_order: 7,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Reports',
        menu_label: 'Reports',
        menu_icon: 'pie_chart',
        menu_url: '/reports',
        menu_order: 8,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_name: 'Settings',
        menu_label: 'Settings',
        menu_icon: 'settings',
        menu_url: '/settings',
        menu_order: 9,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Menus', null, {});
  }
};
