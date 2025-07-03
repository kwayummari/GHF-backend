const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const { hashPassword } = require('../utils/hashUtils');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);

/**
 * User model
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Date and time of last login
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was last updated
 */
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(30),
    allowNull: true, // Temporarily allow null to avoid sync issues
    unique: true,
    validate: {
      len: [3, 30],
      is: /^[a-zA-Z0-9_]+$/,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 100],
    },
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'finance_manager', 'hr_manager', 'department_head'),
    defaultValue: 'user',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  // Department association
  User.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });
  
  // Basic employee data association
  User.hasOne(models.BasicEmployeeData, {
    foreignKey: 'user_id',
    as: 'basicData',
  });
  
  // Salary components association
  User.hasMany(models.SalaryComponent, {
    foreignKey: 'user_id',
    as: 'salaryComponents',
  });
  
  // Payroll records association
  User.hasMany(models.Payroll, {
    foreignKey: 'employee_id',
    as: 'payrolls',
  });
  
  // Created payrolls association
  User.hasMany(models.Payroll, {
    foreignKey: 'created_by',
    as: 'createdPayrolls',
  });
  
  // Updated payrolls association
  User.hasMany(models.Payroll, {
    foreignKey: 'updated_by',
    as: 'updatedPayrolls',
  });
  
  // Approved payrolls association
  User.hasMany(models.Payroll, {
    foreignKey: 'approved_by',
    as: 'approvedPayrolls',
  });
  
  // Rejected payrolls association
  User.hasMany(models.Payroll, {
    foreignKey: 'rejected_by',
    as: 'rejectedPayrolls',
  });
};

module.exports = User;