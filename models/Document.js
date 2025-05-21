const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Document model
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - name
 *         - file_path
 *         - file_type
 *         - file_size
 *       properties:
 *         id:
 *           type: integer
 *           description: Document ID
 *         user_id:
 *           type: integer
 *           description: User ID of document owner
 *         name:
 *           type: string
 *           description: Document name
 *         description:
 *           type: string
 *           description: Document description
 *         file_path:
 *           type: string
 *           description: Path to the file
 *         file_type:
 *           type: string
 *           description: File MIME type
 *         file_size:
 *           type: integer
 *           description: File size in bytes
 *         uploaded_at:
 *           type: string
 *           format: date-time
 *           description: Upload timestamp
 *         uploaded_by:
 *           type: integer
 *           description: User ID of uploader
 */
const Document = sequelize.define('Document', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'documents',
  timestamps: false,
});

// Model associations
Document.associate = (models) => {
  Document.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'owner',
  });
  
  Document.belongsTo(models.User, {
    foreignKey: 'uploaded_by',
    as: 'uploader',
  });
  
  Document.hasMany(models.LeaveApplication, {
    foreignKey: 'attachment_id',
    as: 'leaveApplications',
  });
};

module.exports = Document;