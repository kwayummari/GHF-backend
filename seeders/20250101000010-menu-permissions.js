module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get menu IDs and permission IDs
    const menus = await queryInterface.sequelize.query(
      'SELECT id, menu_name FROM Menus ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const permissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM Permissions ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Map permission names to IDs for easier lookup
    const permissionMap = {};
    permissions.forEach(p => {
      permissionMap[p.name] = p.id;
    });

    // Create menu permissions
    const menuPermissions = [];

    // Admin permissions (full access to everything)
    menus.forEach(menu => {
      // Add all permissions for admin
      Object.keys(permissionMap).forEach(permissionName => {
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap[permissionName],
          created_at: new Date()
        });
      });
    });

    // HR Manager permissions
    menus.forEach(menu => {
      const hrManagerPermissions = [];

      // HR Manager has full access to these modules
      if (['Employees', 'Leave Management', 'Performance', 'Training', 'Recruitment'].includes(menu.menu_name)) {
        hrManagerPermissions.push(
          'manage_employees',
          'create_employee',
          'edit_employee',
          'delete_employee',
          'manage_leave',
          'create_leave',
          'approve_leave',
          'manage_performance',
          'create_performance',
          'approve_performance',
          'manage_training',
          'create_training',
          'approve_training',
          'manage_recruitment',
          'create_recruitment',
          'approve_recruitment'
        );
      } else {
        // Basic view permissions for other modules
        hrManagerPermissions.push(
          'view_dashboard',
          'view_reports'
        );
      }

      hrManagerPermissions.forEach(permissionName => {
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap[permissionName],
          created_at: new Date()
        });
      });
    });

    // Finance Manager permissions
    menus.forEach(menu => {
      if (menu.menu_name === 'Payroll') {
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['manage_payroll'],
          created_at: new Date()
        });
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['create_payroll'],
          created_at: new Date()
        });
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['approve_payroll'],
          created_at: new Date()
        });
      } else {
        // Basic view permissions for other modules
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['view_dashboard'],
          created_at: new Date()
        });
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['view_reports'],
          created_at: new Date()
        });
      }
    });

    // Regular user permissions
    menus.forEach(menu => {
      // Users can view their own leave and performance
      if (menu.menu_name === 'Leave Management' || menu.menu_name === 'Performance') {
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['view_dashboard'],
          created_at: new Date()
        });
      } else {
        // Basic view permissions for other modules
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['view_dashboard'],
          created_at: new Date()
        });
        menuPermissions.push({
          menu_id: menu.id,
          permission_id: permissionMap['view_reports'],
          created_at: new Date()
        });
      }
    });

    await queryInterface.bulkInsert('MenuPermissions', menuPermissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MenuPermissions', null, {});
  }
};
