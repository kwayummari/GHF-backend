module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendance_records', {
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
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      check_in: {
        type: Sequelize.TIME,
        allowNull: true
      },
      check_out: {
        type: Sequelize.TIME,
        allowNull: true
      },
      total_hours: {
        type: Sequelize.DECIMAL(4,2),
        allowNull: true
      },
      overtime_hours: {
        type: Sequelize.DECIMAL(4,2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'half_day', 'leave', 'sick'),
        allowNull: false,
        defaultValue: 'present'
      },
      notes: {
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
    await queryInterface.dropTable('attendance_records');
  }
};
