const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const { hashPassword } = require('../utils/hashUtils');

/**
 * User model
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - first_name
 *         - sur_name
 *         - email
 *         - gender
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         first_name:
 *           type: string
 *           description: User's first name
 *         middle_name:
 *           type: string
 *           description: User's middle name
 *         sur_name:
 *           type: string
 *           description: User's surname/last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *         gender:
 *           type: string
 *           enum: [Male, Female]
 *           description: User's gender
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: User's account status
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Date and time of last login
 */
const User = sequelize.define('User', {
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  middle_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sur_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      is: /^[0-9+\- ]+$/i,
    },
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Hash password before saving
  hooks: {
    beforeCreate: async (user) => {
      user.password = await hashPassword(user.password);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await hashPassword(user.password);
      }
    },
  },
});

// Instance methods
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Model associations
User.associate = (models) => {
  User.hasOne(models.BasicEmployeeData, {
    foreignKey: 'user_id',
    as: 'basicEmployeeData',
  });
  
  User.hasOne(models.BioData, {
    foreignKey: 'user_id',
    as: 'bioData',
  });
  
  User.hasOne(models.PersonalEmployeeData, {
    foreignKey: 'user_id',
    as: 'personalEmployeeData',
  });
  
  User.hasMany(models.EmergencyContact, {
    foreignKey: 'user_id',
    as: 'emergencyContacts',
  });
  
  User.hasMany(models.NextOfKin, {
    foreignKey: 'user_id',
    as: 'nextOfKin',
  });
  
  User.hasMany(models.LeaveApplication, {
    foreignKey: 'user_id',
    as: 'leaveApplications',
  });
  
  User.hasMany(models.Attendance, {
    foreignKey: 'user_id',
    as: 'attendance',
  });
  
  User.hasMany(models.Document, {
    foreignKey: 'user_id',
    as: 'documents',
  });
  
  User.hasMany(models.Document, {
    foreignKey: 'uploaded_by',
    as: 'uploadedDocuments',
  });
  
  User.hasMany(models.Objective, {
    foreignKey: 'user_id',
    as: 'objectives',
  });
  
  User.belongsToMany(models.Role, {
    through: models.UserRole,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles',
  });
};

module.exports = User;