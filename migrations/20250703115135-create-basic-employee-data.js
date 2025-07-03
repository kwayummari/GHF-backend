module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('basic_employee_data', {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'on leave', 'terminated'),
        allowNull: false,
        defaultValue: 'active'
      },
      registration_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      date_joined: {
        type: Sequelize.DATE,
        allowNull: false
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      employment_type: {
        type: Sequelize.ENUM('full time', 'contract', 'intern', 'part time', 'volunteer'),
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      supervisor_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      account_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      nida: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      bima: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      nssf: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      helsb: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      signature: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('basic_employee_data');
  }
};
