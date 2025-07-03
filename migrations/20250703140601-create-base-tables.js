module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create tables without foreign keys first
    await queryInterface.createTable('departments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
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

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'employee', 'hr', 'finance'),
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastLogin: {
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

    await queryInterface.createTable('attendance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });

    await queryInterface.createTable('attendance_statistics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total_present: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_overtime: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0.00
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{}'
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

    // Add unique constraint on date
    await queryInterface.addConstraint('attendance_statistics', {
      fields: ['date'],
      type: 'unique',
      name: 'unique_date_attendance_statistics'
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('users', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_users_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_attendance_user',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_attendance_created_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_attendance_updated_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints
    await queryInterface.removeConstraint('users', 'fk_users_department');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_user');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_created_by');
    await queryInterface.removeConstraint('attendance', 'fk_attendance_updated_by');
    await queryInterface.removeConstraint('attendance_statistics', 'unique_date');

    // Drop tables
    await queryInterface.dropTable('attendance_statistics');
    await queryInterface.dropTable('attendance');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('departments');
  }
};
