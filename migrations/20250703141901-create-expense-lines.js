module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expense_lines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
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

    // Add some default expense categories
    const now = new Date();
    await queryInterface.bulkInsert('expense_lines', [
      {
        category: 'Transport',
        description: 'Transportation expenses',
        amount: 0.00,
        status: 'active',
        createdAt: now,
        updatedAt: now
      },
      {
        category: 'Accommodation',
        description: 'Hotel and accommodation expenses',
        amount: 0.00,
        status: 'active',
        createdAt: now,
        updatedAt: now
      },
      {
        category: 'Meals',
        description: 'Food and beverage expenses',
        amount: 0.00,
        status: 'active',
        createdAt: now,
        updatedAt: now
      },
      {
        category: 'Miscellaneous',
        description: 'Other expenses',
        amount: 0.00,
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('expense_lines');
  }
}
