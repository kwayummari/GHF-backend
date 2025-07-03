module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Meetings table without foreign keys first
    await queryInterface.createTable('meetings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      meeting_type: {
        type: Sequelize.ENUM('board', 'management', 'department', 'team', 'project', 'one_on_one', 'client'),
        allowNull: false,
        defaultValue: 'team'
      },
      meeting_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      agenda: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      created_by: {
        type: Sequelize.INTEGER
      },
      updated_by: {
        type: Sequelize.INTEGER
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

    // Create Meeting Attendees table without foreign keys first
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      attendance_status: {
        type: Sequelize.ENUM('present', 'absent', 'excused', 'late', 'not_required'),
        allowNull: false,
        defaultValue: 'not_required'
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT,
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

    // Create Meeting Files table without foreign keys first
    await queryInterface.createTable('meeting_files', {
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
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      file_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      file_category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Create Meeting Tasks table without foreign keys first
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
      task_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      assigned_to: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      assigned_to_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      completion_percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('draft', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      due_date: {
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



    await queryInterface.addConstraint('meeting_tasks', {
      fields: ['assigned_to_id'],
      type: 'foreign key',
      name: 'meeting_tasks_assigned_to_id_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meetings', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'meetings_created_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('meetings', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'meetings_updated_by_fkey',
      references: { table: 'users', field: 'id' },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('meeting_tasks');
    await queryInterface.dropTable('meeting_files');
    await queryInterface.dropTable('meeting_attendees');
    await queryInterface.dropTable('meetings');
  }
};
