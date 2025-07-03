
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '1.0'
  }
}, {
  tableName: 'documents',
  timestamps: true,
  underscored: true
});

// Associations
Document.associate = (models) => {
  Document.belongsTo(models.DocumentCategory, {
    foreignKey: 'category_id',
    as: 'category'
  });

  Document.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  Document.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver'
  });

  Document.hasMany(models.DocumentVersion, {
    foreignKey: 'document_id',
    as: 'versions'
  });
};

module.exports = Document;
