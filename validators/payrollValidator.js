const Joi = require('joi');

/**
 * Payroll Validation Schemas
 * Comprehensive validation for payroll operations
 */

// Payroll creation schema
const payrollSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'Employee ID is required',
      'number.base': 'Employee ID must be a number',
      'number.integer': 'Employee ID must be an integer',
      'number.positive': 'Employee ID must be positive'
    }),
  month: Joi.number().integer().min(1).max(12).required()
    .messages({
      'any.required': 'Month is required',
      'number.base': 'Month must be a number',
      'number.integer': 'Month must be an integer',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12'
    }),
  year: Joi.number().integer().min(2020).max(2030).required()
    .messages({
      'any.required': 'Year is required',
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be between 2020 and 2030',
      'number.max': 'Year must be between 2020 and 2030'
    }),
  basicSalary: Joi.number().positive().precision(2).required()
    .messages({
      'any.required': 'Basic salary is required',
      'number.base': 'Basic salary must be a number',
      'number.positive': 'Basic salary must be positive',
      'number.precision': 'Basic salary can have maximum 2 decimal places'
    }),
  allowances: Joi.array().items(
    Joi.object({
      name: Joi.string().max(255).required(),
      amount: Joi.number().positive().precision(2).required(),
      type: Joi.string().valid('allowance', 'bonus', 'overtime').required(),
      taxable: Joi.boolean().default(true),
      description: Joi.string().max(500).optional()
    })
  ).optional().default([]),
  deductions: Joi.array().items(
    Joi.object({
      name: Joi.string().max(255).required(),
      amount: Joi.number().positive().precision(2).required(),
      type: Joi.string().valid('tax', 'social_security', 'loan', 'other').required(),
      mandatory: Joi.boolean().default(false),
      description: Joi.string().max(500).optional()
    })
  ).optional().default([]),
  netSalary: Joi.number().positive().precision(2).required()
    .messages({
      'any.required': 'Net salary is required',
      'number.base': 'Net salary must be a number',
      'number.positive': 'Net salary must be positive',
      'number.precision': 'Net salary can have maximum 2 decimal places'
    }),
  paymentDate: Joi.date().iso().optional(),
  status: Joi.string().valid('pending', 'processed', 'approved', 'rejected', 'paid').default('pending'),
  notes: Joi.string().max(1000).optional()
});
const validatePayroll = (data) => payrollSchema.validate(data, { abortEarly: false });

// Payroll update schema
const payrollUpdateSchema = Joi.object({
  basicSalary: Joi.number().positive().precision(2).optional(),
  allowances: Joi.array().items(
    Joi.object({
      name: Joi.string().max(255).required(),
      amount: Joi.number().positive().precision(2).required(),
      type: Joi.string().valid('allowance', 'bonus', 'overtime').required(),
      taxable: Joi.boolean().default(true),
      description: Joi.string().max(500).optional()
    })
  ).optional(),
  deductions: Joi.array().items(
    Joi.object({
      name: Joi.string().max(255).required(),
      amount: Joi.number().positive().precision(2).required(),
      type: Joi.string().valid('tax', 'social_security', 'loan', 'other').required(),
      mandatory: Joi.boolean().default(false),
      description: Joi.string().max(500).optional()
    })
  ).optional(),
  netSalary: Joi.number().positive().precision(2).optional(),
  paymentDate: Joi.date().iso().optional(),
  status: Joi.string().valid('pending', 'processed', 'approved', 'rejected', 'paid').optional(),
  approvalStage: Joi.number().integer().min(0).optional(),
  approvedBy: Joi.number().integer().positive().optional(),
  approvedDate: Joi.date().iso().optional(),
  rejectedBy: Joi.number().integer().positive().optional(),
  rejectedDate: Joi.date().iso().optional(),
  rejectionReason: Joi.string().max(1000).optional(),
  notes: Joi.string().max(1000).optional()
});
const validatePayrollUpdate = (data) => payrollUpdateSchema.validate(data, { abortEarly: false });

// Payroll processing schema
const payrollProcessingSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2030).required(),
  employeeIds: Joi.array().items(
    Joi.number().integer().positive()
  ).min(1).required(),
  paymentDate: Joi.date().iso().optional(),
  includeOvertime: Joi.boolean().default(true),
  includeAllowances: Joi.boolean().default(true),
  includeDeductions: Joi.boolean().default(true),
  autoApprove: Joi.boolean().default(false),
  sendNotifications: Joi.boolean().default(true)
});
const validatePayrollProcessing = (data) => payrollProcessingSchema.validate(data, { abortEarly: false });

// Payroll approval schema
const payrollApprovalSchema = Joi.object({
  stage: Joi.number().integer().min(1).required(),
  comments: Joi.string().max(1000).optional(),
  nextStage: Joi.number().integer().min(1).optional(),
  conditions: Joi.string().max(1000).optional()
});
const validatePayrollApproval = (data) => payrollApprovalSchema.validate(data, { abortEarly: false });

// Payroll rejection schema
const payrollRejectionSchema = Joi.object({
  stage: Joi.number().integer().min(1).required(),
  reason: Joi.string().max(255).required(),
  comments: Joi.string().max(1000).optional()
});
const validatePayrollRejection = (data) => payrollRejectionSchema.validate(data, { abortEarly: false });

// Salary component schema
const salaryComponentSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  name: Joi.string().max(255).required(),
  type: Joi.string().valid('allowance', 'deduction').required(),
  amount: Joi.number().positive().precision(2).required(),
  percentage: Joi.number().positive().precision(2).max(100).optional(),
  isPercentage: Joi.boolean().default(false),
  description: Joi.string().max(500).optional(),
  effectiveDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('effectiveDate')).optional(),
  isActive: Joi.boolean().default(true)
});
const validateSalaryComponent = (data) => salaryComponentSchema.validate(data, { abortEarly: false });

// Payroll statistics query schema
const payrollStatisticsSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2020).max(2030).optional(),
  departmentId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
});
const validatePayrollStatistics = (data) => payrollStatisticsSchema.validate(data, { abortEarly: false });

// Payroll query parameters schema
const payrollQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  employeeId: Joi.number().integer().positive().optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2020).max(2030).optional(),
  status: Joi.string().valid('pending', 'processed', 'approved', 'rejected', 'paid').optional(),
  departmentId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'paymentDate', 'netSalary', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  search: Joi.string().max(255).optional()
});
const validatePayrollQuery = (data) => payrollQuerySchema.validate(data, { abortEarly: false });

module.exports = {
  payrollSchema,
  validatePayroll,
  payrollUpdateSchema,
  validatePayrollUpdate,
  payrollProcessingSchema,
  validatePayrollProcessing,
  payrollApprovalSchema,
  validatePayrollApproval,
  payrollRejectionSchema,
  validatePayrollRejection,
  salaryComponentSchema,
  validateSalaryComponent,
  payrollStatisticsSchema,
  validatePayrollStatistics,
  payrollQuerySchema,
  validatePayrollQuery
}; 