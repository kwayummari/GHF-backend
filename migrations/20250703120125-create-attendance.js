module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendance', {
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
      arrival_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      departure_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scheduler_status: {
        type: Sequelize.ENUM('working day', 'weekend', 'holiday in working day', 'holiday in weekend'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('absent', 'present', 'on leave', 'half day'),
        allowNull: false,
        defaultValue: 'absent'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      activity: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approval_status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      submitted_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      supervisor_comments: {
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
    await queryInterface.dropTable('attendance');
  }
};
