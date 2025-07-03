module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign keys to bio_data
    await queryInterface.addConstraint('bio_data', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_bio_data_user_id',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign keys to basic_employee_data
    await queryInterface.addConstraint('basic_employee_data', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_basic_employee_data_user_id',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('basic_employee_data', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_basic_employee_data_department_id',
      references: { table: 'departments', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('basic_employee_data', {
      fields: ['supervisor_id'],
      type: 'foreign key',
      name: 'fk_basic_employee_data_supervisor_id',
      references: { table: 'users', field: 'id' },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Add foreign keys to emergency_contacts
    await queryInterface.addConstraint('emergency_contacts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_emergency_contacts_user_id',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign keys to bank_accounts
    await queryInterface.addConstraint('bank_accounts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_bank_accounts_user_id',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign keys in reverse order
    await queryInterface.removeConstraint('bank_accounts', 'bank_accounts_user_id_fkey');
    await queryInterface.removeConstraint('emergency_contacts', 'emergency_contacts_user_id_fkey');
    await queryInterface.removeConstraint('basic_employee_data', 'basic_employee_data_supervisor_id_fkey');
    await queryInterface.removeConstraint('basic_employee_data', 'basic_employee_data_department_id_fkey');
    await queryInterface.removeConstraint('basic_employee_data', 'basic_employee_data_user_id_fkey');
    await queryInterface.removeConstraint('bio_data', 'bio_data_user_id_fkey');
  }
};
