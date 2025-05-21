'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create leave_applications table
    await queryInterface.createTable('leave_applications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'leave_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      starting_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      approval_status: {
        type: Sequelize.ENUM('draft', 'pending', 'approved by supervisor', 'approved by hr', 'approved', 'rejected'),
        defaultValue: 'draft',
      },
      approver_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      validity_check: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Create attendance table
    await queryInterface.createTable('attendance', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      arrival_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      departure_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scheduler_status: {
        type: Sequelize.ENUM('working day', 'weekend', 'holiday in working day', 'holiday in weekend'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('absent', 'present', 'on leave', 'half day'),
        defaultValue: 'absent',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      activity: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approval_status: {
        type: Sequelize.ENUM('draft', 'approved', 'rejected'),
        defaultValue: 'draft',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint for user_id and date
    await queryInterface.addIndex('attendance', ['user_id', 'date'], {
      unique: true,
      name: 'unique_user_date',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('attendance');
    await queryInterface.dropTable('leave_applications');
  }
};