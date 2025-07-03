const express = require('express');
const router = express.Router();
const timeOffController = require('../controllers/timeOffController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Time Off Routes
router.get('/policies', auth, timeOffController.getPolicies);
router.get('/balance/:userId', auth, timeOffController.getBalance);
router.get('/balance/:userId/:year', auth, timeOffController.getBalance);
router.post('/request', auth, timeOffController.requestTimeOff);
router.get('/history/:userId', auth, timeOffController.getTimeOffHistory);
router.put('/request/:requestId/approve', [auth, checkRole('manager', 'hr')], timeOffController.updateRequest);
router.put('/request/:requestId/reject', [auth, checkRole('manager', 'hr')], timeOffController.updateRequest);

module.exports = router;
