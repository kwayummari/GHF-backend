module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign keys to departments
    await queryInterface.addConstraint('departments', {
      fields: ['manager_id'],
      type: 'foreign key',
      name: 'departments_manager_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Add foreign keys to bio_data
    await queryInterface.addConstraint('bio_data', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'bio_data_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign keys to role_permissions
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'role_permissions_role_id_fkey',
      references: { table: 'roles', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('role_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'role_permissions_permission_id_fkey',
      references: { table: 'permissions', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign keys to user_permissions
    await queryInterface.addConstraint('user_permissions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'user_permissions_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('user_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'user_permissions_permission_id_fkey',
      references: { table: 'permissions', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign keys to permissions
    await queryInterface.addConstraint('permissions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'permissions_created_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('permissions', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'permissions_updated_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign keys in reverse order
    await queryInterface.removeConstraint('permissions', 'permissions_updated_by_fkey');
    await queryInterface.removeConstraint('permissions', 'permissions_created_by_fkey');

    await queryInterface.removeConstraint('user_permissions', 'user_permissions_permission_id_fkey');
    await queryInterface.removeConstraint('user_permissions', 'user_permissions_user_id_fkey');

    await queryInterface.removeConstraint('role_permissions', 'role_permissions_permission_id_fkey');
    await queryInterface.removeConstraint('role_permissions', 'role_permissions_role_id_fkey');

    await queryInterface.removeConstraint('bio_data', 'bio_data_user_id_fkey');

    await queryInterface.removeConstraint('departments', 'departments_manager_id_fkey');
  }
};
