module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create payroll_components table
    await queryInterface.createTable('payroll_components', {
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
        type: Sequelize.ENUM('basic_salary', 'allowance', 'deduction', 'bonus'),
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

    // Create employee_payroll_components table
    await queryInterface.createTable('employee_payroll_components', {
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
      payroll_component_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payroll_components',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      effectiveDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
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

    // Create payroll_periods table
    await queryInterface.createTable('payroll_periods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      periodStart: {
        type: Sequelize.DATE,
        allowNull: false
      },
      periodEnd: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open'
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

    // Create payroll_entries table
    await queryInterface.createTable('payroll_entries', {
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
      payroll_period_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payroll_periods',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      grossSalary: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      netSalary: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processed', 'paid'),
        allowNull: false,
        defaultValue: 'pending'
      },
      paymentDate: {
        type: Sequelize.DATE,
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

    // Create payroll_entry_details table
    await queryInterface.createTable('payroll_entry_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payroll_entry_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payroll_entries',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      payroll_component_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payroll_components',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
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

    // Add foreign key constraints
    await queryInterface.addConstraint('employee_payroll_components', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_employee_payroll_components_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('employee_payroll_components', {
      fields: ['payroll_component_id'],
      type: 'foreign key',
      name: 'fk_employee_payroll_components_component',
      references: {
        table: 'payroll_components',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payroll_entries', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_payroll_entries_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payroll_entries', {
      fields: ['payroll_period_id'],
      type: 'foreign key',
      name: 'fk_payroll_entries_period',
      references: {
        table: 'payroll_periods',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payroll_entry_details', {
      fields: ['payroll_entry_id'],
      type: 'foreign key',
      name: 'fk_payroll_entry_details_entry',
      references: {
        table: 'payroll_entries',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('payroll_entry_details', {
      fields: ['payroll_component_id'],
      type: 'foreign key',
      name: 'fk_payroll_entry_details_component',
      references: {
        table: 'payroll_components',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('employee_payroll_components', 'fk_employee_payroll_components_user');
    await queryInterface.removeConstraint('employee_payroll_components', 'fk_employee_payroll_components_component');
    await queryInterface.removeConstraint('payroll_entries', 'fk_payroll_entries_user');
    await queryInterface.removeConstraint('payroll_entries', 'fk_payroll_entries_period');
    await queryInterface.removeConstraint('payroll_entry_details', 'fk_payroll_entry_details_entry');
    await queryInterface.removeConstraint('payroll_entry_details', 'fk_payroll_entry_details_component');

    // Drop tables in reverse order
    await queryInterface.dropTable('payroll_entry_details');
    await queryInterface.dropTable('payroll_entries');
    await queryInterface.dropTable('payroll_periods');
    await queryInterface.dropTable('employee_payroll_components');
    await queryInterface.dropTable('payroll_components');
  }
};
