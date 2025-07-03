module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appraisal_forms', {
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
      status: {
        type: Sequelize.ENUM('draft', 'active', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
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

    await queryInterface.createTable('appraisal_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'appraisal_forms',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      weight: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false
      },
      question_type: {
        type: Sequelize.ENUM('rating', 'text', 'multiple_choice'),
        allowNull: false
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

    await queryInterface.createTable('appraisal_reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'appraisal_forms',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      review_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      overall_rating: {
        type: Sequelize.DECIMAL(3,1),
        allowNull: true
      },
      comments: {
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

    await queryInterface.createTable('appraisal_answers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'appraisal_reviews',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'appraisal_questions',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false
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
    await queryInterface.addConstraint('appraisal_forms', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_appraisal_forms_department',
      references: {
        table: 'departments',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_questions', {
      fields: ['form_id'],
      type: 'foreign key',
      name: 'fk_appraisal_questions_form',
      references: {
        table: 'appraisal_forms',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_reviews', {
      fields: ['form_id'],
      type: 'foreign key',
      name: 'fk_appraisal_reviews_form',
      references: {
        table: 'appraisal_forms',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_reviews', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'fk_appraisal_reviews_employee',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_reviews', {
      fields: ['reviewer_id'],
      type: 'foreign key',
      name: 'fk_appraisal_reviews_reviewer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_answers', {
      fields: ['review_id'],
      type: 'foreign key',
      name: 'fk_appraisal_answers_review',
      references: {
        table: 'appraisal_reviews',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('appraisal_answers', {
      fields: ['question_id'],
      type: 'foreign key',
      name: 'fk_appraisal_answers_question',
      references: {
        table: 'appraisal_questions',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('appraisal_forms', 'fk_appraisal_forms_department');
    await queryInterface.removeConstraint('appraisal_questions', 'fk_appraisal_questions_form');
    await queryInterface.removeConstraint('appraisal_reviews', 'fk_appraisal_reviews_form');
    await queryInterface.removeConstraint('appraisal_reviews', 'fk_appraisal_reviews_employee');
    await queryInterface.removeConstraint('appraisal_reviews', 'fk_appraisal_reviews_reviewer');
    await queryInterface.removeConstraint('appraisal_answers', 'fk_appraisal_answers_review');
    await queryInterface.removeConstraint('appraisal_answers', 'fk_appraisal_answers_question');

    // Drop tables in reverse order
    await queryInterface.dropTable('appraisal_answers');
    await queryInterface.dropTable('appraisal_reviews');
    await queryInterface.dropTable('appraisal_questions');
    await queryInterface.dropTable('appraisal_forms');
  }
};
