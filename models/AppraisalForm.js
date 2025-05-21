const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * AppraisalForm model
 * @swagger
 * components:
 *   schemas:
 *     AppraisalForm:
 *       type: object
 *       required:
 *         - user_id
 *         - objective_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Appraisal form ID
 *         user_id:
 *           type: integer
 *           description: User ID being appraised
 *         objective_id:
 *           type: integer
 *           description: Objective ID being appraised
 *         self_assessment:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Self-assessment score (1-10)
 *         self_comment:
 *           type: string
 *           description: Self-assessment comment
 *         peer_review:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Peer review score (1-10)
 *         peer_reviewer_id:
 *           type: integer
 *           description: User ID of peer reviewer
 *         peer_comment:
 *           type: string
 *           description: Peer review comment
 *         hr_review:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: HR review score (1-10)
 *         hr_reviewer_id:
 *           type: integer
 *           description: User ID of HR reviewer
 *         hr_comment:
 *           type: string
 *           description: HR review comment
 */
const AppraisalForm = sequelize.define('AppraisalForm', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  objective_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'objectives',
      key: 'id',
    },
  },
  self_assessment: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  self_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  peer_review: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  peer_reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  peer_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hr_review: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10,
    },
  },
  hr_reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  hr_comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'appraisal_forms',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
AppraisalForm.associate = (models) => {
  AppraisalForm.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  AppraisalForm.belongsTo(models.Objective, {
    foreignKey: 'objective_id',
    as: 'objective',
  });
  
  AppraisalForm.belongsTo(models.User, {
    foreignKey: 'peer_reviewer_id',
    as: 'peerReviewer',
  });
  
  AppraisalForm.belongsTo(models.User, {
    foreignKey: 'hr_reviewer_id',
    as: 'hrReviewer',
  });
};

module.exports = AppraisalForm;