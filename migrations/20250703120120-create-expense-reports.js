module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expense_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      travel_advance_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      expense_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      receipt_document_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      expense_amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected', 'paid'),
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
    await queryInterface.dropTable('expense_reports');
  }
};
