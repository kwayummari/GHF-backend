const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a meeting
 */
const createMeetingValidator = [
    body('meeting_title')
        .notEmpty()
        .withMessage('Meeting title is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Meeting title must be between 1 and 255 characters'),

    body('meeting_type')
        .optional()
        .isIn(['board', 'management', 'department', 'team', 'project', 'one_on_one', 'client'])
        .withMessage('Invalid meeting type'),

    body('meeting_date')
        .notEmpty()
        .withMessage('Meeting date is required')
        .isISO8601()
        .withMessage('Meeting date must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
            const meetingDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (meetingDate < today) {
                throw new Error('Meeting date cannot be in the past');
            }
            return true;
        }),

    body('start_time')
        .notEmpty()
        .withMessage('Start time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),

    body('end_time')
        .notEmpty()
        .withMessage('End time is required')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format')
        .custom((value, { req }) => {
            if (req.body.start_time && value <= req.body.start_time) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),

    body('location')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Location must not exceed 255 characters'),

    body('is_virtual')
        .optional()
        .isBoolean()
        .withMessage('is_virtual must be a boolean'),

    body('meeting_link')
        .optional()
        .custom((value, { req }) => {
            if (req.body.is_virtual && !value) {
                throw new Error('Meeting link is required for virtual meetings');
            }
            if (value && !value.match(/^https?:\/\/.+/)) {
                throw new Error('Meeting link must be a valid URL');
            }
            return true;
        }),

    body('chairperson')
        .notEmpty()
        .withMessage('Chairperson is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Chairperson name must be between 1 and 100 characters'),

    body('organizer')
        .notEmpty()
        .withMessage('Organizer is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Organizer name must be between 1 and 100 characters'),

    body('agenda_items')
        .optional()
        .isArray()
        .withMessage('Agenda items must be an array')
        .custom((items) => {
            if (items && items.length > 0) {
                for (const item of items) {
                    if (typeof item !== 'string' || item.trim().length === 0) {
                        throw new Error('All agenda items must be non-empty strings');
                    }
                }
            }
            return true;
        }),

    body('attendees')
        .optional()
        .isArray()
        .withMessage('Attendees must be an array'),

    body('attendees.*.name')
        .if(body('attendees').exists())
        .notEmpty()
        .withMessage('Attendee name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Attendee name must be between 1 and 100 characters'),

    body('attendees.*.email')
        .if(body('attendees').exists())
        .notEmpty()
        .withMessage('Attendee email is required')
        .isEmail()
        .withMessage('Attendee email must be valid'),

    body('attendees.*.role')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Attendee role must not exceed 100 characters'),

    body('attendees.*.is_required')
        .optional()
        .isBoolean()
        .withMessage('is_required must be a boolean'),

    body('attendees.*.user_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
];

/**
 * Validation rules for updating a meeting
 */
const updateMeetingValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Meeting ID must be a positive integer'),

    body('meeting_title')
        .optional()
        .notEmpty()
        .withMessage('Meeting title cannot be empty')
        .isLength({ min: 1, max: 255 })
        .withMessage('Meeting title must be between 1 and 255 characters'),

    body('meeting_type')
        .optional()
        .isIn(['board', 'management', 'department', 'team', 'project', 'one_on_one', 'client'])
        .withMessage('Invalid meeting type'),

    body('meeting_date')
        .optional()
        .isISO8601()
        .withMessage('Meeting date must be a valid date (YYYY-MM-DD)'),

    body('start_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),

    body('end_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format')
        .custom((value, { req }) => {
            if (req.body.start_time && value && value <= req.body.start_time) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),

    body('location')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Location must not exceed 255 characters'),

    body('is_virtual')
        .optional()
        .isBoolean()
        .withMessage('is_virtual must be a boolean'),

    body('meeting_link')
        .optional()
        .custom((value, { req }) => {
            if (value && !value.match(/^https?:\/\/.+/)) {
                throw new Error('Meeting link must be a valid URL');
            }
            return true;
        }),

    body('chairperson')
        .optional()
        .notEmpty()
        .withMessage('Chairperson cannot be empty')
        .isLength({ min: 1, max: 100 })
        .withMessage('Chairperson name must be between 1 and 100 characters'),

    body('organizer')
        .optional()
        .notEmpty()
        .withMessage('Organizer cannot be empty')
        .isLength({ min: 1, max: 100 })
        .withMessage('Organizer name must be between 1 and 100 characters'),

    body('agenda_items')
        .optional()
        .isArray()
        .withMessage('Agenda items must be an array'),

    body('status')
        .optional()
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
];

/**
 * Validation rules for creating a meeting task
 */
const createTaskValidator = [
    param('meetingId')
        .isInt({ min: 1 })
        .withMessage('Meeting ID must be a positive integer'),

    body('task_description')
        .notEmpty()
        .withMessage('Task description is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Task description must be between 1 and 1000 characters'),

    body('assigned_to')
        .notEmpty()
        .withMessage('Assigned to is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Assigned to must be between 1 and 100 characters'),

    body('assigned_user_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned user ID must be a positive integer'),

    body('due_date')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Due date must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
            const dueDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),

    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
];

/**
 * Validation rules for updating a meeting task
 */
const updateTaskValidator = [
    param('taskId')
        .isInt({ min: 1 })
        .withMessage('Task ID must be a positive integer'),

    body('task_description')
        .optional()
        .notEmpty()
        .withMessage('Task description cannot be empty')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Task description must be between 1 and 1000 characters'),

    body('assigned_to')
        .optional()
        .notEmpty()
        .withMessage('Assigned to cannot be empty')
        .isLength({ min: 1, max: 100 })
        .withMessage('Assigned to must be between 1 and 100 characters'),

    body('assigned_user_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned user ID must be a positive integer'),

    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date (YYYY-MM-DD)'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),

    body('status')
        .optional()
        .isIn(['not_started', 'in_progress', 'completed', 'cancelled', 'overdue'])
        .withMessage('Invalid status'),

    body('progress')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
];

/**
 * Validation rules for adding an attendee
 */
const addAttendeeValidator = [
    param('meetingId')
        .isInt({ min: 1 })
        .withMessage('Meeting ID must be a positive integer'),

    body('name')
        .notEmpty()
        .withMessage('Attendee name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Attendee name must be between 1 and 100 characters'),

    body('email')
        .notEmpty()
        .withMessage('Attendee email is required')
        .isEmail()
        .withMessage('Attendee email must be valid'),

    body('role')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Attendee role must not exceed 100 characters'),

    body('is_required')
        .optional()
        .isBoolean()
        .withMessage('is_required must be a boolean'),

    body('user_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters'),
];

/**
 * Validation rules for updating task progress
 */
const updateTaskProgressValidator = [
    param('taskId')
        .isInt({ min: 1 })
        .withMessage('Task ID must be a positive integer'),

    body('progress')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    body('status')
        .optional()
        .isIn(['not_started', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
];

/**
 * Validation rules for updating meeting status
 */
const updateMeetingStatusValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Meeting ID must be a positive integer'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
];

/**
 * Validation rules for updating attendee status
 */
const updateAttendeeStatusValidator = [
    param('meetingId')
        .isInt({ min: 1 })
        .withMessage('Meeting ID must be a positive integer'),

    param('attendeeId')
        .isInt({ min: 1 })
        .withMessage('Attendee ID must be a positive integer'),

    body('attendance_status')
        .notEmpty()
        .withMessage('Attendance status is required')
        .isIn(['invited', 'confirmed', 'attended', 'absent', 'cancelled'])
        .withMessage('Invalid attendance status'),
];

/**
 * Validation rules for sending meeting notifications
 */
const sendNotificationValidator = [
    param('meetingId')
        .isInt({ min: 1 })
        .withMessage('Meeting ID must be a positive integer'),

    body('type')
        .notEmpty()
        .withMessage('Notification type is required')
        .isIn(['reminder', 'update', 'cancellation', 'reschedule'])
        .withMessage('Invalid notification type'),

    body('message')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Message must not exceed 1000 characters'),
];

/**
 * Validation rules for query parameters
 */
const getMeetingsQueryValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('status')
        .optional()
        .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),

    query('meeting_type')
        .optional()
        .isIn(['board', 'management', 'department', 'team', 'project', 'one_on_one', 'client'])
        .withMessage('Invalid meeting type'),

    query('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in YYYY-MM-DD format'),

    query('date_from')
        .optional()
        .isISO8601()
        .withMessage('Date from must be in YYYY-MM-DD format'),

    query('date_to')
        .optional()
        .isISO8601()
        .withMessage('Date to must be in YYYY-MM-DD format'),

    query('search')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Search term must be between 1 and 255 characters'),
];

module.exports = {
    createMeetingValidator,
    updateMeetingValidator,
    createTaskValidator,
    updateTaskValidator,
    addAttendeeValidator,
    updateTaskProgressValidator,
    updateMeetingStatusValidator,
    updateAttendeeStatusValidator,
    sendNotificationValidator,
    getMeetingsQueryValidator,
};