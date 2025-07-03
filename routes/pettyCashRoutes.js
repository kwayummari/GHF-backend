const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const pettyCashController = require('../controllers/pettyCashController');

// Petty Cash Book routes
router.get('/books', [auth, checkRole('finance', 'admin')], pettyCashController.getAllPettyCashBooks);
router.post('/books', [auth, checkRole('finance', 'admin')], pettyCashController.createPettyCashBook);
router.get('/books/:id', [auth, checkRole('finance', 'admin')], pettyCashController.getPettyCashBookById);
router.put('/books/:id', [auth, checkRole('finance', 'admin')], pettyCashController.updatePettyCashBook);
router.delete('/books/:id', [auth, checkRole('finance', 'admin')], pettyCashController.deletePettyCashBook);
router.get('/books/export', [auth, checkRole('finance', 'admin')], pettyCashController.exportPettyCashBooks);

// Petty Cash Transaction routes
router.get('/transactions', [auth, checkRole('finance', 'admin')], pettyCashController.getAllPettyCashTransactions);
router.post('/transactions', [auth, checkRole('finance', 'admin')], pettyCashController.createPettyCashTransaction);
router.get('/transactions/:id', [auth, checkRole('finance', 'admin')], pettyCashController.getPettyCashTransactionById);
router.put('/transactions/:id', [auth, checkRole('finance', 'admin')], pettyCashController.updatePettyCashTransaction);
router.delete('/transactions/:id', [auth, checkRole('finance', 'admin')], pettyCashController.deletePettyCashTransaction);
router.get('/transactions/export', [auth, checkRole('finance', 'admin')], pettyCashController.exportPettyCashTransactions);

module.exports = router;
