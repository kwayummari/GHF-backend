const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * NextOfKin model
 * @swagger
 * components:
 *   schemas:
 *     NextOfKin:
 *       type: object
 *       required:
 *         - user_id
 *         - name
 *         - phone_number
 *         - percentage
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: Next of kin ID
 *         user_id:
 *           type: integer
 *           description: User ID
 *         name:
 *           type: string
 *           description: Next of kin name
 *         phone_number:
 *           type: string
 *           description: Next of kin phone number
 *         percentage:
 *           type: integer
 *           description: Percentage allocation (1-100)
 *         relationship:
 *           type: string
 *           description: Relationship to employee
 */
const NextOfKin = sequelize.define('NextOfKin', {
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
  percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100,
    },
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'next_of_kin',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
NextOfKin.associate = (models) => {
  NextOfKin.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};

module.exports = NextOfKin;