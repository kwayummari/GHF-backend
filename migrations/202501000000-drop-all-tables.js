module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all tables
    const tables = await queryInterface.sequelize.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ' +
      'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME != "SequelizeMeta"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Drop tables in reverse order of dependencies
    for (const table of tables) {
      await queryInterface.dropTable(table.TABLE_NAME);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No need to recreate tables as they will be recreated in subsequent migrations
  }
};
