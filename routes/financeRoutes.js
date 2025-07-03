const express = require('express');
const financeController = require('../controllers/financeController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateRequest');
const multerUpload = require('../middlewares/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Finance
 *   description: Finance management operations
 */

// ==================== BUDGET MANAGEMENT ====================

/**
 * @swagger
 * /api/v1/finance/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Finance]
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
 *           enum: [draft, submitted, approved, rejected]
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: quarter_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budgets retrieved successfully
 */
router.get('/budgets', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.getAllBudgets);

/**
 * @swagger
 * /api/v1/finance/budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quarter_id
 *               - department_id
 *               - activity_name
 *               - responsible_person_id
 *               - amount
 *             properties:
 *               quarter_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               activity_name:
 *                 type: string
 *               responsible_person_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Budget created successfully
 */
router.post('/budgets', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.createBudget);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}:
 *   get:
 *     summary: Get budget by ID
 *     tags: [Finance]
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
 *         description: Budget retrieved successfully
 */
router.get('/budgets/:id', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.getBudgetById);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}:
 *   put:
 *     summary: Update budget
 *     tags: [Finance]
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
 *         description: Budget updated successfully
 */
router.put('/budgets/:id', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.updateBudget);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}:
 *   delete:
 *     summary: Delete budget
 *     tags: [Finance]
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
 *         description: Budget deleted successfully
 */
