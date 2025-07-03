module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bank_accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bank_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      account_number: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      account_type: {
        type: Sequelize.ENUM('savings', 'current', 'salary', 'investment'),
        allowNull: false,
        defaultValue: 'salary'
      },
      branch_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      swift_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      iban: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      account_holder_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('bank_accounts');
  }
};
