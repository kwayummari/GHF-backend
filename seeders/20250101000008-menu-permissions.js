module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get menu IDs first
    const menus = await queryInterface.sequelize.query(
      'SELECT id, menu_name FROM Menus ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create permissions for each menu item
    const permissions = [];

    // Admin permissions (full access to everything)
    menus.forEach(menu => {
      permissions.push({
        menu_id: menu.id,
        role: 'admin',
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    // HR Manager permissions
    menus.forEach(menu => {
      const hrManagerPermissions = {
        menu_id: menu.id,
        role: 'hr_manager',
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // HR Manager has full access to these modules
      if (['Employees', 'Leave Management', 'Performance', 'Training', 'Recruitment'].includes(menu.menu_name)) {
        hrManagerPermissions.can_create = true;
        hrManagerPermissions.can_edit = true;
        hrManagerPermissions.can_delete = true;
      }

      permissions.push(hrManagerPermissions);
    });

    // Finance Manager permissions
    menus.forEach(menu => {
      const financeManagerPermissions = {
        menu_id: menu.id,
        role: 'finance_manager',
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Finance Manager has full access to Payroll
      if (menu.menu_name === 'Payroll') {
        financeManagerPermissions.can_create = true;
        financeManagerPermissions.can_edit = true;
        financeManagerPermissions.can_delete = true;
      }

      permissions.push(financeManagerPermissions);
    });

    // Regular user permissions
    menus.forEach(menu => {
      const userPermissions = {
        menu_id: menu.id,
        role: 'user',
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Users can view their own leave and performance
      if (menu.menu_name === 'Leave Management' || menu.menu_name === 'Performance') {
        userPermissions.can_view = true;
      }

      permissions.push(userPermissions);
    });

    await queryInterface.bulkInsert('MenuPermissions', permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MenuPermissions', null, {});
  }
};
