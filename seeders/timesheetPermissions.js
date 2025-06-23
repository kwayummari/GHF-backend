'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Insert timesheet permissions
        const timesheetPermissions = [
            {
                module: 'Timesheet',
                action: 'read',
                description: 'View timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'create',
                description: 'Create timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'update',
                description: 'Update timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'delete',
                description: 'Delete timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'approve',
                description: 'Approve timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'reject',
                description: 'Reject timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'view_team',
                description: 'View team timesheets',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                module: 'Timesheet',
                action: 'export',
                description: 'Export timesheet data',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        await queryInterface.bulkInsert('permissions', timesheetPermissions);

        // Get the inserted permission IDs
        const permissions = await queryInterface.sequelize.query(
            'SELECT id, module, action FROM permissions WHERE module = "Timesheet"',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        // Get role IDs
        const roles = await queryInterface.sequelize.query(
            'SELECT id, role_name FROM roles',
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const adminRole = roles.find(r => r.role_name === 'Admin');
        const hrRole = roles.find(r => r.role_name === 'HR Manager');
        const deptHeadRole = roles.find(r => r.role_name === 'Department Head');
        const employeeRole = roles.find(r => r.role_name === 'Employee');

        // Assign permissions to roles
        const rolePermissions = [];

        // Admin gets all timesheet permissions
        if (adminRole) {
            permissions.forEach(permission => {
                rolePermissions.push({
                    role_id: adminRole.id,
                    permission_id: permission.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            });
        }

        // HR Manager gets all timesheet permissions
        if (hrRole) {
            permissions.forEach(permission => {
                rolePermissions.push({
                    role_id: hrRole.id,
                    permission_id: permission.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            });
        }

        // Department Head gets view, approve, reject, and view team permissions
        if (deptHeadRole) {
            const deptHeadPermissions = permissions.filter(p =>
                ['read', 'approve', 'reject', 'view_team', 'export'].includes(p.action)
            );
            deptHeadPermissions.forEach(permission => {
                rolePermissions.push({
                    role_id: deptHeadRole.id,
                    permission_id: permission.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            });
        }

        // Employee gets read, create, update permissions
        if (employeeRole) {
            const employeePermissions = permissions.filter(p =>
                ['read', 'create', 'update'].includes(p.action)
            );
            employeePermissions.forEach(permission => {
                rolePermissions.push({
                    role_id: employeeRole.id,
                    permission_id: permission.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            });
        }

        if (rolePermissions.length > 0) {
            await queryInterface.bulkInsert('role_permissions', rolePermissions);
        }
    },

    async down(queryInterface, Sequelize) {
        // Remove role permissions for timesheet
        await queryInterface.sequelize.query(
            'DELETE rp FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id WHERE p.module = "Timesheet"'
        );

        // Remove timesheet permissions
        await queryInterface.bulkDelete('permissions', {
            module: 'Timesheet'
        });
    }
};