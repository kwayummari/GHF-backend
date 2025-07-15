const express = require('express');
const meetingController = require('../controllers/meetingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
    createMeetingValidator,
    updateMeetingValidator,
    createTaskValidator,
    updateTaskValidator,
    addAttendeeValidator,
} = require('../validators/meetingValidator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Meeting:
 *       type: object
 *       required:
 *         - meeting_title
 *         - meeting_date
 *         - start_time
 *         - end_time
 *         - chairperson
 *         - organizer
 *       properties:
 *         id:
 *           type: integer
 *         meeting_title:
 *           type: string
 *         meeting_type:
 *           type: string
 *           enum: [board, management, department, team, project, one_on_one, client]
 *         meeting_date:
 *           type: string
 *           format: date
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *         location:
 *           type: string
 *         is_virtual:
 *           type: boolean
 *         meeting_link:
 *           type: string
 *         chairperson:
 *           type: string
 *         organizer:
 *           type: string
 *         agenda_items:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *     MeetingAttendee:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         attendance_status:
 *           type: string
 *           enum: [invited, confirmed, attended, absent, cancelled]
 *         is_required:
 *           type: boolean
 *     MeetingTask:
 *       type: object
 *       required:
 *         - task_description
 *         - assigned_to
 *         - due_date
 *       properties:
 *         id:
 *           type: integer
 *         task_description:
 *           type: string
 *         assigned_to:
 *           type: string
 *         due_date:
 *           type: string
 *           format: date
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, cancelled, overdue]
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 */

/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Get all meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *       - in: query
 *         name: meeting_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meetings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', meetingController.getAllMeetings);

/**
 * @swagger
 * /meetings/my-meetings:
 *   get:
 *     summary: Get user's meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, today, upcoming, past]
 *           default: all
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User meetings retrieved successfully
 */
router.get('/my-meetings', meetingController.getUserMeetings);

/**
 * @swagger
 * /meetings/statistics:
 *   get:
 *     summary: Get meeting statistics
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meeting statistics retrieved successfully
 */
router.get('/statistics', meetingController.getMeetingStatistics);

/**
 * @swagger
 * /meetings/tasks:
 *   get:
 *     summary: Get all meeting tasks
 *     tags: [Meeting Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: assigned_user_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meeting tasks retrieved successfully
 */
router.get('/tasks', meetingController.getAllMeetingTasks);

/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Create a new meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meeting_title
 *               - meeting_date
 *               - start_time
 *               - end_time
 *               - chairperson
 *               - organizer
 *             properties:
 *               meeting_title:
 *                 type: string
 *               meeting_type:
 *                 type: string
 *               meeting_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               location:
 *                 type: string
 *               is_virtual:
 *                 type: boolean
 *               meeting_link:
 *                 type: string
 *               chairperson:
 *                 type: string
 *               organizer:
 *                 type: string
 *               agenda_items:
 *                 type: array
 *                 items:
 *                   type: string
 *               attendees:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MeetingAttendee'
 *     responses:
 *       201:
 *         description: Meeting created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', createMeetingValidator, validateRequest, meetingController.createMeeting);

/**
 * @swagger
 * /meetings/{id}:
 *   get:
 *     summary: Get meeting by ID
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meeting retrieved successfully
 *       404:
 *         description: Meeting not found
 */
router.get('/:id', meetingController.getMeetingById);

/**
 * @swagger
 * /meetings/{id}:
 *   put:
 *     summary: Update meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Meeting'
 *     responses:
 *       200:
 *         description: Meeting updated successfully
 *       404:
 *         description: Meeting not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', updateMeetingValidator, validateRequest, meetingController.updateMeeting);

/**
 * @swagger
 * /meetings/{id}:
 *   delete:
 *     summary: Delete meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meeting deleted successfully
 *       404:
 *         description: Meeting not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', meetingController.deleteMeeting);

/**
 * @swagger
 * /meetings/{id}/status:
 *   patch:
 *     summary: Update meeting status
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 enum: [scheduled, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Meeting status updated successfully
 *       404:
 *         description: Meeting not found
 */
router.patch('/:id/status', meetingController.updateMeetingStatus);

/**
 * @swagger
 * /meetings/{meetingId}/attendees:
 *   get:
 *     summary: Get meeting attendees
 *     tags: [Meeting Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attendees retrieved successfully
 */
router.get('/:meetingId/attendees', meetingController.getMeetingAttendees);

/**
 * @swagger
 * /meetings/{meetingId}/attendees:
 *   post:
 *     summary: Add meeting attendee
 *     tags: [Meeting Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               is_required:
 *                 type: boolean
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Attendee added successfully
 *       409:
 *         description: Attendee already exists
 */
router.post('/:meetingId/attendees', addAttendeeValidator, validateRequest, meetingController.addMeetingAttendee);

/**
 * @swagger
 * /meetings/{meetingId}/attendees/{attendeeId}/status:
 *   patch:
 *     summary: Update attendee status
 *     tags: [Meeting Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: attendeeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendance_status
 *             properties:
 *               attendance_status:
 *                 type: string
 *                 enum: [invited, confirmed, attended, absent, cancelled]
 *     responses:
 *       200:
 *         description: Attendee status updated successfully
 *       404:
 *         description: Attendee not found
 */
router.patch('/:meetingId/attendees/:attendeeId/status', meetingController.updateAttendeeStatus);

/**
 * @swagger
 * /meetings/{meetingId}/tasks:
 *   get:
 *     summary: Get meeting tasks
 *     tags: [Meeting Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: assigned_user_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meeting tasks retrieved successfully
 */
router.get('/:meetingId/tasks', meetingController.getMeetingTasks);

/**
 * @swagger
 * /meetings/{meetingId}/tasks:
 *   post:
 *     summary: Create meeting task
 *     tags: [Meeting Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_description
 *               - assigned_to
 *               - due_date
 *             properties:
 *               task_description:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *               assigned_user_id:
 *                 type: integer
 *               due_date:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meeting task created successfully
 *       404:
 *         description: Meeting not found
 */
router.post('/:meetingId/tasks', createTaskValidator, validateRequest, meetingController.createMeetingTask);

/**
 * @swagger
 * /meetings/tasks/{taskId}:
 *   put:
 *     summary: Update meeting task
 *     tags: [Meeting Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeetingTask'
 *     responses:
 *       200:
 *         description: Meeting task updated successfully
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:taskId', updateTaskValidator, validateRequest, meetingController.updateMeetingTask);

/**
 * @swagger
 * /meetings/tasks/{taskId}/progress:
 *   patch:
 *     summary: Update task progress
 *     tags: [Meeting Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Task progress updated successfully
 *       404:
 *         description: Task not found
 */
router.patch('/tasks/:taskId/progress', meetingController.updateTaskProgress);

/**
 * @swagger
 * /meetings/tasks/{taskId}:
 *   delete:
 *     summary: Delete meeting task
 *     tags: [Meeting Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meeting task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:taskId', meetingController.deleteMeetingTask);

/**
 * @swagger
 * /meetings/{meetingId}/notifications:
 *   post:
 *     summary: Send meeting notifications
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [reminder, update, cancellation, reschedule]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *       404:
 *         description: Meeting not found
 */
router.post('/:meetingId/notifications', meetingController.sendMeetingNotifications);

module.exports = router;