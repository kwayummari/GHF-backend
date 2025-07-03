module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      asset_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      asset_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      asset_tag: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      subcategory: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance', 'disposed', 'lost'),
        allowNull: false,
        defaultValue: 'active'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      custodian_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      purchase_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      purchase_cost: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true
      },
      current_value: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      warranty_expiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      serial_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      manufacturer: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('assets');
  }
};
