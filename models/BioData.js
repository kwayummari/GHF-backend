const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * BioData model
 * @swagger
 * components:
 *   schemas:
 *     BioData:
 *       type: object
 *       required:
 *         - user_id
 *         - marital_status
 *         - dob
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *         fingerprint_id:
 *           type: string
 *           description: Fingerprint ID
 *         signature:
 *           type: string
 *           description: Signature image (path or base64)
 *         marital_status:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           description: Marital status
 *         national_id:
 *           type: string
 *           description: National ID number
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         blood_group:
 *           type: string
 *           description: Blood group
 */
const BioData = sequelize.define('BioData', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fingerprint_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  marital_status: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: false,
  },
  national_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  blood_group: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
}, {
  tableName: 'bio_data',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  id: false
});

// Model associations
BioData.associate = (models) => {
  BioData.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = BioData;