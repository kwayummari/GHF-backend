module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop all meeting-related tables first
    await queryInterface.dropTable('meeting_tasks', { cascade: true });
    await queryInterface.dropTable('meeting_minutes', { cascade: true });
    await queryInterface.dropTable('meeting_attachments', { cascade: true });
    await queryInterface.dropTable('meeting_attendees', { cascade: true });
    await queryInterface.dropTable('meetings', { cascade: true });

    // Create meetings table
    await queryInterface.createTable('meetings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      organizer_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
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

    // Create meeting_attendees table
    await queryInterface.createTable('meeting_attendees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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

    // Create meeting_attachments table
    await queryInterface.createTable('meeting_attachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      fileType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uploadDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      description: {
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

    // Create meeting_minutes table
    await queryInterface.createTable('meeting_minutes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_by: {
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

    // Create meeting_tasks table
    await queryInterface.createTable('meeting_tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
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
    await queryInterface.addConstraint('meetings', {
      fields: ['organizer_id'],
      type: 'foreign key',
      name: 'fk_meetings_organizer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meetings', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_meetings_department_id',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

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

    await queryInterface.addConstraint('meeting_attachments', {
      fields: ['meeting_id'],
      type: 'foreign key',
      name: 'fk_meeting_attachments_meeting',
      references: {
        table: 'meetings',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meeting_attachments', {
      fields: ['uploadedBy'],
      type: 'foreign key',
      name: 'fk_meeting_attachments_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

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
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_meeting_minutes_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

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
      fields: ['assigned_to'],
      type: 'foreign key',
      name: 'fk_meeting_tasks_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraints
    await queryInterface.addConstraint('meeting_attendees', {
      fields: ['meeting_id', 'user_id'],
      type: 'unique',
      name: 'unique_meeting_attendee'
    });

    await queryInterface.addConstraint('meeting_attachments', {
      fields: ['meeting_id', 'fileName'],
      type: 'unique',
      name: 'unique_meeting_attachment'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints in reverse order
    await queryInterface.removeConstraint('meeting_attendees', 'unique_meeting_attendee');
    await queryInterface.removeConstraint('meeting_attachments', 'unique_meeting_attachment');

    await queryInterface.removeConstraint('meeting_tasks', 'fk_meeting_tasks_user');
    await queryInterface.removeConstraint('meeting_tasks', 'fk_meeting_tasks_meeting');
    await queryInterface.removeConstraint('meeting_minutes', 'fk_meeting_minutes_user');
    await queryInterface.removeConstraint('meeting_minutes', 'fk_meeting_minutes_meeting');
    await queryInterface.removeConstraint('meeting_attachments', 'fk_meeting_attachments_user');
    await queryInterface.removeConstraint('meeting_attachments', 'fk_meeting_attachments_meeting');
    await queryInterface.removeConstraint('meeting_attendees', 'fk_meeting_attendees_user');
    await queryInterface.removeConstraint('meeting_attendees', 'fk_meeting_attendees_meeting');
    await queryInterface.removeConstraint('meetings', 'fk_meetings_department');
    await queryInterface.removeConstraint('meetings', 'fk_meetings_organizer');

    // Drop tables in reverse order
    await queryInterface.dropTable('meeting_tasks');
    await queryInterface.dropTable('meeting_minutes');
    await queryInterface.dropTable('meeting_attachments');
    await queryInterface.dropTable('meeting_attendees');
    await queryInterface.dropTable('meetings');
  }
};
