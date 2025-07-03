module.exports = {
  up: async (queryInterface, Sequelize) => {
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
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
      rejected_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
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

    await queryInterface.addConstraint('travel_advance_requests', {
      fields: ['request_number'],
      type: 'unique',
      name: 'unique_travel_advance_request_number'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_user');
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_department');
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_approved_by');
    await queryInterface.removeConstraint('travel_advance_requests', 'fk_travel_advance_requests_rejected_by');
    await queryInterface.removeConstraint('travel_advance_requests', 'unique_travel_advance_request_number');
    await queryInterface.dropTable('travel_advance_requests');
  }
};
