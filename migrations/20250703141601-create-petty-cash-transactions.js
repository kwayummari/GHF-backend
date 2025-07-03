module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('petty_cash_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      petty_cash_book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'petty_cash_books',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_petty_cash_book');
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_user');
    await queryInterface.removeConstraint('petty_cash_transactions', 'fk_petty_cash_transactions_approved_by');
    await queryInterface.dropTable('petty_cash_transactions');
  }
};
