
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const DocumentCategory = sequelize.define('DocumentCategory', {
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'document_categories',
  timestamps: true,
  underscored: true
});

// Associations
DocumentCategory.associate = (models) => {
  DocumentCategory.belongsTo(models.DocumentCategory, {
    foreignKey: 'parent_id',
    as: 'parent'
  });

  DocumentCategory.hasMany(models.DocumentCategory, {
    foreignKey: 'parent_id',
    as: 'children'
  });

  DocumentCategory.hasMany(models.Document, {
    foreignKey: 'category_id',
    as: 'documents'
  });
};

module.exports = DocumentCategory;
