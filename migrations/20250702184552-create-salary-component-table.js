module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('salary_components', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('basic', 'allowance', 'deduction', 'bonus'),
        allowNull: false
      },
      isFixed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
      },
      calculationMethod: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add initial salary components
    await queryInterface.bulkInsert('salary_components', [
      { 
        name: 'Basic Salary', 
        type: 'basic',
        isFixed: true,
        description: 'Base salary component',
        isActive: true
      },
      { 
        name: 'Transport Allowance', 
        type: 'allowance',
        isFixed: true,
        description: 'Monthly transport allowance',
        isActive: true
      },
      { 
        name: 'Medical Allowance', 
        type: 'allowance',
        isFixed: true,
        description: 'Monthly medical allowance',
        isActive: true
      },
      { 
        name: 'Tax', 
        type: 'deduction',
        isFixed: false,
        calculationMethod: 'percentage',
        description: 'Income tax deduction',
        isActive: true
      },
      { 
        name: 'Social Security', 
        type: 'deduction',
        isFixed: false,
        calculationMethod: 'percentage',
        description: 'Social security contribution',
        isActive: true
      },
      { 
        name: 'Performance Bonus', 
        type: 'bonus',
        isFixed: false,
        calculationMethod: 'percentage',
        description: 'Performance-based bonus',
        isActive: true
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('salary_components');
  }
};
