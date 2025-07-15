'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Try to remove the existing index if it exists
      await queryInterface.removeIndex('user_roles', 'unique_user_role');
    } catch (error) {
      // Index doesn't exist, continue
      console.log('Index unique_user_role does not exist, continuing...');
    }

    try {
      // Add the index
      await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], {
        unique: true,
        name: 'unique_user_role'
      });
    } catch (error) {
      console.log('Index unique_user_role already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('user_roles', 'unique_user_role');
  }
};