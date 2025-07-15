const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const { errorResponse } = require('../utils/responseUtils');

/**
 * Validation middleware to handle express-validator results
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        if (Array.isArray(validations)) {
            await Promise.all(validations.map(validation => validation.run(req)));
        }

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value
            }));

            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'Validation failed',
                formattedErrors
            );
        }

        next();
    };
};

/**
 * Single validation check - use when you want to validate inline
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            'Validation failed',
            formattedErrors
        );
    }
    next();
};

/**
 * Custom validation for file uploads
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
const validateFileUpload = (options = {}) => {
    const {
        required = false,
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        fieldName = 'file'
    } = options;

    return (req, res, next) => {
        const file = req.file || req.files?.[fieldName];

        // Check if file is required
        if (required && !file) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'File is required',
                [{ field: fieldName, message: 'File is required' }]
            );
        }

        // If no file and not required, skip validation
        if (!file) {
            return next();
        }

        const errors = [];

        // Check file size
        if (file.size > maxSize) {
            errors.push({
                field: fieldName,
                message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
                value: `${Math.round(file.size / 1024 / 1024)}MB`
            });
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
            errors.push({
                field: fieldName,
                message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
                value: file.mimetype
            });
        }

        if (errors.length > 0) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'File validation failed',
                errors
            );
        }

        next();
    };
};

/**
 * Sanitize request data by removing unwanted fields
 * @param {Array} allowedFields - Array of allowed field names
 * @returns {Function} Express middleware function
 */
const sanitizeFields = (allowedFields) => {
    return (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            const sanitizedBody = {};
            allowedFields.forEach(field => {
                if (req.body.hasOwnProperty(field)) {
                    sanitizedBody[field] = req.body[field];
                }
            });
            req.body = sanitizedBody;
        }
        next();
    };
};

/**
 * Check if user has required permissions
 * @param {Array|string} permissions - Required permissions
 * @returns {Function} Express middleware function
 */
const requirePermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Authentication required'
            );
        }

        const userPermissions = req.user.permissions || [];
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

        const hasPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission) || req.user.role === 'admin'
        );

        if (!hasPermission) {
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                'Insufficient permissions',
                [{
                    field: 'permissions',
                    message: `Required permissions: ${requiredPermissions.join(', ')}`
                }]
            );
        }

        next();
    };
};

/**
 * Validate pagination parameters
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
const validatePagination = (options = {}) => {
    const {
        maxLimit = 100,
        defaultLimit = 10,
        defaultPage = 1
    } = options;

    return (req, res, next) => {
        // Validate and set page
        let page = parseInt(req.query.page) || defaultPage;
        if (page < 1) page = defaultPage;
        req.query.page = page;

        // Validate and set limit
        let limit = parseInt(req.query.limit) || defaultLimit;
        if (limit < 1) limit = defaultLimit;
        if (limit > maxLimit) limit = maxLimit;
        req.query.limit = limit;

        // Calculate offset
        req.query.offset = (page - 1) * limit;

        next();
    };
};

/**
 * Common validation rules that you can reuse
 */
const commonValidations = {
    email: {
        isEmail: {
            errorMessage: 'Please provide a valid email address'
        },
        normalizeEmail: true
    },

    password: {
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long'
        },
        matches: {
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            errorMessage: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
        }
    },

    name: {
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: 'Name must be between 2 and 50 characters'
        },
        matches: {
            options: /^[a-zA-Z\s]+$/,
            errorMessage: 'Name can only contain letters and spaces'
        }
    },

    phone: {
        matches: {
            options: /^[\+]?[1-9][\d]{0,15}$/,
            errorMessage: 'Please provide a valid phone number'
        }
    },

    id: {
        isInt: {
            options: { min: 1 },
            errorMessage: 'ID must be a positive integer'
        }
    }
};

module.exports = {
    validate,
    validateRequest,
    validateFileUpload,
    sanitizeFields,
    requirePermissions,
    validatePagination,
    commonValidations
};