
const { DataTypes, Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.development);


/**
 * Payroll Model
 * Manages employee payroll records and calculations
 */
const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2030,
    },
  },
  basic_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  allowances: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string of allowances array',
    get() {
      const rawValue = this.getDataValue('allowances');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('allowances', JSON.stringify(value));
    },
  },
  deductions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string of deductions array',
    get() {
      const rawValue = this.getDataValue('deductions');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('deductions', JSON.stringify(value));
    },
  },
  gross_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  net_salary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'approved', 'rejected', 'paid'),
    defaultValue: 'pending',
  },
  approval_stage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_stages: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejected_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rejected_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payrolls',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'month', 'year'],
      name: 'unique_employee_month_year'
    },
    {
      fields: ['status'],
      name: 'idx_payroll_status'
    },
    {
      fields: ['month', 'year'],
      name: 'idx_payroll_period'
    }
  ]
});

// Define associations
Payroll.associate = (models) => {
  Payroll.belongsTo(models.User, {
    foreignKey: 'employee_id',
    as: 'employee',
  });
  
  Payroll.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
  
  Payroll.belongsTo(models.User, {
    foreignKey: 'updated_by',
    as: 'updater',
  });
  
  Payroll.belongsTo(models.User, {
    foreignKey: 'approved_by',
    as: 'approver',
  });
  
  Payroll.belongsTo(models.User, {
    foreignKey: 'rejected_by',
    as: 'rejecter',
  });
};

module.exports = Payroll; 