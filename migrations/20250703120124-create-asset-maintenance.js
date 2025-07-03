module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('asset_maintenance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      maintenance_number: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      asset_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      maintenance_type: {
        type: Sequelize.ENUM('preventive', 'corrective', 'emergency'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      completed_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      estimated_duration: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      actual_duration: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      estimated_cost: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true
      },
      actual_cost: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true
      },
      assigned_to: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      vendor_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      maintenance_category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      completion_percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      completion_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      completed_by: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('asset_maintenance');
  }
};
