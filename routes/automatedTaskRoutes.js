const express = require('express');
const router = express.Router();
const automatedTaskController = require('../controllers/automatedTaskController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Automated Task Routes
router.get('/', auth, automatedTaskController.getAllTasks);
router.post('/', [auth, checkRole('admin', 'manager')], automatedTaskController.createTask);
router.put('/:taskId/status', [auth, checkRole('admin', 'manager')], automatedTaskController.updateTaskStatus);
router.post('/:taskId/run', [auth, checkRole('admin', 'manager')], automatedTaskController.runTask);
router.get('/:taskId/history', auth, automatedTaskController.getTaskHistory);

module.exports = router;
