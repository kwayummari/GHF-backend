module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('travel_advance_expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      travel_advance_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'travel_advance_requests',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      expense_line_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'expense_lines',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
    await queryInterface.removeConstraint('travel_advance_expenses', 'fk_travel_advance_expenses_travel_advance_request');
    await queryInterface.removeConstraint('travel_advance_expenses', 'fk_travel_advance_expenses_expense_line');
    await queryInterface.removeConstraint('travel_advance_expenses', 'fk_travel_advance_expenses_approved_by');
    await queryInterface.dropTable('travel_advance_expenses');
  }
};
