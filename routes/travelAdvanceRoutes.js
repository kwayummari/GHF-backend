const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const travelAdvanceController = require('../controllers/travelAdvanceController');

// Travel Advance Request routes
router.get('/', [auth, checkRole('finance', 'manager')], travelAdvanceController.getAllTravelAdvanceRequests);
router.post('/', [auth, checkRole('finance', 'manager')], travelAdvanceController.createTravelAdvanceRequest);
router.get('/:id', [auth, checkRole('finance', 'manager')], travelAdvanceController.getTravelAdvanceRequestById);
router.put('/:id', [auth, checkRole('finance', 'manager')], travelAdvanceController.updateTravelAdvanceRequest);
router.delete('/:id', [auth, checkRole('finance', 'admin')], travelAdvanceController.deleteTravelAdvanceRequest);
router.post('/:id/submit', [auth, checkRole('finance', 'manager')], travelAdvanceController.submitTravelAdvanceRequest);
router.post('/:id/approve', [auth, checkRole('finance', 'admin')], travelAdvanceController.approveTravelAdvanceRequest);
router.post('/:id/reject', [auth, checkRole('finance', 'admin')], travelAdvanceController.rejectTravelAdvanceRequest);

// Travel Advance Expense routes
router.get('/:requestId/expenses', [auth, checkRole('finance', 'manager')], travelAdvanceController.getTravelAdvanceExpenses);
router.post('/:requestId/expenses', [auth, checkRole('finance', 'manager')], travelAdvanceController.createTravelAdvanceExpense);
router.get('/:requestId/expenses/:expenseId', [auth, checkRole('finance', 'manager')], travelAdvanceController.getTravelAdvanceExpenseById);
router.put('/:requestId/expenses/:expenseId', [auth, checkRole('finance', 'manager')], travelAdvanceController.updateTravelAdvanceExpense);
router.delete('/:requestId/expenses/:expenseId', [auth, checkRole('finance', 'admin')], travelAdvanceController.deleteTravelAdvanceExpense);
router.post('/:requestId/expenses/:expenseId/approve', [auth, checkRole('finance', 'admin')], travelAdvanceController.approveTravelAdvanceExpense);

module.exports = router;
