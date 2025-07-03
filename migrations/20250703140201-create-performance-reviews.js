module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('performance_reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      review_period: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      review_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'reviewed', 'completed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      overall_rating: {
        type: Sequelize.DECIMAL(3,1),
        allowNull: true
      },
      review_by: {
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

    await queryInterface.createTable('performance_metrics', {
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
          model: 'performance_reviews',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      metric_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      metric_type: {
        type: Sequelize.ENUM('rating', 'number', 'text'),
        allowNull: false
      },
      target: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
      },
      actual: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
      },
      rating: {
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

    // Add foreign key constraints
    await queryInterface.addConstraint('performance_reviews', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'fk_performance_reviews_employee',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('performance_reviews', {
      fields: ['review_by'],
      type: 'foreign key',
      name: 'fk_performance_reviews_reviewer',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('performance_reviews', {
      fields: ['approved_by'],
      type: 'foreign key',
      name: 'fk_performance_reviews_approver',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('performance_metrics', {
      fields: ['review_id'],
      type: 'foreign key',
      name: 'fk_performance_metrics_review',
      references: {
        table: 'performance_reviews',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // Add unique constraint for reviews
    await queryInterface.addConstraint('performance_reviews', {
      fields: ['employee_id', 'review_period'],
      type: 'unique',
      name: 'unique_performance_review'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraints
    await queryInterface.removeConstraint('performance_reviews', 'fk_performance_reviews_employee');
    await queryInterface.removeConstraint('performance_reviews', 'fk_performance_reviews_reviewer');
    await queryInterface.removeConstraint('performance_reviews', 'fk_performance_reviews_approver');
    await queryInterface.removeConstraint('performance_metrics', 'fk_performance_metrics_review');
    await queryInterface.removeConstraint('performance_reviews', 'unique_performance_review');

    // Drop tables
    await queryInterface.dropTable('performance_metrics');
    await queryInterface.dropTable('performance_reviews');
  }
};
