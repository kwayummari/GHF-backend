module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meeting_minutes', {
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
      preparedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      preparedDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
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
      approvedDate: {
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

    // Add foreign key constraints
    await queryInterface.addConstraint('meeting_minutes', {
      fields: ['meeting_id'],
      type: 'foreign key',
      name: 'fk_meeting_minutes_meeting',
      references: {
        table: 'meetings',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meeting_minutes', {
      fields: ['preparedBy'],
      type: 'foreign key',
      name: 'fk_meeting_minutes_preparer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meeting_minutes', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_meeting_minutes_approver',
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
    await queryInterface.removeConstraint('meeting_minutes', 'fk_meeting_minutes_meeting');
    await queryInterface.removeConstraint('meeting_minutes', 'fk_meeting_minutes_preparer');
    await queryInterface.removeConstraint('meeting_minutes', 'fk_meeting_minutes_approver');

    // Drop table
    await queryInterface.dropTable('meeting_minutes');
  }
};
