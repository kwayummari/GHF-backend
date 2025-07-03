
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);


/**
 * RequisitionAttachment model
 * @swagger
 * components:
 *   schemas:
 *     RequisitionAttachment:
 *       type: object
 *       required:
 *         - purchase_request_id
 *         - filename
 *         - file_path
 *         - file_size
 *         - uploaded_by
 *       properties:
 *         id:
 *           type: integer
 *           description: Attachment ID
 *         purchase_request_id:
 *           type: integer
 *           description: Purchase request ID
 *         filename:
 *           type: string
 *           description: Original filename
 *         file_path:
 *           type: string
 *           description: File path on server
 *         file_size:
 *           type: integer
 *           description: File size in bytes
 *         mime_type:
 *           type: string
 *           description: MIME type
 *         description:
 *           type: string
 *           description: File description
 *         category:
 *           type: string
 *           description: File category
 *         uploaded_by:
 *           type: integer
 *           description: User ID who uploaded
 *         upload_date:
 *           type: string
 *           format: date-time
 *           description: Upload date
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */
const RequisitionAttachment = sequelize.define('RequisitionAttachment', {
  purchase_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_requests',
      key: 'id',
    },
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'requisition_attachments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
RequisitionAttachment.associate = (models) => {
  RequisitionAttachment.belongsTo(models.PurchaseRequest, {
    foreignKey: 'purchase_request_id',
    as: 'purchase_request',
  });

  RequisitionAttachment.belongsTo(models.User, {
    foreignKey: 'uploaded_by',
    as: 'uploader',
  });
};

module.exports = RequisitionAttachment; 