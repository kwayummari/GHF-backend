module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('time_off_policies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('PTO', 'Sick', 'Vacation', 'Maternity', 'Paternity'),
        allowNull: false
      },
      accrual_rate: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: true
      },
      accrual_period: {
        type: Sequelize.ENUM('monthly', 'annually'),
        allowNull: true
      },
      maximum_balance: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: true
      },
      carry_over: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.createTable('time_off_requests', {
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
      policy_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'time_off_policies',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      total_days: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
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
      approved_date: {
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

    await queryInterface.createTable('time_off_balances', {
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
      policy_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'time_off_policies',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      balance: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0.00
      },
      carry_over: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0.00
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.addConstraint('time_off_requests', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_time_off_requests_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('time_off_requests', {
      fields: ['policy_id'],
      type: 'foreign key',
      name: 'fk_time_off_requests_policy',
      references: {
        table: 'time_off_policies',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('time_off_requests', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_time_off_requests_approver',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('time_off_balances', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_time_off_balances_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('time_off_balances', {
      fields: ['policy_id'],
      type: 'foreign key',
      name: 'fk_time_off_balances_policy',
      references: {
        table: 'time_off_policies',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for time off balances
    await queryInterface.addConstraint('time_off_balances', {
      fields: ['user_id', 'policy_id', 'year'],
      type: 'unique',
      name: 'unique_time_off_balance'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints
    await queryInterface.removeConstraint('time_off_requests', 'fk_time_off_requests_user');
    await queryInterface.removeConstraint('time_off_requests', 'fk_time_off_requests_policy');
    await queryInterface.removeConstraint('time_off_requests', 'fk_time_off_requests_approver');
    await queryInterface.removeConstraint('time_off_balances', 'fk_time_off_balances_user');
    await queryInterface.removeConstraint('time_off_balances', 'fk_time_off_balances_policy');
    await queryInterface.removeConstraint('time_off_balances', 'unique_time_off_balance');

    // Drop tables
    await queryInterface.dropTable('time_off_balances');
    await queryInterface.dropTable('time_off_requests');
    await queryInterface.dropTable('time_off_policies');
  }
};
