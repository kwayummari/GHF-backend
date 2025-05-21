const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { clockInValidator, clockOutValidator, attendanceUpdateValidator } = require('../validators/attendanceValidator');
const { holidayValidator } = require('../validators/holidayValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management operations
 */

/**
 * @swagger
 * /api/v1/attendance/clock-in:
 *   post:
 *     summary: Clock in for the day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for attendance (defaults to current date)
 *               activity:
 *                 type: string
 *                 description: Activity description for the day
 *     responses:
 *       200:
 *         description: Clock in successful
 *       201:
 *         description: New attendance record created
 *       400:
 *         description: Already clocked in for today
 *       401:
 *         description: Unauthorized
 */
router.post('/clock-in', authenticate, clockInValidator, validateRequest, attendanceController.clockIn);

/**
 * @swagger
 * /api/v1/attendance/clock-out:
 *   post:
 *     summary: Clock out for the day
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for attendance (defaults to current date)
 *               activity:
 *                 type: string
 *                 description: Updated activity description
 *               description:
 *                 type: string
 *                 description: Additional notes or description
 *     responses:
 *       200:
 *         description: Clock out successful
 *       400:
 *         description: Must clock in before clocking out or already clocked out
 *       401:
 *         description: Unauthorized
 */
router.post('/clock-out', authenticate, clockOutValidator, validateRequest, attendanceController.clockOut);

/**
 * @swagger
 * /api/v1/attendance/my-attendance:
 *   get:
 *     summary: Get current user's attendance records
 *     tags: [Attendance]
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
 *           default: 31
 *         description: Number of records per page
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [absent, present, on leave, half day]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: List of attendance records with summary
 *       401:
 *         description: Unauthorized
 */
router.get('/my-attendance', authenticate, attendanceController.getMyAttendance);

/**
 * @swagger
 * /api/v1/attendance/employees/{id}:
 *   get:
 *     summary: Get attendance records for a specific employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
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
 *           default: 31
 *         description: Number of records per page
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [absent, present, on leave, half day]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: List of employee attendance records with summary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Employee not found
 */
router.get('/employees/:id', authenticate, authorize(['Admin', 'HR Manager', 'Department Head']), attendanceController.getEmployeeAttendance);

/**
 * @swagger
 * /api/v1/attendance/departments/{department_id}/report:
 *   get:
 *     summary: Get attendance report for all employees in a department
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: department_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for report (defaults to current date)
 *     responses:
 *       200:
 *         description: Department attendance report
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 */
router.get('/departments/:department_id/report', authenticate, authorize(['Admin', 'HR Manager', 'Department Head']), attendanceController.getDepartmentAttendanceReport);

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   put:
 *     summary: Update attendance record (admin function)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               arrival_time:
 *                 type: string
 *                 format: date-time
 *               departure_time:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [absent, present, on leave, half day]
 *               description:
 *                 type: string
 *               activity:
 *                 type: string
 *               scheduler_status:
 *                 type: string
 *                 enum: [working day, weekend, holiday in working day, holiday in weekend]
 *               approval_status:
 *                 type: string
 *                 enum: [draft, approved, rejected]
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Attendance record not found
 */
router.put('/:id', authenticate, authorize(['Admin', 'HR Manager']), attendanceUpdateValidator, validateRequest, attendanceController.updateAttendance);

/**
 * @swagger
 * /api/v1/attendance/work-schedule:
 *   get:
 *     summary: Get work schedule
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Work schedule retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/work-schedule', authenticate, attendanceController.getWorkSchedule);

/**
 * @swagger
 * /api/v1/attendance/work-schedule/{id}:
 *   put:
 *     summary: Update work schedule
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Work schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Work start time (HH:MM:SS)
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: Work end time (HH:MM:SS)
 *     responses:
 *       200:
 *         description: Work schedule updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Work schedule not found
 */
router.put('/work-schedule/:id', authenticate, authorize(['Admin']), attendanceController.updateWorkSchedule);

/**
 * @swagger
 * /api/v1/attendance/holidays:
 *   get:
 *     summary: Get holidays
 *     tags: [Attendance]
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
 *         description: List of holidays
 *       401:
 *         description: Unauthorized
 */
router.get('/holidays', authenticate, attendanceController.getHolidays);

/**
 * @swagger
 * /api/v1/attendance/holidays:
 *   post:
 *     summary: Create a new holiday
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *                 description: Holiday name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Holiday date
 *               is_workday:
 *                 type: boolean
 *                 description: Whether employees work on this holiday
 *                 default: false
 *     responses:
 *       201:
 *         description: Holiday created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Holiday already exists on this date
 */
router.post('/holidays', authenticate, authorize(['Admin', 'HR Manager']), holidayValidator, validateRequest, attendanceController.createHoliday);

/**
 * @swagger
 * /api/v1/attendance/holidays/{id}:
 *   put:
 *     summary: Update holiday
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Holiday ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Holiday name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Holiday date
 *               is_workday:
 *                 type: boolean
 *                 description: Whether employees work on this holiday
 *     responses:
 *       200:
 *         description: Holiday updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Holiday not found
 *       409:
 *         description: Holiday already exists on this date
 */
router.put('/holidays/:id', authenticate, authorize(['Admin', 'HR Manager']), holidayValidator, validateRequest, attendanceController.updateHoliday);

/**
 * @swagger
 * /api/v1/attendance/holidays/{id}:
 *   delete:
 *     summary: Delete holiday
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Holiday ID
 *     responses:
 *       200:
 *         description: Holiday deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions or non-editable holiday
 *       404:
 *         description: Holiday not found
 */
router.delete('/holidays/:id', authenticate, authorize(['Admin', 'HR Manager']), attendanceController.deleteHoliday);

module.exports = router;