const express = require('express');
const leaveController = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { leaveApplicationValidator, leaveStatusValidator } = require('../validators/leaveValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Leave management operations
 */

/**
 * @swagger
 * /api/v1/leaves/types:
 *   get:
 *     summary: Get all leave types
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of leave types
 *       401:
 *         description: Unauthorized
 */
router.get('/types', authenticate, leaveController.getAllLeaveTypes);

/**
 * @swagger
 * /api/v1/leaves/balance/{userId?}:
 *   get:
 *     summary: Get leave balance for user
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         description: User ID (optional, defaults to current user)
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only view own balance
 */
router.get('/balance/:userId?', authenticate, leaveController.getLeaveBalance);

/**
 * @swagger
 * /api/v1/leaves:
 *   post:
 *     summary: Create a new leave application
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_id
 *               - starting_date
 *               - end_date
 *             properties:
 *               type_id:
 *                 type: integer
 *                 description: Leave type ID
 *               starting_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of leave
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of leave
 *               comment:
 *                 type: string
 *                 description: Additional comments
 *               attachment_id:
 *                 type: integer
 *                 description: Document ID for supporting attachment
 *               save_as_draft:
 *                 type: boolean
 *                 description: Save as draft instead of submitting
 *                 default: false
 *     responses:
 *       201:
 *         description: Leave application created successfully
 *       400:
 *         description: Validation error or invalid date range
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave type not found
 *       409:
 *         description: Overlapping leave application exists
 */
router.post('/', authenticate, leaveApplicationValidator, validateRequest, leaveController.createLeaveApplication);

/**
 * @swagger
 * /api/v1/leaves:
 *   get:
 *     summary: Get all leave applications
 *     tags: [Leaves]
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
 *           enum: [draft, pending, approved by supervisor, approved by hr, approved, rejected]
 *         description: Filter by approval status
 *       - in: query
 *         name: type_id
 *         schema:
 *           type: integer
 *         description: Filter by leave type
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         description: Filter by employee ID
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (>=)
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (<=)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A paginated list of leave applications
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, leaveController.getAllLeaveApplications);

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   get:
 *     summary: Get leave application by ID
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     responses:
 *       200:
 *         description: Leave application details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Leave application not found
 */
router.get('/:id', authenticate, leaveController.getLeaveApplicationById);

/**
 * @swagger
 * /api/v1/leaves/{id}/status:
 *   put:
 *     summary: Update leave application status (approve/reject)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved by supervisor, approved by hr, approved, rejected]
 *                 description: New status
 *               comment:
 *                 type: string
 *                 description: Comment on approval/rejection
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 *       400:
 *         description: Invalid status change
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Leave application not found
 */
router.put('/:id/status', authenticate, leaveStatusValidator, validateRequest, leaveController.updateLeaveStatus);

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   put:
 *     summary: Update leave application details (for draft applications)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type_id:
 *                 type: integer
 *                 description: Leave type ID
 *               starting_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of leave
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of leave
 *               comment:
 *                 type: string
 *                 description: Additional comments
 *               attachment_id:
 *                 type: integer
 *                 description: Document ID for supporting attachment
 *               submit:
 *                 type: boolean
 *                 description: Submit the application (change status from draft to pending)
 *                 default: false
 *     responses:
 *       200:
 *         description: Leave application updated successfully
 *       400:
 *         description: Validation error or application not in draft status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the owner of the application
 *       404:
 *         description: Leave application not found
 *       409:
 *         description: Overlapping leave application exists
 */
router.put('/:id', authenticate, leaveApplicationValidator, validateRequest, leaveController.updateLeaveApplication);

/**
 * @swagger
 * /api/v1/leaves/{id}/cancel:
 *   put:
 *     summary: Cancel a leave application
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave application ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Leave application cancelled successfully
 *       400:
 *         description: Cannot cancel an approved leave that has already started
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Leave application not found
 */
router.put('/:id/cancel', authenticate, leaveController.cancelLeaveApplication);

module.exports = router;