const express = require('express');
const router = express.Router();
const budgetExpenseController = require('../controllers/budgetExpenseController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Budget Expense Routes
router.get('/', auth, budgetExpenseController.getAllExpenses);
router.post('/', [auth, checkRole('finance', 'manager')], budgetExpenseController.createExpense);
router.put('/:expenseId/status', [auth, checkRole('finance', 'manager')], budgetExpenseController.updateExpenseStatus);
router.get('/statistics', [auth, checkRole('finance', 'manager')], budgetExpenseController.getExpenseStatistics);

module.exports = router;
