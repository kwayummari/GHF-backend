const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbConfig');

/**
 * BasicEmployeeData model
 * @swagger
 * components:
 *   schemas:
 *     BasicEmployeeData:
 *       type: object
 *       required:
 *         - user_id
 *         - date_joined
 *         - designation
 *         - employment_type
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *         status:
 *           type: string
 *           enum: [active, inactive, on leave, terminated]
 *           description: Employment status
 *         registration_number:
 *           type: string
 *           description: Employee registration number
 *         date_joined:
 *           type: string
 *           format: date
 *           description: Date when employee joined
 *         designation:
 *           type: string
 *           description: Job designation/title
 *         employment_type:
 *           type: string
 *           enum: [full time, contract, intern, part time, volunteer]
 *           description: Type of employment
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         salary:
 *           type: number
 *           format: float
 *           description: Employee salary
 *         supervisor_id:
 *           type: integer
 *           description: Supervisor's user ID
 *         bank_name:
 *           type: string
 *           description: Bank name
 *         account_number:
 *           type: string
 *           description: Bank account number
 *         nida:
 *           type: string
 *           description: National ID number
 *         bima:
 *           type: string
 *           description: Insurance number
 *         nssf:
 *           type: string
 *           description: NSSF number
 *         helsb:
 *           type: string
 *           description: HELSB reference
 *         signature:
 *           type: string
 *           description: Employee signature (file path or base64)
 */
const BasicEmployeeData = sequelize.define('BasicEmployeeData', {
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on leave', 'terminated'),
    defaultValue: 'active',
  },
  registration_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  date_joined: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  employment_type: {
    type: DataTypes.ENUM('full time', 'contract', 'intern', 'part time', 'volunteer'),
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  supervisor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  account_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  nida: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  bima: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  nssf: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  helsb: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'basic_employee_data',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Model associations
BasicEmployeeData.associate = (models) => {
  BasicEmployeeData.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  
  BasicEmployeeData.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });
  
  BasicEmployeeData.belongsTo(models.User, {
    foreignKey: 'supervisor_id',
    as: 'supervisor',
  });
};

module.exports = BasicEmployeeData;