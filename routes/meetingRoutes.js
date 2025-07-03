const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Meeting Routes
router.get('/', auth, meetingController.getAllMeetings);
router.post('/', [auth, checkRole('manager', 'hr')], meetingController.createMeeting);
router.put('/:meetingId/status', [auth, checkRole('manager', 'hr')], meetingController.updateMeetingStatus);
router.get('/:meetingId/attendance', auth, meetingController.getMeetingAttendance);
router.get('/:meetingId/tasks', auth, meetingController.getMeetingTasks);

module.exports = router;
