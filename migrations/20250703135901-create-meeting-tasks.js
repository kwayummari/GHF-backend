module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meeting_tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'meetings',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      assignee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'overdue'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      completedDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedBy: {
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

    // Add foreign key constraints
    await queryInterface.addConstraint('meeting_tasks', {
      fields: ['meeting_id'],
      type: 'foreign key',
      name: 'fk_meeting_tasks_meeting',
      references: {
        table: 'meetings',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meeting_tasks', {
      fields: ['assignee_id'],
      type: 'foreign key',
      name: 'fk_meeting_tasks_assignee',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meeting_tasks', {
      fields: ['completedBy'],
      type: 'foreign key',
      name: 'fk_meeting_tasks_completer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('meeting_tasks', 'fk_meeting_tasks_meeting');
    await queryInterface.removeConstraint('meeting_tasks', 'fk_meeting_tasks_assignee');
    await queryInterface.removeConstraint('meeting_tasks', 'fk_meeting_tasks_completer');

    // Drop table
    await queryInterface.dropTable('meeting_tasks');
  }
};
