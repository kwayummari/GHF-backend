module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('loan_installments', {
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
      installment_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      principal: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      interest: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'overdue'),
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paid_amount: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: true
      },
      balance: {
        type: Sequelize.DECIMAL(15,2),
        allowNull: false,
        defaultValue: 0.00
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

    await queryInterface.addConstraint('loan_installments', {
      fields: ['loan_id'],
      type: 'foreign key',
      name: 'fk_loan_installments_loan',
      references: {
        table: 'loans',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for loan_id and installment_number
    await queryInterface.addConstraint('loan_installments', {
      fields: ['loan_id', 'installment_number'],
      type: 'unique',
      name: 'unique_loan_installment'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('loan_installments', 'fk_loan_installments_loan');
    await queryInterface.removeConstraint('loan_installments', 'unique_loan_installment');
    await queryInterface.dropTable('loan_installments');
  }
};
