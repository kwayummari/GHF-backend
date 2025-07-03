module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bank_accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bankName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      accountNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      accountName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      accountType: {
        type: Sequelize.ENUM('savings', 'current', 'corporate'),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
      },
      balance: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'frozen'),
        allowNull: false,
        defaultValue: 'active'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
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

    await queryInterface.createTable('bank_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bank_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bank_accounts',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      transactionDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      transactionType: {
        type: Sequelize.ENUM('deposit', 'withdrawal', 'transfer'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      referenceNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
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
    await queryInterface.addConstraint('bank_accounts', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_bank_accounts_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('bank_transactions', {
      fields: ['bank_account_id'],
      type: 'foreign key',
      name: 'fk_bank_transactions_account',
      references: {
        table: 'bank_accounts',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('bank_accounts', 'fk_bank_accounts_department');
    await queryInterface.removeConstraint('bank_transactions', 'fk_bank_transactions_account');

    // Drop tables
    await queryInterface.dropTable('bank_transactions');
    await queryInterface.dropTable('bank_accounts');
  }
};
