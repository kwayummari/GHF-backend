module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bio_data', {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fingerprint_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      marital_status: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: false
      },
      national_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: false
      },
      blood_group: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bio_data');
  }
};
