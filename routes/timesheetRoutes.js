const express = require('express');
const timesheetController = require('../controllers/timesheetController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Timesheets
 *   description: Timesheet management operations (using attendance data)
 */

/**
 * @swagger
 * /api/v1/timesheets:
 *   get:
 *     summary: Get timesheet for specific month/year (aggregated attendance)
 *     tags: [Timesheets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for timesheet
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for timesheet (1-12)
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: User ID (for supervisors to view employee timesheets)
 *     responses:
 *       200:
 *         description: Timesheet retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Timesheet not found
 */
router.get('/', authenticate, timesheetController.getTimesheet);

/**
 * @swagger
 * /api/v1/timesheets/my:
 *   get:
 *     summary: Get current user's monthly timesheet summaries
 *     tags: [Timesheets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: User timesheets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, timesheetController.getMyTimesheets);

/**
 * @swagger
 * /api/v1/timesheets/team:
 *   get:
 *     summary: Get team timesheets (for supervisors)
 *     tags: [Timesheets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, approved, rejected]
 *         description: Filter by approval status
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Team timesheets retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/team', authenticate, authorize(['Admin', 'HR Manager', 'Department Head']), timesheetController.getTeamTimesheets);

/**
 * @swagger
 * /api/v1/timesheets/update:
 *   put:
 *     summary: Update timesheet entries (bulk update attendance records)
 *     tags: [Timesheets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timesheet_entries:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - date
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     user_id:
 *                       type: integer
 *                       description: User ID (optional, defaults to current user)
 *                     activity:
 *                       type: string
 *                       maxLength: 255
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [absent, present, on leave, half day]
 *     responses:
 *       200:
 *         description: Timesheet updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/update', authenticate, timesheetController.updateTimesheet);

/**
 * @swagger
 * /api/v1/timesheets/submit:
 *   put:
 *     summary: Submit timesheet for approval (bulk update attendance approval status)
 *     tags: [Timesheets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - year
 *             properties:
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               year:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *                 description: User ID (for admin/HR submitting for others)
 *     responses:
 *       200:
 *         description: Timesheet submitted successfully
 *       400:
 *         description: Invalid month/year or no draft records found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/submit', authenticate, timesheetController.submitTimesheet);

module.exports = router;