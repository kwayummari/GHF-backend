module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key constraint for users.department_id
    await queryInterface.addConstraint('users', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_users_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('users', 'fk_users_department');
  }
};
