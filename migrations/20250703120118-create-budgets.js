module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('budgets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quarter_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      activity_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      responsible_person_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('budgets');
  }
};
