module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payroll', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payroll_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
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
      period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      basic_salary: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      gross_salary: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      net_salary: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'processed', 'paid'),
        allowNull: false,
        defaultValue: 'draft'
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
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

    await queryInterface.addConstraint('payroll', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_payroll_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payroll', {
      fields: ['processed_by'],
      type: 'foreign key',
      name: 'fk_payroll_processed_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Add unique constraint for payroll_number
    await queryInterface.addConstraint('payroll', {
      fields: ['payroll_number'],
      type: 'unique',
      name: 'unique_payroll_number'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('payroll', 'fk_payroll_user');
    await queryInterface.removeConstraint('payroll', 'fk_payroll_processed_by');
    await queryInterface.removeConstraint('payroll', 'unique_payroll_number');
    await queryInterface.dropTable('payroll');
  }
};
