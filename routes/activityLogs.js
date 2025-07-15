const express = require('express');
const router = express.Router();
const activityLogsController = require('../controllers/activityLogsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { body, query } = require('express-validator');

// Validation rules
const logUserActionValidation = [
    body('action').notEmpty().withMessage('Action is required'),
    body('module').notEmpty().withMessage('Module is required'),
    body('description').notEmpty().withMessage('Description is required'),
];

const auditTrailValidation = [
    query('entity_type').notEmpty().withMessage('Entity type is required'),
    query('entity_id').isInt().withMessage('Entity ID must be an integer'),
];

// Routes
router.get('/', authenticate, activityLogsController.getActivityLogs);
router.get('/recent', authenticate, activityLogsController.getRecentActivities);
router.get('/stats', authenticate, activityLogsController.getActivityStats);
router.get('/export', authenticate, activityLogsController.exportActivityLogs);
router.get('/audit-trail', authenticate, validate(auditTrailValidation), activityLogsController.getAuditTrail);
router.get('/:id', authenticate, activityLogsController.getActivityLogById);
router.post('/user-action', authenticate, validate(logUserActionValidation), activityLogsController.logUserAction);

module.exports = router;