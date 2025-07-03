const Joi = require('joi');

// Create requisition validation
const createRequisitionSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    'string.base': 'Title must be a string',
    'string.max': 'Title cannot exceed 255 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().optional().messages({
    'string.base': 'Description must be a string'
  }),
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive',
    'any.required': 'Department ID is required'
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().messages({
    'string.base': 'Priority must be a string',
    'any.only': 'Priority must be one of: low, medium, high, urgent'
  }),
  required_date: Joi.date().iso().required().messages({
    'date.base': 'Required date must be a valid date',
    'date.format': 'Required date must be in ISO format (YYYY-MM-DD)',
    'any.required': 'Required date is required'
  }),
  budget_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Budget ID must be a number',
    'number.integer': 'Budget ID must be an integer',
    'number.positive': 'Budget ID must be positive'
  }),
  estimated_cost: Joi.number().precision(2).positive().required().messages({
    'number.base': 'Estimated cost must be a number',
    'number.precision': 'Estimated cost can have maximum 2 decimal places',
    'number.positive': 'Estimated cost must be positive',
    'any.required': 'Estimated cost is required'
  }),
  justification: Joi.string().optional().messages({
    'string.base': 'Justification must be a string'
  }),
  notes: Joi.string().optional().messages({
    'string.base': 'Notes must be a string'
  }),
  items: Joi.array().items(
    Joi.object({
      item_name: Joi.string().max(255).required().messages({
        'string.base': 'Item name must be a string',
        'string.max': 'Item name cannot exceed 255 characters',
        'any.required': 'Item name is required'
      }),
      description: Joi.string().optional().messages({
        'string.base': 'Description must be a string'
      }),
      quantity: Joi.number().integer().positive().required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.positive': 'Quantity must be positive',
        'any.required': 'Quantity is required'
      }),
      unit_price: Joi.number().precision(2).positive().required().messages({
        'number.base': 'Unit price must be a number',
        'number.precision': 'Unit price can have maximum 2 decimal places',
        'number.positive': 'Unit price must be positive',
        'any.required': 'Unit price is required'
      }),
      specifications: Joi.string().optional().messages({
        'string.base': 'Specifications must be a string'
      }),
      category: Joi.string().max(100).optional().messages({
        'string.base': 'Category must be a string',
        'string.max': 'Category cannot exceed 100 characters'
      }),
      supplier_preference: Joi.string().max(255).optional().messages({
        'string.base': 'Supplier preference must be a string',
        'string.max': 'Supplier preference cannot exceed 255 characters'
      }),
      brand: Joi.string().max(100).optional().messages({
        'string.base': 'Brand must be a string',
        'string.max': 'Brand cannot exceed 100 characters'
      }),
      model: Joi.string().max(100).optional().messages({
        'string.base': 'Model must be a string',
        'string.max': 'Model cannot exceed 100 characters'
      }),
      unit_of_measure: Joi.string().max(50).optional().messages({
        'string.base': 'Unit of measure must be a string',
        'string.max': 'Unit of measure cannot exceed 50 characters'
      })
    })
  ).min(1).required().messages({
    'array.base': 'Items must be an array',
    'array.min': 'At least one item is required',
    'any.required': 'Items are required'
  })
});

// Update requisition validation (same as create, but all fields optional)
const updateRequisitionSchema = createRequisitionSchema.fork(Object.keys(createRequisitionSchema.describe().keys), (schema) => schema.optional());

// Search/query validation
const queryParamsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().max(255).optional(),
  status: Joi.string().valid('draft', 'pending', 'approved', 'rejected', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  department_id: Joi.number().integer().positive().optional(),
  budget_id: Joi.number().integer().positive().optional(),
  date_from: Joi.date().iso().optional(),
  date_to: Joi.date().iso().optional(),
  sort_by: Joi.string().valid('created_at', 'required_date', 'priority', 'status').optional(),
  sort_order: Joi.string().valid('asc', 'desc').optional()
});

// ID parameter validation
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be positive',
    'any.required': 'ID is required'
  })
});

module.exports = {
  createRequisitionSchema,
  updateRequisitionSchema,
  queryParamsSchema,
  idParamSchema
}; 