router.delete('/budgets/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteBudget);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}/approve:
 *   put:
 *     summary: Approve budget
 *     tags: [Finance]
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
 *         description: Budget approved successfully
 */
router.put('/budgets/:id/approve', authenticate, authorize(['Admin', 'Finance Manager']), financeController.approveBudget);

// ==================== EXPENSE REPORTS ====================

/**
 * @swagger
 * /api/v1/finance/expense-reports:
 *   get:
 *     summary: Get all expense reports
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense reports retrieved successfully
 */
router.get('/expense-reports', authenticate, financeController.getAllExpenseReports);

/**
 * @swagger
 * /api/v1/finance/expense-reports:
 *   post:
 *     summary: Create expense report
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - travel_advance_request_id
 *               - date
 *               - expense_title
 *               - expense_amount
 *               - deadline
 *             properties:
 *               travel_advance_request_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               expense_title:
 *                 type: string
 *               expense_amount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense report created successfully
 */
router.post('/expense-reports', authenticate, financeController.createExpenseReport);

/**
 * @swagger
 * /api/v1/finance/expense-reports/{id}:
 *   get:
 *     summary: Get expense report by ID
 *     tags: [Finance]
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
 *         description: Expense report retrieved successfully
 */
router.get('/expense-reports/:id', authenticate, financeController.getExpenseReportById);

/**
 * @swagger
 * /api/v1/finance/expense-reports/{id}:
 *   put:
 *     summary: Update expense report
 *     tags: [Finance]
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
 *         description: Expense report updated successfully
 */
router.put('/expense-reports/:id', authenticate, financeController.updateExpenseReport);

/**
 * @swagger
 * /api/v1/finance/expense-reports/{id}:
 *   delete:
 *     summary: Delete expense report
 *     tags: [Finance]
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
 *         description: Expense report deleted successfully
 */
router.delete('/expense-reports/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteExpenseReport);

/**
 * @swagger
 * /api/v1/finance/expense-reports/{id}/approve:
 *   put:
 *     summary: Approve expense report
 *     tags: [Finance]
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
 *         description: Expense report approved successfully
 */
router.put('/expense-reports/:id/approve', authenticate, authorize(['Admin', 'Finance Manager']), financeController.approveExpenseReport);

// ==================== PURCHASE REQUESTS ====================

/**
 * @swagger
 * /api/v1/finance/purchase-requests:
 *   get:
 *     summary: Get all purchase requests
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase requests retrieved successfully
 */
router.get('/purchase-requests', authenticate, financeController.getAllPurchaseRequests);

/**
 * @swagger
 * /api/v1/finance/purchase-requests:
 *   post:
 *     summary: Create purchase request
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item
 *               - budget_id
 *               - requester_id
 *               - quantity
 *             properties:
 *               item:
 *                 type: string
 *               budget_id:
 *                 type: integer
 *               requester_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               estimated_cost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Purchase request created successfully
 */
router.post('/purchase-requests', authenticate, financeController.createPurchaseRequest);

/**
 * @swagger
 * /api/v1/finance/purchase-requests/{id}:
 *   get:
 *     summary: Get purchase request by ID
 *     tags: [Finance]
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
 *         description: Purchase request retrieved successfully
 */
router.get('/purchase-requests/:id', authenticate, financeController.getPurchaseRequestById);

/**
 * @swagger
 * /api/v1/finance/purchase-requests/{id}:
 *   put:
 *     summary: Update purchase request
 *     tags: [Finance]
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
 *         description: Purchase request updated successfully
 */
router.put('/purchase-requests/:id', authenticate, financeController.updatePurchaseRequest);

/**
 * @swagger
 * /api/v1/finance/purchase-requests/{id}:
 *   delete:
 *     summary: Delete purchase request
 *     tags: [Finance]
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
 *         description: Purchase request deleted successfully
 */
router.delete('/purchase-requests/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deletePurchaseRequest);

/**
 * @swagger
 * /api/v1/finance/purchase-requests/{id}/approve:
 *   put:
 *     summary: Approve purchase request
 *     tags: [Finance]
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
 *         description: Purchase request approved successfully
 */
router.put('/purchase-requests/:id/approve', authenticate, authorize(['Admin', 'Finance Manager']), financeController.approvePurchaseRequest);

// ==================== SUPPLIERS ====================

/**
 * @swagger
 * /api/v1/finance/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
 */
router.get('/suppliers', authenticate, financeController.getAllSuppliers);

/**
 * @swagger
 * /api/v1/finance/suppliers:
 *   post:
 *     summary: Create supplier
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - name
 *               - type
 *             properties:
 *               supplier_id:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [individual, company]
 *               tax_id:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               contact_person:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created successfully
 */
router.post('/suppliers', authenticate, authorize(['Admin', 'Finance Manager']), financeController.createSupplier);

/**
 * @swagger
 * /api/v1/finance/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Finance]
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
 *         description: Supplier retrieved successfully
 */
router.get('/suppliers/:id', authenticate, financeController.getSupplierById);

/**
 * @swagger
 * /api/v1/finance/suppliers/{id}:
 *   put:
 *     summary: Update supplier
 *     tags: [Finance]
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
 *         description: Supplier updated successfully
 */
router.put('/suppliers/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.updateSupplier);

/**
 * @swagger
 * /api/v1/finance/suppliers/{id}:
 *   delete:
 *     summary: Delete supplier
 *     tags: [Finance]
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
 *         description: Supplier deleted successfully
 */
router.delete('/suppliers/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteSupplier);

// ==================== QUOTATIONS ====================

/**
 * @swagger
 * /api/v1/finance/quotations:
 *   get:
 *     summary: Get all quotations
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quotations retrieved successfully
 */
router.get('/quotations', authenticate, financeController.getAllQuotations);

/**
 * @swagger
 * /api/v1/finance/quotations:
 *   post:
 *     summary: Create quotation
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - date
 *               - procurement_title
 *               - amount
 *               - submitted_by
 *             properties:
 *               supplier_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               procurement_title:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               description:
 *                 type: string
 *               submitted_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Quotation created successfully
 */
router.post('/quotations', authenticate, financeController.createQuotation);

/**
 * @swagger
 * /api/v1/finance/quotations/{id}:
 *   get:
 *     summary: Get quotation by ID
 *     tags: [Finance]
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
 *         description: Quotation retrieved successfully
 */
router.get('/quotations/:id', authenticate, financeController.getQuotationById);

/**
 * @swagger
 * /api/v1/finance/quotations/{id}:
 *   put:
 *     summary: Update quotation
 *     tags: [Finance]
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
 *         description: Quotation updated successfully
 */
router.put('/quotations/:id', authenticate, financeController.updateQuotation);

/**
 * @swagger
 * /api/v1/finance/quotations/{id}:
 *   delete:
 *     summary: Delete quotation
 *     tags: [Finance]
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
 *         description: Quotation deleted successfully
 */
router.delete('/quotations/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteQuotation);

// ==================== LPOS ====================

/**
 * @swagger
 * /api/v1/finance/lpos:
 *   get:
 *     summary: Get all LPOs
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: LPOs retrieved successfully
 */
router.get('/lpos', authenticate, financeController.getAllLPOs);

/**
 * @swagger
 * /api/v1/finance/lpos:
 *   post:
 *     summary: Create LPO
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - po_number
 *               - supplier_id
 *               - item_name
 *               - amount
 *               - created_by
 *             properties:
 *               po_number:
 *                 type: string
 *               supplier_id:
 *                 type: integer
 *               item_name:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               created_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: LPO created successfully
 */
router.post('/lpos', authenticate, authorize(['Admin', 'Finance Manager']), financeController.createLPO);

/**
 * @swagger
 * /api/v1/finance/lpos/{id}:
 *   get:
 *     summary: Get LPO by ID
 *     tags: [Finance]
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
 *         description: LPO retrieved successfully
 */
router.get('/lpos/:id', authenticate, financeController.getLPOById);

/**
 * @swagger
 * /api/v1/finance/lpos/{id}:
 *   put:
 *     summary: Update LPO
 *     tags: [Finance]
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
 *         description: LPO updated successfully
 */
router.put('/lpos/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.updateLPO);

/**
 * @swagger
 * /api/v1/finance/lpos/{id}:
 *   delete:
 *     summary: Delete LPO
 *     tags: [Finance]
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
 *         description: LPO deleted successfully
 */
router.delete('/lpos/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteLPO);

// ==================== PETTY CASH ====================

/**
 * @swagger
 * /api/v1/finance/petty-cash-books:
 *   get:
 *     summary: Get all petty cash books
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Petty cash books retrieved successfully
 */
router.get('/petty-cash-books', authenticate, financeController.getAllPettyCashBooks);

/**
 * @swagger
 * /api/v1/finance/petty-cash-books:
 *   post:
 *     summary: Create petty cash book
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - amount_received
 *               - date
 *               - balance
 *             properties:
 *               user_id:
 *                 type: integer
 *               amount_received:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               balance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Petty cash book created successfully
 */
router.post('/petty-cash-books', authenticate, authorize(['Admin', 'Finance Manager']), financeController.createPettyCashBook);

/**
 * @swagger
 * /api/v1/finance/petty-cash-books/{id}:
 *   get:
 *     summary: Get petty cash book by ID
 *     tags: [Finance]
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
 *         description: Petty cash book retrieved successfully
 */
router.get('/petty-cash-books/:id', authenticate, financeController.getPettyCashBookById);

/**
 * @swagger
 * /api/v1/finance/petty-cash-books/{id}:
 *   put:
 *     summary: Update petty cash book
 *     tags: [Finance]
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
 *         description: Petty cash book updated successfully
 */
router.put('/petty-cash-books/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.updatePettyCashBook);

/**
 * @swagger
 * /api/v1/finance/petty-cash-books/{id}:
 *   delete:
 *     summary: Delete petty cash book
 *     tags: [Finance]
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
 *         description: Petty cash book deleted successfully
 */
router.delete('/petty-cash-books/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deletePettyCashBook);

// ==================== PETTY CASH EXPENSES ====================

/**
 * @swagger
 * /api/v1/finance/petty-cash-expenses:
 *   get:
 *     summary: Get all petty cash expenses
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Petty cash expenses retrieved successfully
 */
router.get('/petty-cash-expenses', authenticate, financeController.getAllPettyCashExpenses);

/**
 * @swagger
 * /api/v1/finance/petty-cash-expenses:
 *   post:
 *     summary: Create petty cash expense
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petty_cash_book_id
 *               - date
 *               - description
 *               - amount
 *               - created_by
 *             properties:
 *               petty_cash_book_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               created_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Petty cash expense created successfully
 */
router.post('/petty-cash-expenses', authenticate, financeController.createPettyCashExpense);

/**
 * @swagger
 * /api/v1/finance/petty-cash-expenses/{id}:
 *   get:
 *     summary: Get petty cash expense by ID
 *     tags: [Finance]
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
 *         description: Petty cash expense retrieved successfully
 */
router.get('/petty-cash-expenses/:id', authenticate, financeController.getPettyCashExpenseById);

/**
 * @swagger
 * /api/v1/finance/petty-cash-expenses/{id}:
 *   put:
 *     summary: Update petty cash expense
 *     tags: [Finance]
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
 *         description: Petty cash expense updated successfully
 */
router.put('/petty-cash-expenses/:id', authenticate, financeController.updatePettyCashExpense);

/**
 * @swagger
 * /api/v1/finance/petty-cash-expenses/{id}:
 *   delete:
 *     summary: Delete petty cash expense
 *     tags: [Finance]
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
 *         description: Petty cash expense deleted successfully
 */
router.delete('/petty-cash-expenses/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deletePettyCashExpense);

// ==================== TRAVEL ADVANCE REQUESTS ====================

/**
 * @swagger
 * /api/v1/finance/travel-advance-requests:
 *   get:
 *     summary: Get all travel advance requests
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Travel advance requests retrieved successfully
 */
router.get('/travel-advance-requests', authenticate, financeController.getAllTravelAdvanceRequests);

/**
 * @swagger
 * /api/v1/finance/travel-advance-requests:
 *   post:
 *     summary: Create travel advance request
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - departure_date
 *               - return_date
 *               - total_cost
 *               - flat_rate_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               departure_date:
 *                 type: string
 *                 format: date
 *               return_date:
 *                 type: string
 *                 format: date
 *               total_cost:
 *                 type: number
 *               flat_rate_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Travel advance request created successfully
 */
router.post('/travel-advance-requests', authenticate, financeController.createTravelAdvanceRequest);

/**
 * @swagger
 * /api/v1/finance/travel-advance-requests/{id}:
 *   get:
 *     summary: Get travel advance request by ID
 *     tags: [Finance]
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
 *         description: Travel advance request retrieved successfully
 */
router.get('/travel-advance-requests/:id', authenticate, financeController.getTravelAdvanceRequestById);

/**
 * @swagger
 * /api/v1/finance/travel-advance-requests/{id}:
 *   put:
 *     summary: Update travel advance request
 *     tags: [Finance]
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
 *         description: Travel advance request updated successfully
 */
router.put('/travel-advance-requests/:id', authenticate, financeController.updateTravelAdvanceRequest);

/**
 * @swagger
 * /api/v1/finance/travel-advance-requests/{id}:
 *   delete:
 *     summary: Delete travel advance request
 *     tags: [Finance]
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
 *         description: Travel advance request deleted successfully
 */
router.delete('/travel-advance-requests/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteTravelAdvanceRequest);

/**
 * @swagger
 * /api/v1/finance/travel-advance-requests/{id}/approve:
 *   put:
 *     summary: Approve travel advance request
 *     tags: [Finance]
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
 *         description: Travel advance request approved successfully
 */
router.put('/travel-advance-requests/:id/approve', authenticate, authorize(['Admin', 'Finance Manager']), financeController.approveTravelAdvanceRequest);

// ==================== FLAT RATES ====================

/**
 * @swagger
 * /api/v1/finance/flat-rates:
 *   get:
 *     summary: Get all flat rates
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flat rates retrieved successfully
 */
router.get('/flat-rates', authenticate, financeController.getAllFlatRates);

/**
 * @swagger
 * /api/v1/finance/flat-rates:
 *   post:
 *     summary: Create flat rate
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location_category
 *               - amount
 *             properties:
 *               location_category:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Flat rate created successfully
 */
router.post('/flat-rates', authenticate, authorize(['Admin', 'Finance Manager']), financeController.createFlatRate);

// ==================== REPLENISHMENT REQUESTS ====================

/**
 * @swagger
 * /api/v1/finance/replenishment-requests:
 *   get:
 *     summary: Get all replenishment requests
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Replenishment requests retrieved successfully
 */
router.get('/replenishment-requests', authenticate, financeController.getAllReplenishmentRequests);

/**
 * @swagger
 * /api/v1/finance/replenishment-requests:
 *   post:
 *     summary: Create replenishment request
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petty_cash_book_id
 *               - date
 *               - amount
 *               - requested_by
 *             properties:
 *               petty_cash_book_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               requested_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Replenishment request created successfully
 */
router.post('/replenishment-requests', authenticate, financeController.createReplenishmentRequest);

/**
 * @swagger
 * /api/v1/finance/replenishment-requests/{id}/approve:
 *   put:
 *     summary: Approve replenishment request
 *     tags: [Finance]
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
 *         description: Replenishment request approved successfully
 */
router.put('/replenishment-requests/:id/approve', authenticate, authorize(['Admin', 'Finance Manager']), financeController.approveReplenishmentRequest);

// ==================== FISCAL YEARS ====================

/**
 * @swagger
 * /api/v1/finance/fiscal-years:
 *   get:
 *     summary: Get all fiscal years
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fiscal years retrieved successfully
 */
router.get('/fiscal-years', authenticate, financeController.getAllFiscalYears);

/**
 * @swagger
 * /api/v1/finance/fiscal-years/current:
 *   get:
 *     summary: Get current fiscal year
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current fiscal year retrieved successfully
 */
router.get('/fiscal-years/current', authenticate, financeController.getCurrentFiscalYear);

// ==================== QUARTERS ====================

/**
 * @swagger
 * /api/v1/finance/quarters:
 *   get:
 *     summary: Get all quarters
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quarters retrieved successfully
 */
router.get('/quarters', authenticate, financeController.getAllQuarters);

// ==================== EXPORT APIs ====================

/**
 * @swagger
 * /api/v1/finance/budgets/export:
 *   get:
 *     summary: Export budgets
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budgets exported successfully
 */
router.get('/budgets/export', authenticate, authorize(['Admin', 'Finance Manager']), financeController.exportBudgets);

/**
 * @swagger
 * /api/v1/finance/expense-reports/export:
 *   get:
 *     summary: Export expense reports
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense reports exported successfully
 */
router.get('/expense-reports/export', authenticate, authorize(['Admin', 'Finance Manager']), financeController.exportExpenseReports);

/**
 * @swagger
 * /api/v1/finance/suppliers/export:
 *   get:
 *     summary: Export suppliers
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suppliers exported successfully
 */
router.get('/suppliers/export', authenticate, authorize(['Admin', 'Finance Manager']), financeController.exportSuppliers);

// ==================== REPORTS & ANALYTICS ====================

/**
 * @swagger
 * /api/v1/finance/reports/budget:
 *   get:
 *     summary: Get budget reports
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget reports retrieved successfully
 */
router.get('/reports/budget', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetReports);

/**
 * @swagger
 * /api/v1/finance/reports/procurement:
 *   get:
 *     summary: Get procurement reports
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Procurement reports retrieved successfully
 */
router.get('/reports/procurement', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getProcurementReports);

/**
 * @swagger
 * /api/v1/finance/budgets/statistics:
 *   get:
 *     summary: Get budget statistics
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget statistics retrieved successfully
 */
router.get('/budgets/statistics', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetStatistics);

/**
 * @swagger
 * /api/v1/finance/suppliers/statistics:
 *   get:
 *     summary: Get supplier statistics
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Supplier statistics retrieved successfully
 */
router.get('/suppliers/statistics', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getSupplierStatistics);

// ==================== ASSET MAINTENANCE ====================

/**
 * @swagger
 * /api/v1/finance/asset-maintenance:
 *   get:
 *     summary: Get all asset maintenance records
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in_progress, completed, cancelled]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [preventive, corrective, emergency]
 *       - in: query
 *         name: asset_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset maintenance records retrieved successfully
 */
router.get('/asset-maintenance', authenticate, financeController.getAllAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance:
 *   post:
 *     summary: Create asset maintenance record
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - maintenance_type
 *               - title
 *               - scheduled_date
 *             properties:
 *               asset_id:
 *                 type: integer
 *               maintenance_type:
 *                 type: string
 *                 enum: [preventive, corrective, emergency]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               estimated_duration:
 *                 type: string
 *               estimated_cost:
 *                 type: number
 *               assigned_to:
 *                 type: string
 *               vendor_id:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               maintenance_category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, in_progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset maintenance record created successfully
 */
router.post('/asset-maintenance', authenticate, financeController.createAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/{id}:
 *   get:
 *     summary: Get asset maintenance record by ID
 *     tags: [Finance]
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
 *         description: Asset maintenance record retrieved successfully
 */
router.get('/asset-maintenance/:id', authenticate, financeController.getAssetMaintenanceById);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/{id}:
 *   put:
 *     summary: Update asset maintenance record
 *     tags: [Finance]
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
 *         description: Asset maintenance record updated successfully
 */
router.put('/asset-maintenance/:id', authenticate, financeController.updateAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/{id}:
 *   delete:
 *     summary: Delete asset maintenance record
 *     tags: [Finance]
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
 *         description: Asset maintenance record deleted successfully
 */
router.delete('/asset-maintenance/:id', authenticate, authorize(['Admin', 'Finance Manager']), financeController.deleteAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/{id}/complete:
 *   put:
 *     summary: Complete asset maintenance
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed_date:
 *                 type: string
 *                 format: date
 *               actual_duration:
 *                 type: string
 *               actual_cost:
 *                 type: number
 *               completion_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset maintenance completed successfully
 */
router.put('/asset-maintenance/:id/complete', authenticate, financeController.completeAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/export:
 *   get:
 *     summary: Export asset maintenance data
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, csv, pdf]
 *     responses:
 *       200:
 *         description: Asset maintenance data exported successfully
 */
router.get('/asset-maintenance/export', authenticate, authorize(['Admin', 'Finance Manager']), financeController.exportAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/assets:
 *   get:
 *     summary: Get all assets for maintenance assignment
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance]
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
 */
router.get('/assets', authenticate, financeController.getAllAssets);

// ==================== ASSET MAINTENANCE ENHANCED FEATURES ====================

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/due:
 *   get:
 *     summary: Get overdue maintenance
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days_overdue
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Overdue maintenance retrieved successfully
 */
router.get('/asset-maintenance/due', authenticate, financeController.getOverdueMaintenance);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/calendar:
 *   get:
 *     summary: Get calendar view data
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Calendar data retrieved successfully
 */
router.get('/asset-maintenance/calendar', authenticate, financeController.getMaintenanceCalendar);

/**
 * @swagger
 * /api/v1/finance/asset-maintenance/costs:
 *   get:
 *     summary: Get maintenance cost analytics
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Maintenance cost analytics retrieved successfully
 */
router.get('/asset-maintenance/costs', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getMaintenanceCosts);

/**
 * @swagger
 * /api/v1/finance/assets/{id}/schedule-maintenance:
 *   post:
 *     summary: Schedule maintenance for specific asset
 *     tags: [Finance]
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
 *               - maintenance_type
 *               - scheduled_date
 *             properties:
 *               maintenance_type:
 *                 type: string
 *                 enum: [preventive, corrective, emergency]
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               estimated_duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Maintenance scheduled successfully
 */
router.post('/assets/:id/schedule-maintenance', authenticate, financeController.scheduleAssetMaintenance);

/**
 * @swagger
 * /api/v1/finance/assets/{id}/maintenance:
 *   get:
 *     summary: Get maintenance history for asset
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset maintenance history retrieved successfully
 */
router.get('/assets/:id/maintenance', authenticate, financeController.getAssetMaintenanceHistory);

// ==================== ENHANCED BUDGET FEATURES ====================

/**
 * @swagger
 * /api/v1/finance/budgets/{id}/copy:
 *   post:
 *     summary: Copy budget
 *     tags: [Finance]
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
 *             properties:
 *               new_budget_name:
 *                 type: string
 *               new_budget_code:
 *                 type: string
 *               fiscal_year:
 *                 type: string
 *               adjust_percentage:
 *                 type: number
 *     responses:
 *       201:
 *         description: Budget copied successfully
 */
router.post('/budgets/:id/copy', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.copyBudget);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}/utilization:
 *   get:
 *     summary: Get budget utilization
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly]
 *     responses:
 *       200:
 *         description: Budget utilization retrieved successfully
 */
router.get('/budgets/:id/utilization', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.getBudgetUtilization);

/**
 * @swagger
 * /api/v1/finance/budgets/variance:
 *   get:
 *     summary: Get budget variance analysis
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fiscal_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: integer
 *       - in: query
 *         name: variance_type
 *         schema:
 *           type: string
 *           enum: [over_budget, under_budget, on_budget]
 *     responses:
 *       200:
 *         description: Budget variance analysis retrieved successfully
 */
router.get('/budgets/variance', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetVariance);

/**
 * @swagger
 * /api/v1/finance/budgets/analytics:
 *   get:
 *     summary: Get budget analytics
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fiscal_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: integer
 *       - in: query
 *         name: analysis_type
 *         schema:
 *           type: string
 *           enum: [trends, performance, utilization]
 *     responses:
 *       200:
 *         description: Budget analytics retrieved successfully
 */
router.get('/budgets/analytics', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetAnalytics);

/**
 * @swagger
 * /api/v1/finance/budgets/summary:
 *   get:
 *     summary: Get budget summary
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fiscal_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: department
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget summary retrieved successfully
 */
router.get('/budgets/summary', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetSummary);

/**
 * @swagger
 * /api/v1/finance/budgets/trends:
 *   get:
 *     summary: Get budget trends
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fiscal_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: trend_period
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly]
 *     responses:
 *       200:
 *         description: Budget trends retrieved successfully
 */
router.get('/budgets/trends', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetTrends);

/**
 * @swagger
 * /api/v1/finance/budgets/compare:
 *   post:
 *     summary: Compare budgets
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - budget_ids
 *             properties:
 *               budget_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               comparison_type:
 *                 type: string
 *                 enum: [performance, utilization, variance]
 *     responses:
 *       200:
 *         description: Budget comparison retrieved successfully
 */
router.post('/budgets/compare', authenticate, authorize(['Admin', 'Finance Manager']), financeController.getBudgetComparison);

/**
 * @swagger
 * /api/v1/finance/budgets/department/{departmentId}/summary:
 *   get:
 *     summary: Get department budget summary
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fiscal_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department budget summary retrieved successfully
 */
router.get('/budgets/department/:departmentId/summary', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.getDepartmentBudgetSummary);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}/submit:
 *   put:
 *     summary: Submit budget for approval
 *     tags: [Finance]
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
 *             properties:
 *               submission_notes:
 *                 type: string
 *               approver_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Budget submitted for approval successfully
 */
router.put('/budgets/:id/submit', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.submitBudgetForApproval);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}/reject:
 *   put:
 *     summary: Reject budget
 *     tags: [Finance]
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
 *             properties:
 *               rejection_reason:
 *                 type: string
 *               suggested_changes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Budget rejected successfully
 */
router.put('/budgets/:id/reject', authenticate, authorize(['Admin', 'Finance Manager']), financeController.rejectBudget);

/**
 * @swagger
 * /api/v1/finance/budgets/{id}/workflow:
 *   get:
 *     summary: Get budget workflow
 *     tags: [Finance]
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
 *         description: Budget workflow retrieved successfully
 */
router.get('/budgets/:id/workflow', authenticate, authorize(['Admin', 'Finance Manager', 'Department Head']), financeController.getBudgetWorkflow);

module.exports = router; 