module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign keys to loans table
    await queryInterface.addConstraint('loans', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'loans_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('loans', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'loans_approved_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('loans', {
      fields: ['disbursed_by'],
      type: 'foreign key',
      name: 'loans_disbursed_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Add foreign keys to loan_installments table
    await queryInterface.addConstraint('loan_installments', {
      fields: ['loan_id'],
      type: 'foreign key',
      name: 'loan_installments_loan_id_fkey',
      references: { table: 'loans', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('loan_installments', {
      fields: ['payroll_id'],
      type: 'foreign key',
      name: 'loan_installments_payroll_id_fkey',
      references: { table: 'payrolls', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign keys
    await queryInterface.removeConstraint('loan_installments', 'loan_installments_loan_id_fkey');
    await queryInterface.removeConstraint('loan_installments', 'loan_installments_payroll_id_fkey');
    await queryInterface.removeConstraint('loans', 'loans_user_id_fkey');
    await queryInterface.removeConstraint('loans', 'loans_approved_by_fkey');
    await queryInterface.removeConstraint('loans', 'loans_disbursed_by_fkey');
  }
};
