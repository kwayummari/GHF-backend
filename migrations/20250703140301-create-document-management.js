module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('document_categories', {
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
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'document_categories',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
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

    await queryInterface.createTable('documents', {
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
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'document_categories',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '1.0'
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
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'set null'
      },
      approved_date: {
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

    await queryInterface.createTable('document_versions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      changes: {
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
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('document_categories', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_document_categories_parent',
      references: {
        table: 'document_categories',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('documents', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_documents_category',
      references: {
        table: 'document_categories',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('documents', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_documents_creator',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('documents', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_documents_approver',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('document_versions', {
      fields: ['document_id'],
      type: 'foreign key',
      name: 'fk_document_versions_document',
      references: {
        table: 'documents',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('document_versions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_document_versions_creator',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for document versions
    await queryInterface.addConstraint('document_versions', {
      fields: ['document_id', 'version'],
      type: 'unique',
      name: 'unique_document_version'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints
    await queryInterface.removeConstraint('document_categories', 'fk_document_categories_parent');
    await queryInterface.removeConstraint('documents', 'fk_documents_category');
    await queryInterface.removeConstraint('documents', 'fk_documents_creator');
    await queryInterface.removeConstraint('documents', 'fk_documents_approver');
    await queryInterface.removeConstraint('document_versions', 'fk_document_versions_document');
    await queryInterface.removeConstraint('document_versions', 'fk_document_versions_creator');
    await queryInterface.removeConstraint('document_versions', 'unique_document_version');

    // Drop tables
    await queryInterface.dropTable('document_versions');
    await queryInterface.dropTable('documents');
    await queryInterface.dropTable('document_categories');
  }
};
