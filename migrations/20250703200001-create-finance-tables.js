module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create petty cash books table
    await queryInterface.createTable('petty_cash_books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      book_number: {
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
      opening_balance: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
        defaultValue: 0.00
      },
      current_balance: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'closed'),
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

    // Add foreign key constraints for petty cash books
    await queryInterface.addConstraint('petty_cash_books', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_books_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('petty_cash_books', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_books_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Create petty cash transactions table
    await queryInterface.createTable('petty_cash_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      petty_cash_book_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.ENUM('debit', 'credit'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      reference_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_at: {
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

    // Add foreign key constraints for petty cash transactions
    await queryInterface.addConstraint('petty_cash_transactions', {
      fields: ['petty_cash_book_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_transactions_petty_cash_book',
      references: {
        table: 'petty_cash_books',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('petty_cash_transactions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_transactions_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('petty_cash_transactions', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_petty_cash_transactions_approved_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Create travel advance requests table
    await queryInterface.createTable('travel_advance_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      request_number: {
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
      purpose: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      departure_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      return_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      total_cost: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rejection_reason: {
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

    // Add foreign key constraints for travel advance requests
    await queryInterface.addConstraint('travel_advance_requests', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_travel_advance_requests_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('travel_advance_requests', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_travel_advance_requests_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('travel_advance_requests', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_travel_advance_requests_approved_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('travel_advance_requests', {
      fields: ['rejected_by'],
      type: 'foreign key',
      name: 'fk_travel_advance_requests_rejected_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    // Create expense lines table
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

    // Insert default expense categories
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

    // Create travel advance expenses table
    await queryInterface.createTable('travel_advance_expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      travel_advance_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      expense_line_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      receipt_path: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approved_at: {
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

    // Add foreign key constraints for travel advance expenses
    await queryInterface.addConstraint('travel_advance_expenses', {
      fields: ['travel_advance_request_id'],
      type: 'foreign key',
      name: 'fk_travel_advance_expenses_travel_advance_request',
      references: {
        table: 'travel_advance_requests',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('travel_advance_expenses', {
      fields: ['expense_line_id'],
      type: 'foreign key',
      name: 'fk_travel_advance_expenses_expense_line',
      references: {
        table: 'expense_lines',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('travel_advance_expenses', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_travel_advance_expenses_approved_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints in reverse order
    await queryInterface.removeConstraint('travel_advance_expenses', 'fk_travel_advance_expenses_travel_advance_request');
    await queryInterface.removeConstraint('travel_advance_expenses', 'fk_travel_advance_expenses_expense_line');
    await queryInterface.removeConstraint('travel_advance_expenses', 'fk_travel_advance_expenses_approved_by');

    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_user');
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_department');
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_approved_by');
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_rejected_by');

    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_petty_cash_book');
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_user');
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_approved_by');

    await queryInterface.removeConstraint('petty_cash_books', 'fk_petty_cash_books_user');
    await queryInterface.removeConstraint('petty_cash_books', 'fk_petty_cash_books_department');

    // Drop tables in reverse order
    await queryInterface.dropTable('travel_advance_expenses');
    await queryInterface.dropTable('travel_advance_requests');
    await queryInterface.dropTable('expense_lines');
    await queryInterface.dropTable('petty_cash_transactions');
    await queryInterface.dropTable('petty_cash_books');
  }
}
