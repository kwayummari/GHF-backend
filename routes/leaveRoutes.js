const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Leave Types Routes
router.get('/types', auth, leaveController.getLeaveTypes);

// Leave Balance Routes
router.get('/balance/:userId', auth, leaveController.getLeaveBalance);
router.get('/balance/:userId/:year', auth, leaveController.getLeaveBalance);

// Leave Request Routes
router.post('/request', auth, leaveController.requestLeave);
router.get('/history/:userId', auth, leaveController.getLeaveHistory);

// Leave Approval Routes (for managers)
router.put('/request/:requestId/approve', [auth, checkRole('manager', 'hr')], leaveController.updateLeaveRequest);
router.put('/request/:requestId/reject', [auth, checkRole('manager', 'hr')], leaveController.updateLeaveRequest);

module.exports = router;
