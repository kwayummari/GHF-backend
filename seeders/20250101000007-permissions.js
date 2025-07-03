module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Core permissions
    await queryInterface.bulkInsert('permissions', [
      // User management
      {
        name: 'Manage Users',
        module: 'Users',
        action: 'create',
        description: 'Can create new users',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Users',
        module: 'Users',
        action: 'read',
        description: 'Can view user information',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Users',
        module: 'Users',
        action: 'update',
        description: 'Can update user information',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Users',
        module: 'Users',
        action: 'delete',
        description: 'Can delete users',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },

      // Department management
      {
        name: 'Manage Departments',
        module: 'Departments',
        action: 'create',
        description: 'Can create departments',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Departments',
        module: 'Departments',
        action: 'read',
        description: 'Can view departments',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Departments',
        module: 'Departments',
        action: 'update',
        description: 'Can update departments',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Departments',
        module: 'Departments',
        action: 'delete',
        description: 'Can delete departments',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },

      // Role management
      {
        name: 'Manage Roles',
        module: 'Roles',
        action: 'create',
        description: 'Can create roles',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Roles',
        module: 'Roles',
        action: 'read',
        description: 'Can view roles',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Roles',
        module: 'Roles',
        action: 'update',
        description: 'Can update roles',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      },
      {
        name: 'Manage Roles',
        module: 'Roles',
        action: 'delete',
        description: 'Can delete roles',
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
        updated_by: 1
      }
    ], {});

    // Assign permissions to admin role
    const adminPermissions = [
      {
        role_id: 1, // admin
        permission_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 9,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 11,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role_id: 1,
        permission_id: 12,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('role_permissions', adminPermissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
