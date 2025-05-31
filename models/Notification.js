const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

/**
 * Notification model
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - subject
 *         - message
 *         - channel
 *         - receiver_user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Notification ID
 *         subject:
 *           type: string
 *           description: Notification subject
 *         message:
 *           type: string
 *           description: Notification message
 *         channel:
 *           type: string
 *           enum: [email, sms, in-app]
 *           description: Notification channel
 *         status:
 *           type: string
 *           enum: [sent, delivered, read, failed]
 *           description: Notification status
 *         receiver_user_id:
 *           type: integer
 *           description: User ID of receiver
 *         sender_user_id:
 *           type: integer
 *           description: User ID of sender
 */
const Notification = sequelize.define('Notification', {
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'in-app'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent',
  },
  receiver_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  sender_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'receiver_user_id',
    as: 'receiver',
  });
  
  Notification.belongsTo(models.User, {
    foreignKey: 'sender_user_id',
    as: 'sender',
  });
};

module.exports = Notification;