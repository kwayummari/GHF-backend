module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('quarters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      quarter_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 4
        }
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'closed'),
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

    await queryInterface.addConstraint('quarters', {
      fields: ['year', 'quarter_number'],
      type: 'unique',
      name: 'unique_quarter_year_number'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('quarters', 'unique_quarter_year_number');
    await queryInterface.dropTable('quarters');
  }
};
