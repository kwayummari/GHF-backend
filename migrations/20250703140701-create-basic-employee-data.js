module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('basic_employee_data', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      employee_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: false
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      marital_status: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: false
      },
      nationality: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      identification_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      identification_type: {
        type: Sequelize.ENUM('national_id', 'passport', 'other'),
        allowNull: false
      },
      emergency_contact_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
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

    await queryInterface.addConstraint('basic_employee_data', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_basic_employee_data_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('basic_employee_data', 'fk_basic_employee_data_user');
    await queryInterface.dropTable('basic_employee_data');
  }
};
