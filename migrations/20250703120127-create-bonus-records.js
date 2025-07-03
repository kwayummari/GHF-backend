module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bonus_records', {
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
      bonus_type: {
        type: Sequelize.ENUM('performance', 'annual', 'festival', 'retention', 'referral', 'other'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      percentage: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: true
      },
      pay_period: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'YYYY-MM format'
      },
      is_taxable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'paid'),
        allowNull: false,
        defaultValue: 'pending'
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
    await queryInterface.dropTable('bonus_records');
  }
};
