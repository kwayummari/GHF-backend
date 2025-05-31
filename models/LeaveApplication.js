const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * LeaveApplication model
 * @swagger
 * components:
 *   schemas:
 *     LeaveApplication:
 *       type: object
 *       required:
 *         - user_id
 *         - type_id
 *         - starting_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Leave application ID
 *         user_id:
 *           type: integer
 *           description: User ID of applicant
 *         type_id:
 *           type: integer
 *           description: Leave type ID
 *         starting_date:
 *           type: string
 *           format: date
 *           description: Leave start date
 *         end_date:
 *           type: string
 *           format: date
 *           description: Leave end date
 *         approval_status:
 *           type: string
 *           enum: [draft, pending, approved by supervisor, approved by hr, approved, rejected]
 *           description: Approval status of leave application
 *         approver_id:
 *           type: integer
 *           description: User ID of approver
 *         validity_check:
 *           type: string
 *           description: Additional validation information
 *         comment:
 *           type: string
 *           description: Comments on leave application
 *         attachment_id:
 *           type: integer
 *           description: Document attachment ID
 */
const LeaveApplication = sequelize.define('LeaveApplication', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'leave_types',
      key: 'id',
    },
  },
  starting_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  approval_status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved by supervisor', 'approved by hr', 'approved', 'rejected'),
    defaultValue: 'draft',
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  validity_check: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'documents',
      key: 'id',
    },
  },
}, {
  tableName: 'leave_applications',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
LeaveApplication.associate = (models) => {
  LeaveApplication.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  LeaveApplication.belongsTo(models.LeaveType, {
    foreignKey: 'type_id',
    as: 'leaveType',
  });

  LeaveApplication.belongsTo(models.User, {
    foreignKey: 'approver_id',
    as: 'approver',
  });

  LeaveApplication.belongsTo(models.Document, {
    foreignKey: 'attachment_id',
    as: 'attachment',
  });
};

module.exports = LeaveApplication;