const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Fingerprint model
 * @swagger
 * components:
 *   schemas:
 *     Fingerprint:
 *       type: object
 *       required:
 *         - user_id
 *         - template
 *       properties:
 *         id:
 *           type: integer
 *           description: Fingerprint ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         template:
 *           type: string
 *           description: Fingerprint template data
 */
const Fingerprint = sequelize.define('Fingerprint', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  template: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
}, {
  tableName: 'fingerprints',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false, // No updated_at field in this table
});

// Model associations
Fingerprint.associate = (models) => {
  Fingerprint.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = Fingerprint;