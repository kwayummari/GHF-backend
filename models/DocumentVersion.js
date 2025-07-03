
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);
const { sequelize } = require('../config/database');

const DocumentVersion = sequelize.define('DocumentVersion', {
  version: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  changes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'document_versions',
  timestamps: true,
  underscored: true
});

// Associations
DocumentVersion.associate = (models) => {
  DocumentVersion.belongsTo(models.Document, {
    foreignKey: 'document_id',
    as: 'document'
  });

  DocumentVersion.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
};

module.exports = DocumentVersion;
