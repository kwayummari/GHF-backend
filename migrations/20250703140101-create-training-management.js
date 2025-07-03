module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('training_programs', {
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
      status: {
        type: Sequelize.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'planned'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      trainer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      budget: {
        type: Sequelize.DECIMAL(10,2),
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

    await queryInterface.createTable('training_participants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'training_programs',
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
      status: {
        type: Sequelize.ENUM('registered', 'attended', 'completed', 'absent', 'cancelled'),
        allowNull: false,
        defaultValue: 'registered'
      },
      attendanceDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completionDate: {
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

    await queryInterface.createTable('training_materials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'training_programs',
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
      type: {
        type: Sequelize.ENUM('document', 'video', 'presentation', 'quiz'),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
    await queryInterface.addConstraint('training_programs', {
      fields: ['trainer_id'],
      type: 'foreign key',
      name: 'fk_training_programs_trainer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('training_programs', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_training_programs_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('training_participants', {
      fields: ['program_id'],
      type: 'foreign key',
      name: 'fk_training_participants_program',
      references: {
        table: 'training_programs',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('training_participants', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_training_participants_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('training_materials', {
      fields: ['program_id'],
      type: 'foreign key',
      name: 'fk_training_materials_program',
      references: {
        table: 'training_programs',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('training_materials', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_training_materials_creator',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for participants
    await queryInterface.addConstraint('training_participants', {
      fields: ['program_id', 'user_id'],
      type: 'unique',
      name: 'unique_training_participant'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints
    await queryInterface.removeConstraint('training_programs', 'fk_training_programs_trainer');
    await queryInterface.removeConstraint('training_programs', 'fk_training_programs_department');
    await queryInterface.removeConstraint('training_participants', 'fk_training_participants_program');
    await queryInterface.removeConstraint('training_participants', 'fk_training_participants_user');
    await queryInterface.removeConstraint('training_materials', 'fk_training_materials_program');
    await queryInterface.removeConstraint('training_materials', 'fk_training_materials_creator');
    await queryInterface.removeConstraint('training_participants', 'unique_training_participant');

    // Drop tables
    await queryInterface.dropTable('training_materials');
    await queryInterface.dropTable('training_participants');
    await queryInterface.dropTable('training_programs');
  }
};
