module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign keys to salary_components
    await queryInterface.addConstraint('salary_components', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'salary_components_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign keys to payrolls
    await queryInterface.addConstraint('payrolls', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'payrolls_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payrolls', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'payrolls_approved_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payrolls', {
      fields: ['paid_by'],
      type: 'foreign key',
      name: 'payrolls_paid_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign keys
    await queryInterface.removeConstraint('payrolls', 'payrolls_paid_by_fkey');
    await queryInterface.removeConstraint('payrolls', 'payrolls_approved_by_fkey');
    await queryInterface.removeConstraint('payrolls', 'payrolls_user_id_fkey');
    await queryInterface.removeConstraint('salary_components', 'salary_components_user_id_fkey');
  }
};
