'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create meetings table
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
                type: Sequelize.DATEONLY,
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
                allowNull: true
            },
            is_virtual: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            meeting_link: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            chairperson: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            organizer: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            agenda_items: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            status: {
                type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
                defaultValue: 'scheduled'
            },
            minutes_document_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'documents',
                    key: 'id'
                }
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add indexes for meetings table
        await queryInterface.addIndex('meetings', ['meeting_date', 'status'], {
            name: 'idx_meetings_date_status'
        });

        await queryInterface.addIndex('meetings', ['created_by'], {
            name: 'idx_meetings_created_by'
        });

        await queryInterface.addIndex('meetings', ['chairperson'], {
            name: 'idx_meetings_chairperson'
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
                allowNull: false,
                references: {
                    model: 'meetings',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            role: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            attendance_status: {
                type: Sequelize.ENUM('invited', 'confirmed', 'attended', 'absent', 'cancelled'),
                defaultValue: 'invited'
            },
            is_required: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add indexes for meeting_attendees table
        await queryInterface.addIndex('meeting_attendees', ['meeting_id']);
        await queryInterface.addIndex('meeting_attendees', ['user_id']);
        await queryInterface.addIndex('meeting_attendees', ['email']);
        await queryInterface.addIndex('meeting_attendees', ['meeting_id', 'email'], { unique: true });

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
                allowNull: false,
                references: {
                    model: 'meetings',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            task_description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            assigned_to: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            assigned_user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            due_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
                defaultValue: 'medium'
            },
            status: {
                type: Sequelize.ENUM('not_started', 'in_progress', 'completed', 'cancelled', 'overdue'),
                defaultValue: 'not_started'
            },
            progress: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add indexes for meeting_tasks table
        await queryInterface.addIndex('meeting_tasks', ['meeting_id']);
        await queryInterface.addIndex('meeting_tasks', ['assigned_user_id']);
        await queryInterface.addIndex('meeting_tasks', ['due_date', 'status']);
        await queryInterface.addIndex('meeting_tasks', ['priority']);

        // Create meeting_documents table
        await queryInterface.createTable('meeting_documents', {
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
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            document_name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            file_path: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            file_size: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
            file_type: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            document_type: {
                type: Sequelize.ENUM('agenda', 'minutes', 'presentation', 'report', 'attachment'),
                defaultValue: 'attachment'
            },
            uploaded_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            upload_date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_public: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add indexes for meeting_documents table
        await queryInterface.addIndex('meeting_documents', ['meeting_id']);
        await queryInterface.addIndex('meeting_documents', ['uploaded_by']);
        await queryInterface.addIndex('meeting_documents', ['document_type']);
        await queryInterface.addIndex('meeting_documents', ['upload_date']);
    },

    async down(queryInterface, Sequelize) {
        // Drop tables in reverse order to handle foreign key constraints
        await queryInterface.dropTable('meeting_documents');
        await queryInterface.dropTable('meeting_tasks');
        await queryInterface.dropTable('meeting_attendees');
        await queryInterface.dropTable('meetings');
    }
};