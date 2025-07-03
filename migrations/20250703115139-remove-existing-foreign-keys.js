module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing foreign key constraints
    await queryInterface.removeConstraint('bio_data', 'fk_bio_data_user_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the foreign key constraint
    await queryInterface.addConstraint('bio_data', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'bio_data_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  }
};
