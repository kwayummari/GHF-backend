'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create basic_employee_data table
    await queryInterface.createTable('basic_employee_data', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'on leave', 'terminated'),
        defaultValue: 'active',
      },
      registration_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      date_joined: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      employment_type: {
        type: Sequelize.ENUM('full time', 'contract', 'intern', 'part time', 'volunteer'),
        allowNull: false,
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      supervisor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      bank_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      account_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      nida: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      bima: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      nssf: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      helsb: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Create bio_data table
    await queryInterface.createTable('bio_data', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fingerprint_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      signature: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      marital_status: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: false,
      },
      national_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      blood_group: {
        type: Sequelize.STRING(10),
        allowNull: true,
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

    // Create personal_employee_data table
    await queryInterface.createTable('personal_employee_data', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      education_level: {
        type: Sequelize.STRING(100),
        allowNull: false,
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

    // Create emergency_contacts table
    await queryInterface.createTable('emergency_contacts', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      relationship: {
        type: Sequelize.STRING(50),
        allowNull: false,
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

    // Create next_of_kin table
    await queryInterface.createTable('next_of_kin', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      percentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 100,
        }
      },
      relationship: {
        type: Sequelize.STRING(50),
        allowNull: false,
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

    // Create fingerprints table
    await queryInterface.createTable('fingerprints', {
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
      template: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('fingerprints');
    await queryInterface.dropTable('next_of_kin');
    await queryInterface.dropTable('emergency_contacts');
    await queryInterface.dropTable('personal_employee_data');
    await queryInterface.dropTable('bio_data');
    await queryInterface.dropTable('basic_employee_data');
  }
};