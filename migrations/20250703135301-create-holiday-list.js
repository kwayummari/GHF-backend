module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('holiday_list', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('public', 'company'),
        allowNull: false,
        defaultValue: 'public'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });

    // Add unique constraint on date
    await queryInterface.addConstraint('holiday_list', {
      fields: ['date'],
      type: 'unique',
      name: 'unique_holiday_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove unique constraint
    await queryInterface.removeConstraint('holiday_list', 'unique_holiday_date');

    // Drop table
    await queryInterface.dropTable('holiday_list');
  }
};
