// routes/leaveRoutes.js - Enhanced with delete endpoint

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { leaveApplicationValidator } = require('../validators/leaveValidator');


// Add these routes to your existing leaveRoutes.js

/**
 * @swagger
 * /api/v1/leaves/balance/{userId}:
 *   get:
 *     summary: Get leave balance for a user
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: User ID (optional, defaults to current user)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for balance calculation (defaults to current year)
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     year:
 *                       type: integer
 *                     balances:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           leaveTypeId:
 *                             type: integer
 *                           leaveTypeName:
 *                             type: string
 *                           allocated:
 *                             type: integer
 *                           used:
 *                             type: integer
 *                           remaining:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only view own balance
 */
router.get('/balance/:userId?', authenticate, leaveController.getLeaveBalances);

/**
 * @swagger
 * /api/v1/leaves/check-balance:
 *   post:
 *     summary: Check if leave application is within balance limits
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
 *               exclude_application_id:
 *                 type: integer
 *                 description: Application ID to exclude from balance calculation (for updates)
 *     responses:
 *       200:
 *         description: Balance check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     requestedDays:
 *                       type: integer
 *                     balance:
 *                       type: object
 *                     message:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/check-balance', authenticate, leaveController.checkLeaveBalance);

/**
 * @swagger
 * components:
 *   schemas:
 *     LeaveApplication:
 *       type: object
 *       required:
 *         - type_id
 *         - starting_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the leave application
 *         user_id:
 *           type: integer
 *           description: ID of the user applying for leave
 *         type_id:
 *           type: integer
 *           description: ID of the leave type
 *         starting_date:
 *           type: string
 *           format: date
 *           description: Start date of the leave
 *         end_date:
 *           type: string
 *           format: date
 *           description: End date of the leave
 *         days_requested:
 *           type: integer
 *           description: Number of days requested
 *         comment:
 *           type: string
 *           description: Additional comments
 *         attachment_id:
 *           type: integer
 *           description: ID of supporting document (required for sick leave)
 *         approval_status:
 *           type: string
 *           enum: [draft, pending, approved by supervisor, approved by hr, approved, rejected, cancelled]
 *           description: Current status of the leave application
 *         approver_id:
 *           type: integer
 *           description: ID of the user who approved/rejected the application
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by approval status
 *       - in: query
 *         name: type_id
 *         schema:
 *           type: integer
 *         description: Filter by leave type
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user (managers only)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of leave applications
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, leaveController.getAllLeaveApplications);

/**
 * @swagger
 * /api/v1/leaves/approvals:
 *   get:
 *     summary: Get leave applications for approval (manager queue)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: "pending,approved by supervisor"
 *         description: Filter by approval status
 *       - in: query
 *         name: type_id
 *         schema:
 *           type: integer
 *         description: Filter by leave type
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
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
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Leave applications for approval retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveApplication'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/approvals', authenticate, leaveController.getLeaveApplicationsForApproval);

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
 *         description: List of leave types
 *       401:
 *         description: Unauthorized
 */
router.get('/types', authenticate, leaveController.getLeaveTypes);

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
 *                 description: Document ID for supporting attachment (required for sick leave)
 *               save_as_draft:
 *                 type: boolean
 *                 description: Save as draft instead of submitting
 *                 default: false
 *               submit:
 *                 type: boolean
 *                 description: Submit the application
 *                 default: true
 *     responses:
 *       201:
 *         description: Leave application created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Overlapping leave application exists
 */
router.post('/', authenticate, leaveApplicationValidator, validateRequest, leaveController.createLeaveApplication);

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
 *                 description: New status for the leave application
 *               comment:
 *                 type: string
 *                 description: Approval/rejection comments
 *     responses:
 *       200:
 *         description: Leave status updated successfully
 *       400:
 *         description: Invalid status or application cannot be updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Leave application not found
 */
router.put('/:id/status', authenticate, leaveController.updateLeaveStatus);

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
 * /api/v1/leaves/{id}:
 *   delete:
 *     summary: Delete a draft leave application
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
 *         description: Leave application deleted successfully
 *       400:
 *         description: Cannot delete non-draft applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the owner of the application
 *       404:
 *         description: Leave application not found
 */
router.delete('/:id', authenticate, leaveController.deleteLeaveApplication);

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