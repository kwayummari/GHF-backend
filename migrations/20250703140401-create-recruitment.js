module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('job_positions', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('open', 'filled', 'closed'),
        allowNull: false,
        defaultValue: 'open'
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

    await queryInterface.createTable('job_applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      position_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_positions',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      cv_path: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('new', 'reviewed', 'interviewed', 'rejected', 'hired'),
        allowNull: false,
        defaultValue: 'new'
      },
      last_updated_by: {
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

    await queryInterface.createTable('interview_schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_applications',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      interviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      scheduled_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rating: {
        type: Sequelize.DECIMAL(3,1),
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
    await queryInterface.addConstraint('job_positions', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_job_positions_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('job_applications', {
      fields: ['position_id'],
      type: 'foreign key',
      name: 'fk_job_applications_position',
      references: {
        table: 'job_positions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('job_applications', {
      fields: ['last_updated_by'],
      type: 'foreign key',
      name: 'fk_job_applications_updater',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('interview_schedules', {
      fields: ['application_id'],
      type: 'foreign key',
      name: 'fk_interview_schedules_application',
      references: {
        table: 'job_applications',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('interview_schedules', {
      fields: ['interviewer_id'],
      type: 'foreign key',
      name: 'fk_interview_schedules_interviewer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for interview schedules
    await queryInterface.addConstraint('interview_schedules', {
      fields: ['application_id', 'interviewer_id', 'scheduled_date', 'scheduled_time'],
      type: 'unique',
      name: 'unique_interview_schedule'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints
    await queryInterface.removeConstraint('job_positions', 'fk_job_positions_department');
    await queryInterface.removeConstraint('job_applications', 'fk_job_applications_position');
    await queryInterface.removeConstraint('job_applications', 'fk_job_applications_updater');
    await queryInterface.removeConstraint('interview_schedules', 'fk_interview_schedules_application');
    await queryInterface.removeConstraint('interview_schedules', 'fk_interview_schedules_interviewer');
    await queryInterface.removeConstraint('interview_schedules', 'unique_interview_schedule');

    // Drop tables
    await queryInterface.dropTable('interview_schedules');
    await queryInterface.dropTable('job_applications');
    await queryInterface.dropTable('job_positions');
  }
};
