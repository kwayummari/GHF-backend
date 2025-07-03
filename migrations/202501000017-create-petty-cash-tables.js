module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create petty_cash_funds table
    await queryInterface.createTable('petty_cash_funds', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      initialAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      currentBalance: {
        type: Sequelize.DECIMAL(10,2),
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

    // Create petty_cash_transactions table
    await queryInterface.createTable('petty_cash_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      petty_cash_fund_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'petty_cash_funds',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      transactionType: {
        type: Sequelize.ENUM('expense', 'reimbursement', 'refund'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      receiptNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
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

    // Create petty_cash_transaction_details table
    await queryInterface.createTable('petty_cash_transaction_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'petty_cash_transactions',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      itemName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      totalAmount: {
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
    await queryInterface.addConstraint('petty_cash_transactions', {
      fields: ['petty_cash_fund_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_transactions_fund',
      references: {
        table: 'petty_cash_funds',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('petty_cash_transactions', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_petty_cash_transactions_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('petty_cash_transaction_details', {
      fields: ['transaction_id'],
      type: 'foreign key',
      name: 'fk_petty_cash_transaction_details_transaction',
      references: {
        table: 'petty_cash_transactions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_fund');
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_user');
    await queryInterface.removeConstraint('petty_cash_transaction_details', 'fk_petty_cash_transaction_details_transaction');

    // Drop tables in reverse order
    await queryInterface.dropTable('petty_cash_transaction_details');
    await queryInterface.dropTable('petty_cash_transactions');
    await queryInterface.dropTable('petty_cash_funds');
  }
};
