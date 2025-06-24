const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating timesheet
 */
const timesheetValidator = [
    body('month')
        .isInt({ min: 1, max: 12 })
        .withMessage('Month must be an integer between 1 and 12'),

    body('year')
        .isInt({ min: 2020, max: 2050 })
        .withMessage('Year must be an integer between 2020 and 2050'),

    body('user_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    body('status')
        .optional()
        .isIn(['draft', 'submitted'])
        .withMessage('Status must be either draft or submitted'),

    body('timesheet_entries')
        .isArray({ min: 1 })
        .withMessage('Timesheet entries must be a non-empty array'),

    body('timesheet_entries.*.date')
        .isISO8601()
        .withMessage('Entry date must be a valid date in ISO format'),

    body('timesheet_entries.*.attendance_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Attendance ID must be a positive integer'),

    body('timesheet_entries.*.arrival_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Arrival time must be in HH:MM or HH:MM:SS format'),

    body('timesheet_entries.*.departure_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Departure time must be in HH:MM or HH:MM:SS format'),

    body('timesheet_entries.*.working_hours')
        .optional()
        .isFloat({ min: 0, max: 24 })
        .withMessage('Working hours must be a number between 0 and 24'),

    body('timesheet_entries.*.activity')
        .notEmpty()
        .withMessage('Activity is required')
        .isLength({ max: 100 })
        .withMessage('Activity must be at most 100 characters'),

    body('timesheet_entries.*.description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must be at most 1000 characters'),

    body('timesheet_entries.*.status')
        .optional()
        .isIn(['present', 'absent', 'on leave', 'half day', 'holiday', 'weekend'])
        .withMessage('Status must be one of: present, absent, on leave, half day, holiday, weekend'),

    body('timesheet_entries.*.scheduler_status')
        .optional()
        .isIn(['working day', 'weekend', 'holiday in working day', 'holiday in weekend'])
        .withMessage('Scheduler status must be one of: working day, weekend, holiday in working day, holiday in weekend'),

    body('timesheet_entries.*.is_billable')
        .optional()
        .isBoolean()
        .withMessage('Is billable must be a boolean value'),

    body('timesheet_entries.*.project_code')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Project code must be at most 50 characters'),

    body('timesheet_entries.*.task_category')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Task category must be at most 50 characters'),
];

/**
 * Validation rules for updating timesheet
 */
const timesheetUpdateValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Timesheet ID must be a positive integer'),

    body('status')
        .optional()
        .isIn(['draft', 'submitted', 'approved', 'rejected', 'processing'])
        .withMessage('Status must be one of: draft, submitted, approved, rejected, processing'),

    body('supervisor_comments')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Supervisor comments must be at most 1000 characters'),

    body('timesheet_entries')
        .optional()
        .isArray()
        .withMessage('Timesheet entries must be an array'),

    body('timesheet_entries.*.date')
        .optional()
        .isISO8601()
        .withMessage('Entry date must be a valid date in ISO format'),

    body('timesheet_entries.*.attendance_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Attendance ID must be a positive integer'),

    body('timesheet_entries.*.arrival_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Arrival time must be in HH:MM or HH:MM:SS format'),

    body('timesheet_entries.*.departure_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Departure time must be in HH:MM or HH:MM:SS format'),

    body('timesheet_entries.*.working_hours')
        .optional()
        .isFloat({ min: 0, max: 24 })
        .withMessage('Working hours must be a number between 0 and 24'),

    body('timesheet_entries.*.activity')
        .optional()
        .if(body('timesheet_entries.*.activity').exists())
        .notEmpty()
        .withMessage('Activity cannot be empty if provided')
        .isLength({ max: 100 })
        .withMessage('Activity must be at most 100 characters'),

    body('timesheet_entries.*.description')
        .optional()
        .if(body('timesheet_entries.*.description').exists())
        .notEmpty()
        .withMessage('Description cannot be empty if provided')
        .isLength({ max: 1000 })
        .withMessage('Description must be at most 1000 characters'),

    body('timesheet_entries.*.status')
        .optional()
        .isIn(['present', 'absent', 'on leave', 'half day', 'holiday', 'weekend'])
        .withMessage('Status must be one of: present, absent, on leave, half day, holiday, weekend'),

    body('timesheet_entries.*.scheduler_status')
        .optional()
        .isIn(['working day', 'weekend', 'holiday in working day', 'holiday in weekend'])
        .withMessage('Scheduler status must be one of: working day, weekend, holiday in working day, holiday in weekend'),

    body('timesheet_entries.*.is_billable')
        .optional()
        .isBoolean()
        .withMessage('Is billable must be a boolean value'),

    body('timesheet_entries.*.project_code')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Project code must be at most 50 characters'),

    body('timesheet_entries.*.task_category')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Task category must be at most 50 characters'),
];

/**
 * Validation rules for timesheet approval/rejection
 */
const timesheetApprovalValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Timesheet ID must be a positive integer'),

    body('comments')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comments must be at most 1000 characters'),

    body('reason')
        .if(body('status').equals('rejected'))
        .notEmpty()
        .withMessage('Rejection reason is required when rejecting timesheet')
        .isLength({ max: 500 })
        .withMessage('Rejection reason must be at most 500 characters'),
];

/**
 * Validation rules for timesheet query parameters
 */
const timesheetQueryValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be an integer between 1 and 100'),

    query('month')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('Month must be an integer between 1 and 12'),

    query('year')
        .optional()
        .isInt({ min: 2020, max: 2050 })
        .withMessage('Year must be an integer between 2020 and 2050'),

    query('user_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    query('department_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Department ID must be a positive integer'),

    query('status')
        .optional()
        .isIn(['draft', 'submitted', 'approved', 'rejected', 'processing'])
        .withMessage('Status must be one of: draft, submitted, approved, rejected, processing'),
];

/**
 * Validation rules for timesheet ID parameter
 */
const timesheetIdValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Timesheet ID must be a positive integer'),
];

/**
 * Validation rules for timesheet rejection
 */
const timesheetRejectionValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Timesheet ID must be a positive integer'),

    body('reason')
        .notEmpty()
        .withMessage('Rejection reason is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Rejection reason must be between 10 and 500 characters'),

    body('comments')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comments must be at most 1000 characters'),
];

module.exports = {
    timesheetValidator,
    timesheetUpdateValidator,
    timesheetApprovalValidator,
    timesheetQueryValidator,
    timesheetIdValidator,
    timesheetRejectionValidator,
};