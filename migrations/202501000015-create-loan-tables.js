module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Loans table without constraints
    await queryInterface.createTable('loans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      loan_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      loan_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      interest_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      loan_term: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Loan term in months'
      },
      monthly_installment: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'disbursed', 'in_progress', 'completed', 'defaulted'),
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
      disbursed_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      disbursed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create Loan Installments table without constraints
    await queryInterface.createTable('loan_installments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      loan_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      payroll_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      installment_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      principal_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      interest_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'overdue', 'waived'),
        allowNull: false,
        defaultValue: 'pending'
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables
    await queryInterface.dropTable('loan_installments');
    await queryInterface.dropTable('loans');
  }
};
