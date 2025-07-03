module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('permissions', {
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

    // Add initial permissions with timestamps
    const now = new Date();
    await queryInterface.bulkInsert('permissions', [
      { name: 'view_dashboard', description: 'Can view dashboard', createdAt: now, updatedAt: now },
      { name: 'manage_users', description: 'Can manage users', createdAt: now, updatedAt: now },
      { name: 'manage_departments', description: 'Can manage departments', createdAt: now, updatedAt: now },
      { name: 'manage_roles', description: 'Can manage roles', createdAt: now, updatedAt: now },
      { name: 'manage_permissions', description: 'Can manage permissions', createdAt: now, updatedAt: now }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('permissions');
  }
};
