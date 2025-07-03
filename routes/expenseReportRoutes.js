const express = require('express');
const router = express.Router();
const expenseReportController = require('../controllers/expenseReportController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Expense Report routes
router.get('/', auth, expenseReportController.getAllExpenseReports);
router.post('/', [auth, checkRole('finance', 'manager')], expenseReportController.createExpenseReport);
router.post('/:reportId/submit', [auth, checkRole('finance', 'manager')], expenseReportController.submitExpenseReport);
router.post('/:reportId/approve', [auth, checkRole('finance', 'admin')], expenseReportController.approveExpenseReport);
router.get('/statistics', [auth, checkRole('finance', 'admin')], expenseReportController.getExpenseReportStatistics);

module.exports = router;
