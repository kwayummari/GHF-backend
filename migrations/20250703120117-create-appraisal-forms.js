module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appraisal_forms', {
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
      objective_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      self_assessment: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      self_comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      peer_review: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      peer_reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      peer_comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      hr_review: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      hr_reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      hr_comment: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('appraisal_forms');
  }
};
