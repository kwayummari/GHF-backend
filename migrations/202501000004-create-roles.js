module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add initial roles with timestamps
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { name: 'admin', description: 'Full system access', createdAt: now, updatedAt: now },
      { name: 'manager', description: 'Department management', createdAt: now, updatedAt: now },
      { name: 'employee', description: 'Basic user access', createdAt: now, updatedAt: now },
      { name: 'hr', description: 'Human Resources access', createdAt: now, updatedAt: now },
      { name: 'finance', description: 'Finance department access', createdAt: now, updatedAt: now }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roles');
  }
};
