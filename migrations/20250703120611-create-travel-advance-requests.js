module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('travel_advance_requests', {
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
      purpose: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      estimated_cost: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      submitted_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('travel_advance_requests');
  }
};
