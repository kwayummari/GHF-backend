module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create loan_types table
    await queryInterface.createTable('loan_types', {
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
      interestRate: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false
      },
      maxAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      repaymentPeriod: {
        type: Sequelize.INTEGER,
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

    // Create loans table
    await queryInterface.createTable('loans', {
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
      loan_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'loan_types',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'disbursed', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      monthlyInstallment: {
        type: Sequelize.DECIMAL(10,2),
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

    // Create loan_repayments table
    await queryInterface.createTable('loan_repayments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      loan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'loans',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      repaymentDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'missed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      paymentMethod: {
        type: Sequelize.STRING(50),
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
    await queryInterface.addConstraint('loans', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_loans_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('loans', {
      fields: ['loan_type_id'],
      type: 'foreign key',
      name: 'fk_loans_loan_type',
      references: {
        table: 'loan_types',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('loan_repayments', {
      fields: ['loan_id'],
      type: 'foreign key',
      name: 'fk_loan_repayments_loan',
      references: {
        table: 'loans',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('loans', 'fk_loans_user');
    await queryInterface.removeConstraint('loans', 'fk_loans_loan_type');
    await queryInterface.removeConstraint('loan_repayments', 'fk_loan_repayments_loan');

    // Drop tables
    await queryInterface.dropTable('loan_repayments');
    await queryInterface.dropTable('loans');
    await queryInterface.dropTable('loan_types');
  }
};
