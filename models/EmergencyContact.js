const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

/**
 * EmergencyContact model
 * @swagger
 * components:
 *   schemas:
 *     EmergencyContact:
 *       type: object
 *       required:
 *         - user_id
 *         - name
 *         - phone_number
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: Emergency contact ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         name:
 *           type: string
 *           description: Contact name
 *         phone_number:
 *           type: string
 *           description: Contact phone number
 *         relationship:
 *           type: string
 *           description: Relationship to employee
 */
const EmergencyContact = sequelize.define('EmergencyContact', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'emergency_contacts',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
EmergencyContact.associate = (models) => {
  EmergencyContact.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = EmergencyContact;