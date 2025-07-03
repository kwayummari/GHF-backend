module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expense_reports', {
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
      reportDate: {
        type: Sequelize.DATE,
        allowNull: false
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
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected', 'paid'),
        allowNull: false,
        defaultValue: 'draft'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0.00
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      approvedDate: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.createTable('expense_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      expense_report_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'expense_reports',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
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
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      receiptNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
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
      name: 'fk_expense_reports_approver',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('expense_items', {
      fields: ['expense_report_id'],
      type: 'foreign key',
      name: 'fk_expense_items_report',
      references: {
        table: 'expense_reports',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_user');
    await queryInterface.removeConstraint('expense_reports', 'fk_expense_reports_approver');
    await queryInterface.removeConstraint('expense_items', 'fk_expense_items_report');

    // Drop tables
    await queryInterface.dropTable('expense_items');
    await queryInterface.dropTable('expense_reports');
  }
};
