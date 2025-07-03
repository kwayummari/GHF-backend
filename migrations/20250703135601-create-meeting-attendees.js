module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meeting_attendees', {
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
      attendance_status: {
        type: Sequelize.ENUM('present', 'absent', 'excused', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      attendance_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
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

    // Add foreign key constraints
    await queryInterface.addConstraint('meeting_attendees', {
      fields: ['meeting_id'],
      type: 'foreign key',
      name: 'fk_meeting_attendees_meeting',
      references: {
        table: 'meetings',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meeting_attendees', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_meeting_attendees_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint to prevent duplicate attendees
    await queryInterface.addConstraint('meeting_attendees', {
      fields: ['meeting_id', 'user_id'],
      type: 'unique',
      name: 'unique_meeting_attendee'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('meeting_attendees', 'fk_meeting_attendees_meeting');
    await queryInterface.removeConstraint('meeting_attendees', 'fk_meeting_attendees_user');
    await queryInterface.removeConstraint('meeting_attendees', 'unique_meeting_attendee');

    // Drop table
    await queryInterface.dropTable('meeting_attendees');
  }
};
