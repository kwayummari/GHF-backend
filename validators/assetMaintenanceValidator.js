const Joi = require('joi');

/**
 * Validation schemas for asset maintenance endpoints
 */

// Create asset maintenance validation
const createAssetMaintenanceSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Asset ID must be a number',
      'number.integer': 'Asset ID must be an integer',
      'number.positive': 'Asset ID must be positive',
      'any.required': 'Asset ID is required'
    }),
  maintenance_type: Joi.string().valid('preventive', 'corrective', 'emergency').required()
    .messages({
      'string.base': 'Maintenance type must be a string',
      'any.only': 'Maintenance type must be one of: preventive, corrective, emergency',
      'any.required': 'Maintenance type is required'
    }),
  title: Joi.string().max(255).required()
    .messages({
      'string.base': 'Title must be a string',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string().optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  scheduled_date: Joi.date().iso().required()
    .messages({
      'date.base': 'Scheduled date must be a valid date',
      'date.format': 'Scheduled date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Scheduled date is required'
    }),
  estimated_duration: Joi.string().max(50).optional()
    .messages({
      'string.base': 'Estimated duration must be a string',
      'string.max': 'Estimated duration cannot exceed 50 characters'
    }),
  estimated_cost: Joi.number().precision(2).positive().optional()
    .messages({
      'number.base': 'Estimated cost must be a number',
      'number.precision': 'Estimated cost can have maximum 2 decimal places',
      'number.positive': 'Estimated cost must be positive'
    }),
  assigned_to: Joi.string().max(255).optional()
    .messages({
      'string.base': 'Assigned to must be a string',
      'string.max': 'Assigned to cannot exceed 255 characters'
    }),
  vendor_id: Joi.string().max(100).optional()
    .messages({
      'string.base': 'Vendor ID must be a string',
      'string.max': 'Vendor ID cannot exceed 100 characters'
    }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional()
    .messages({
      'string.base': 'Priority must be a string',
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  maintenance_category: Joi.string().max(100).optional()
    .messages({
      'string.base': 'Maintenance category must be a string',
      'string.max': 'Maintenance category cannot exceed 100 characters'
    }),
  notes: Joi.string().optional()
    .messages({
      'string.base': 'Notes must be a string'
    })
});

// Update asset maintenance validation
const updateAssetMaintenanceSchema = Joi.object({
  maintenance_type: Joi.string().valid('preventive', 'corrective', 'emergency').optional()
    .messages({
      'string.base': 'Maintenance type must be a string',
      'any.only': 'Maintenance type must be one of: preventive, corrective, emergency'
    }),
  title: Joi.string().max(255).optional()
    .messages({
      'string.base': 'Title must be a string',
      'string.max': 'Title cannot exceed 255 characters'
    }),
  description: Joi.string().optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  scheduled_date: Joi.date().iso().optional()
    .messages({
      'date.base': 'Scheduled date must be a valid date',
      'date.format': 'Scheduled date must be in ISO format (YYYY-MM-DD)'
    }),
  estimated_duration: Joi.string().max(50).optional()
    .messages({
      'string.base': 'Estimated duration must be a string',
      'string.max': 'Estimated duration cannot exceed 50 characters'
    }),
  estimated_cost: Joi.number().precision(2).positive().optional()
    .messages({
      'number.base': 'Estimated cost must be a number',
      'number.precision': 'Estimated cost can have maximum 2 decimal places',
      'number.positive': 'Estimated cost must be positive'
    }),
  assigned_to: Joi.string().max(255).optional()
    .messages({
      'string.base': 'Assigned to must be a string',
      'string.max': 'Assigned to cannot exceed 255 characters'
    }),
  vendor_id: Joi.string().max(100).optional()
    .messages({
      'string.base': 'Vendor ID must be a string',
      'string.max': 'Vendor ID cannot exceed 100 characters'
    }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional()
    .messages({
      'string.base': 'Priority must be a string',
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  maintenance_category: Joi.string().max(100).optional()
    .messages({
      'string.base': 'Maintenance category must be a string',
      'string.max': 'Maintenance category cannot exceed 100 characters'
    }),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: scheduled, in_progress, completed, cancelled'
    }),
  completion_percentage: Joi.number().integer().min(0).max(100).optional()
    .messages({
      'number.base': 'Completion percentage must be a number',
      'number.integer': 'Completion percentage must be an integer',
      'number.min': 'Completion percentage must be at least 0',
      'number.max': 'Completion percentage cannot exceed 100'
    }),
  notes: Joi.string().optional()
    .messages({
      'string.base': 'Notes must be a string'
    })
});

// Complete maintenance validation
const completeMaintenanceSchema = Joi.object({
  completed_date: Joi.date().iso().optional()
    .messages({
      'date.base': 'Completed date must be a valid date',
      'date.format': 'Completed date must be in ISO format (YYYY-MM-DD)'
    }),
  actual_duration: Joi.string().max(50).optional()
    .messages({
      'string.base': 'Actual duration must be a string',
      'string.max': 'Actual duration cannot exceed 50 characters'
    }),
  actual_cost: Joi.number().precision(2).positive().optional()
    .messages({
      'number.base': 'Actual cost must be a number',
      'number.precision': 'Actual cost can have maximum 2 decimal places',
      'number.positive': 'Actual cost must be positive'
    }),
  completion_notes: Joi.string().optional()
    .messages({
      'string.base': 'Completion notes must be a string'
    })
});

// Schedule maintenance validation
const scheduleMaintenanceSchema = Joi.object({
  maintenance_type: Joi.string().valid('preventive', 'corrective', 'emergency').required()
    .messages({
      'string.base': 'Maintenance type must be a string',
      'any.only': 'Maintenance type must be one of: preventive, corrective, emergency',
      'any.required': 'Maintenance type is required'
    }),
  scheduled_date: Joi.date().iso().required()
    .messages({
      'date.base': 'Scheduled date must be a valid date',
      'date.format': 'Scheduled date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Scheduled date is required'
    }),
  estimated_duration: Joi.string().max(50).optional()
    .messages({
      'string.base': 'Estimated duration must be a string',
      'string.max': 'Estimated duration cannot exceed 50 characters'
    })
});

// Query parameters validation
const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(100).optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: scheduled, in_progress, completed, cancelled'
    }),
  type: Joi.string().valid('preventive', 'corrective', 'emergency').optional()
    .messages({
      'string.base': 'Type must be a string',
      'any.only': 'Type must be one of: preventive, corrective, emergency'
    }),
  asset_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Asset ID must be a number',
      'number.integer': 'Asset ID must be an integer',
      'number.positive': 'Asset ID must be positive'
    }),
  search: Joi.string().max(255).optional()
    .messages({
      'string.base': 'Search must be a string',
      'string.max': 'Search cannot exceed 255 characters'
    }),
  sortBy: Joi.string().valid('created_at', 'scheduled_date', 'title', 'status', 'priority').optional()
    .messages({
      'string.base': 'Sort by must be a string',
      'any.only': 'Sort by must be one of: created_at, scheduled_date, title, status, priority'
    }),
  sortOrder: Joi.string().valid('ASC', 'DESC').optional()
    .messages({
      'string.base': 'Sort order must be a string',
      'any.only': 'Sort order must be one of: ASC, DESC'
    }),
  days_overdue: Joi.number().integer().min(1).optional()
    .messages({
      'number.base': 'Days overdue must be a number',
      'number.integer': 'Days overdue must be an integer',
      'number.min': 'Days overdue must be at least 1'
    }),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional()
    .messages({
      'string.base': 'Month must be a string',
      'string.pattern.base': 'Month must be in format YYYY-MM'
    }),
  period: Joi.string().valid('monthly', 'quarterly', 'yearly').optional()
    .messages({
      'string.base': 'Period must be a string',
      'any.only': 'Period must be one of: monthly, quarterly, yearly'
    }),
  year: Joi.number().integer().min(2000).max(2100).optional()
    .messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be at least 2000',
      'number.max': 'Year cannot exceed 2100'
    }),
  format: Joi.string().valid('xlsx', 'csv', 'pdf').optional()
    .messages({
      'string.base': 'Format must be a string',
      'any.only': 'Format must be one of: xlsx, csv, pdf'
    })
});

// ID parameter validation
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be positive',
      'any.required': 'ID is required'
    })
});

module.exports = {
  createAssetMaintenanceSchema,
  updateAssetMaintenanceSchema,
  completeMaintenanceSchema,
  scheduleMaintenanceSchema,
  queryParamsSchema,
  idParamSchema
}; 