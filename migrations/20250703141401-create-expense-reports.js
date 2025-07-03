module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop dependent tables first
    try {
      await queryInterface.dropTable('expense_items');
      console.log('Dropped existing expense_items table');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('doesn\'t exist')) {
        console.log('expense_items table not found, continuing...');
      } else {
        throw error;
      }
    }

    // Drop main table
    try {
      await queryInterface.dropTable('expense_reports');
      console.log('Dropped existing expense_reports table');
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('doesn\'t exist')) {
        console.log('expense_reports table not found, continuing...');
      } else {
        throw error;
      }
    }

    await queryInterface.createTable('expense_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      report_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      budget_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      total_amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected', 'paid'),
        allowNull: false,
        defaultValue: 'draft'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paid_at: {
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

    // Remove existing constraints first
    const constraintsToRemove = [
      'fk_expense_reports_user',
      'fk_expense_reports_department',
      'fk_expense_reports_budget',
      'fk_expense_reports_approved_by',
      'unique_expense_report_number',
      'expense_reports_ibfk_1',
      'expense_reports_ibfk_2',
      'expense_reports_ibfk_3',
      'expense_reports_ibfk_4',
      'expense_reports_ibfk_5',
      'fk_expense_reports_approver'
    ];

    for (const constraint of constraintsToRemove) {
      try {
        await queryInterface.removeConstraint('expense_reports', constraint);
        console.log(`Removed constraint: ${constraint}`);
      } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('doesn\'t exist')) {
          console.log(`Constraint ${constraint} not found, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Add new foreign key constraints
    await queryInterface.addConstraint('expense_reports', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['budget_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_budget',
      references: {
        table: 'budgets',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add foreign key constraints for existing columns
    await queryInterface.addConstraint('expense_reports', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_expense_reports_approved_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Add new foreign key constraints
    await queryInterface.addConstraint('expense_reports', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_reports', {
      fields: ['budget_id'],
      type: 'foreign key',
      name: 'fk_expense_reports_budget',
      references: {
        table: 'budgets',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint
    try {
      await queryInterface.addConstraint('expense_reports', {
        fields: ['report_number'],
        type: 'unique',
        name: 'unique_expense_report_number'
      });
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
        console.log('Unique constraint on report_number already exists, skipping...');
      } else {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop table directly since we're handling constraints in up migration
    await queryInterface.dropTable('expense_reports');
  }
};
