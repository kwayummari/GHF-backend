const { body } = require('express-validator');

/**
 * Validation rules for creating a menu
 */
const menuValidator = [
    body('menu_name')
        .trim()
        .notEmpty().withMessage('Menu name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Menu name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Menu name can only contain letters, numbers, hyphens and underscores'),

    body('menu_label')
        .trim()
        .notEmpty().withMessage('Menu label is required')
        .isLength({ min: 2, max: 100 }).withMessage('Menu label must be between 2 and 100 characters'),

    body('menu_icon')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Menu icon cannot exceed 50 characters'),

    body('menu_url')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Menu URL cannot exceed 255 characters'),

    body('parent_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Parent ID must be a positive integer'),

    body('menu_order')
        .optional()
        .isInt({ min: 0 }).withMessage('Menu order must be a non-negative integer'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('Is active must be a boolean value'),

    body('permission_ids')
        .optional()
        .isArray().withMessage('Permission IDs must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                if (!value.every(id => Number.isInteger(id) && id > 0)) {
                    throw new Error('All permission IDs must be positive integers');
                }
            }
            return true;
        }),

    body('role_ids')
        .optional()
        .isArray().withMessage('Role IDs must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                if (!value.every(id => Number.isInteger(id) && id > 0)) {
                    throw new Error('All role IDs must be positive integers');
                }
            }
            return true;
        }),
];

/**
 * Validation rules for updating a menu
 */
const menuUpdateValidator = [
    body('menu_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Menu name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Menu name can only contain letters, numbers, hyphens and underscores'),

    body('menu_label')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Menu label must be between 2 and 100 characters'),

    body('menu_icon')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Menu icon cannot exceed 50 characters'),

    body('menu_url')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Menu URL cannot exceed 255 characters'),

    body('parent_id')
        .optional()
        .custom((value) => {
            if (value !== null && value !== undefined) {
                if (!Number.isInteger(value) || value < 1) {
                    throw new Error('Parent ID must be a positive integer or null');
                }
            }
            return true;
        }),

    body('menu_order')
        .optional()
        .isInt({ min: 0 }).withMessage('Menu order must be a non-negative integer'),

    body('is_active')
        .optional()
        .isBoolean().withMessage('Is active must be a boolean value'),

    body('permission_ids')
        .optional()
        .isArray().withMessage('Permission IDs must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                if (!value.every(id => Number.isInteger(id) && id > 0)) {
                    throw new Error('All permission IDs must be positive integers');
                }
            }
            return true;
        }),

    body('role_ids')
        .optional()
        .isArray().withMessage('Role IDs must be an array')
        .custom((value) => {
            if (value && value.length > 0) {
                if (!value.every(id => Number.isInteger(id) && id > 0)) {
                    throw new Error('All role IDs must be positive integers');
                }
            }
            return true;
        }),
];

module.exports = {
    menuValidator,
    menuUpdateValidator,
};