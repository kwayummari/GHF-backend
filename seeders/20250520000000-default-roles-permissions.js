'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create default roles
    await queryInterface.bulkInsert('roles', [
      {
        role_name: 'Admin',
        description: 'System administrator with full access',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'HR Manager',
        description: 'Human resources manager',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'Finance Manager',
        description: 'Finance department manager',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'Department Head',
        description: 'Head of a department',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'Employee',
        description: 'Regular employee',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    // Create default permissions
    await queryInterface.bulkInsert('permissions', [
      // User module permissions
      {
        name: 'View Users',
        module: 'Users',
        action: 'read',
        description: 'Can view user list',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Create User',
        module: 'Users',
        action: 'create',
        description: 'Can create new users',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Edit User',
        module: 'Users',
        action: 'update',
        description: 'Can edit user information',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Delete User',
        module: 'Users',
        action: 'delete',
        description: 'Can delete users',
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // Department module permissions
      {
        name: 'View Departments',
        module: 'Departments',
        action: 'read',
        description: 'Can view departments',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Create Department',
        module: 'Departments',
        action: 'create',
        description: 'Can create departments',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Edit Department',
        module: 'Departments',
        action: 'update',
        description: 'Can edit departments',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Delete Department',
        module: 'Departments',
        action: 'delete',
        description: 'Can delete departments',
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // Leave module permissions
      {
        name: 'View Leaves',
        module: 'Leaves',
        action: 'read',
        description: 'Can view leave applications',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Create Leave',
        module: 'Leaves',
        action: 'create',
        description: 'Can create leave applications',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Approve Leaves',
        module: 'Leaves',
        action: 'update',
        description: 'Can approve leave applications',
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // Attendance module permissions
      {
        name: 'View Attendance',
        module: 'Attendance',
        action: 'read',
        description: 'Can view attendance records',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Edit Attendance',
        module: 'Attendance',
        action: 'update',
        description: 'Can edit attendance records',
        created_at: new Date(),
        updated_at: new Date(),
      },
      
      // Document module permissions
      {
        name: 'View Documents',
        module: 'Documents',
        action: 'read',
        description: 'Can view documents',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Upload Documents',
        module: 'Documents',
        action: 'create',
        description: 'Can upload documents',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Edit Documents',
        module: 'Documents',
        action: 'update',
        description: 'Can edit document details',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Delete Documents',
        module: 'Documents',
        action: 'delete',
        description: 'Can delete documents',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    // Get role IDs
    const roles = await queryInterface.sequelize.query(
      'SELECT id, role_name FROM roles',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Get permission IDs
    const permissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Map roles and permissions
    const adminRole = roles.find(role => role.role_name === 'Admin');
    const hrRole = roles.find(role => role.role_name === 'HR Manager');
    const financeRole = roles.find(role => role.role_name === 'Finance Manager');
    const deptHeadRole = roles.find(role => role.role_name === 'Department Head');
    const employeeRole = roles.find(role => role.role_name === 'Employee');
    
    // Assign all permissions to Admin role
    const rolePermissions = [];
    
    // Admin gets all permissions
    permissions.forEach(permission => {
      rolePermissions.push({
        role_id: adminRole.id,
        permission_id: permission.id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
    
    // HR Manager permissions
    const hrPermissions = [
      'View Users', 'Create User', 'Edit User',
      'View Departments', 'Create Department', 'Edit Department',
      'View Leaves', 'Approve Leaves',
      'View Attendance', 'Edit Attendance',
      'View Documents', 'Upload Documents', 'Edit Documents'
    ];
    
    hrPermissions.forEach(permName => {
      const permission = permissions.find(p => p.name === permName);
      if (permission) {
        rolePermissions.push({
          role_id: hrRole.id,
          permission_id: permission.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
    
    // Department Head permissions
    const deptHeadPermissions = [
      'View Users',
      'View Departments',
      'View Leaves', 'Approve Leaves',
      'View Attendance',
      'View Documents', 'Upload Documents'
    ];
    
    deptHeadPermissions.forEach(permName => {
      const permission = permissions.find(p => p.name === permName);
      if (permission) {
        rolePermissions.push({
          role_id: deptHeadRole.id,
          permission_id: permission.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
    
    // Finance Manager permissions
    const financePermissions = [
      'View Users',
      'View Departments',
      'View Attendance',
      'View Documents', 'Upload Documents'
    ];
    
    financePermissions.forEach(permName => {
      const permission = permissions.find(p => p.name === permName);
      if (permission) {
        rolePermissions.push({
          role_id: financeRole.id,
          permission_id: permission.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
    
    // Employee permissions
    const employeePermissions = [
      'View Leaves', 'Create Leave',
      'View Attendance',
      'View Documents', 'Upload Documents'
    ];
    
    employeePermissions.forEach(permName => {
      const permission = permissions.find(p => p.name === permName);
      if (permission) {
        rolePermissions.push({
          role_id: employeeRole.id,
          permission_id: permission.id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });
    
    // Insert role permissions
    await queryInterface.bulkInsert('role_permissions', rolePermissions, {});
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Admin',
        middle_name: null,
        sur_name: 'User',
        email: 'admin@ghf.com',
        phone_number: '+255123456789',
        gender: 'Male',
        password: hashedPassword,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
    
    // Get admin user ID
    const [adminUser] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = "admin@ghf.com"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Assign admin role to admin user
    await queryInterface.bulkInsert('user_roles', [
      {
        user_id: adminUser.id,
        role_id: adminRole.id,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
    
    // Insert default leave types
    await queryInterface.bulkInsert('leave_types', [
      {
        name: 'Annual Leave',
        minimum_days: 1,
        maximum_days: 28,
        description: 'Regular annual leave',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Sick Leave',
        minimum_days: 1,
        maximum_days: 30,
        description: 'Leave due to illness with medical certificate required for more than 2 days',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Maternity Leave',
        minimum_days: 84,
        maximum_days: 84,
        description: 'Leave for female employees for childbirth',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Paternity Leave',
        minimum_days: 3,
        maximum_days: 3,
        description: 'Leave for male employees when their spouse gives birth',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Compassionate Leave',
        minimum_days: 1,
        maximum_days: 5,
        description: 'Leave due to death or serious illness of a family member',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
    
    // Insert default work schedule
    await queryInterface.bulkInsert('work_scheduler', [
      {
        day_of_week: 'Monday',
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        day_of_week: 'Tuesday',
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        day_of_week: 'Wednesday',
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        day_of_week: 'Thursday',
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        day_of_week: 'Friday',
        start_time: '08:00:00',
        end_time: '17:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Delete data in reverse order
    await queryInterface.bulkDelete('work_scheduler', null, {});
    await queryInterface.bulkDelete('leave_types', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};