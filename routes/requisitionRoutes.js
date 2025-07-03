const express = require('express');
const router = express.Router();
const requisitionController = require('../controllers/requisitionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateJoi } = require('../middlewares/validateRequest');
const { 
  createRequisitionSchema, 
  updateRequisitionSchema, 
  queryParamsSchema, 
  idParamSchema 
} = require('../validators/requisitionValidator');
const upload = require('../middlewares/uploadMiddleware');

// ==================== CORE CRUD OPERATIONS ====================

/**
 * @swagger
 * /api/v1/requisitions:
 *   get:
 *     summary: Get all purchase requests with filtering and pagination
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, approved, rejected, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department
 *       - in: query
 *         name: budget_id
 *         schema:
 *           type: integer
 *         description: Filter by budget
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, required_date, priority, status]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Purchase requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     requisitions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PurchaseRequest'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', 
  authenticate, 
  validateJoi(queryParamsSchema, 'query'), 
  requisitionController.getAllPurchaseRequests
);

/**
 * @swagger
 * /api/v1/requisitions/{id}:
 *   get:
 *     summary: Get purchase request by ID
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     responses:
 *       200:
 *         description: Purchase request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseRequest'
 */
router.get('/:id', 
  authenticate, 
  validateJoi(idParamSchema, 'params'), 
  requisitionController.getPurchaseRequestById
);

/**
 * @swagger
 * /api/v1/requisitions:
 *   post:
 *     summary: Create purchase request
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - department_id
 *               - required_date
 *               - estimated_cost
 *               - items
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               required_date:
 *                 type: string
 *                 format: date
 *               budget_id:
 *                 type: integer
 *               estimated_cost:
 *                 type: number
 *                 minimum: 0
 *               justification:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_name
 *                     - quantity
 *                     - unit_price
 *                   properties:
 *                     item_name:
 *                       type: string
 *                       maxLength: 255
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     unit_price:
 *                       type: number
 *                       minimum: 0
 *                     specifications:
 *                       type: string
 *                     category:
 *                       type: string
 *                       maxLength: 100
 *                     supplier_preference:
 *                       type: string
 *                       maxLength: 255
 *                     brand:
 *                       type: string
 *                       maxLength: 100
 *                     model:
 *                       type: string
 *                       maxLength: 100
 *                     unit_of_measure:
 *                       type: string
 *                       maxLength: 50
 *     responses:
 *       201:
 *         description: Purchase request created successfully
 */
router.post('/', 
  authenticate, 
  validateJoi(createRequisitionSchema), 
  requisitionController.createPurchaseRequest
);

/**
 * @swagger
 * /api/v1/requisitions/{id}:
 *   put:
 *     summary: Update purchase request
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRequisitionRequest'
 *     responses:
 *       200:
 *         description: Purchase request updated successfully
 */
router.put('/:id', 
  authenticate, 
  validateJoi(idParamSchema, 'params'),
  validateJoi(updateRequisitionSchema), 
  requisitionController.updatePurchaseRequest
);

/**
 * @swagger
 * /api/v1/requisitions/{id}:
 *   delete:
 *     summary: Delete purchase request
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     responses:
 *       200:
 *         description: Purchase request deleted successfully
 */
router.delete('/:id', 
  authenticate, 
  authorize(['Admin', 'Finance Manager']),
  validateJoi(idParamSchema, 'params'), 
  requisitionController.deletePurchaseRequest
);

// ==================== WORKFLOW & APPROVAL OPERATIONS ====================

/**
 * @swagger
 * /api/v1/requisitions/{id}/submit:
 *   put:
 *     summary: Submit purchase request for approval
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase request submitted for approval
 */
router.put('/:id/submit', 
  authenticate, 
  validateJoi(idParamSchema, 'params'),
  requisitionController.submitForApproval
);

/**
 * @swagger
 * /api/v1/requisitions/{id}/approve:
 *   put:
 *     summary: Approve purchase request
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *               next_approver_id:
 *                 type: integer
 *               conditions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase request approved
 */
router.put('/:id/approve', 
  authenticate, 
  authorize(['Admin', 'Finance Manager', 'Department Head']),
  validateJoi(idParamSchema, 'params'),
  requisitionController.approvePurchaseRequest
);

/**
 * @swagger
 * /api/v1/requisitions/{id}/reject:
 *   put:
 *     summary: Reject purchase request
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               comments:
 *                 type: string
 *               suggestions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase request rejected
 */
router.put('/:id/reject', 
  authenticate, 
  authorize(['Admin', 'Finance Manager', 'Department Head']),
  validateJoi(idParamSchema, 'params'),
  requisitionController.rejectPurchaseRequest
);

/**
 * @swagger
 * /api/v1/requisitions/{id}/workflow:
 *   get:
 *     summary: Get approval workflow for purchase request
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase request ID
 *     responses:
 *       200:
 *         description: Approval workflow retrieved successfully
 */
router.get('/:id/workflow', 
  authenticate, 
  validateJoi(idParamSchema, 'params'),
  requisitionController.getApprovalWorkflow
);

// ==================== SEARCH & FILTER OPERATIONS ====================

/**
 * @swagger
 * /api/v1/requisitions/search:
 *   get:
 *     summary: Search purchase requests
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, approved, rejected, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department
 *       - in: query
 *         name: budget_id
 *         schema:
 *           type: integer
 *         description: Filter by budget
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: amount_min
 *         schema:
 *           type: number
 *         description: Minimum amount
 *       - in: query
 *         name: amount_max
 *         schema:
 *           type: number
 *         description: Maximum amount
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', 
  authenticate, 
  validateJoi(queryParamsSchema, 'query'),
  requisitionController.searchPurchaseRequests
);

// ==================== REPORTING & ANALYTICS ====================

/**
 * @swagger
 * /api/v1/requisitions/statistics:
 *   get:
 *     summary: Get purchase request statistics
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', 
  authenticate, 
  requisitionController.getPurchaseRequestStatistics
);

// ==================== BULK OPERATIONS ====================

/**
 * @swagger
 * /api/v1/requisitions/bulk-approve:
 *   post:
 *     summary: Bulk approve purchase requests
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_ids
 *             properties:
 *               request_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               comments:
 *                 type: string
 *               approver_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bulk approval completed
 */
router.post('/bulk-approve', 
  authenticate, 
  authorize(['Admin', 'Finance Manager']),
  requisitionController.bulkApprovePurchaseRequests
);

/**
 * @swagger
 * /api/v1/requisitions/bulk-delete:
 *   post:
 *     summary: Bulk delete purchase requests
 *     tags: [Requisitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_ids
 *             properties:
 *               request_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bulk deletion completed
 */
router.post('/bulk-delete', 
  authenticate, 
  authorize(['Admin', 'Finance Manager']),
  requisitionController.bulkDeletePurchaseRequests
);

module.exports = router; 