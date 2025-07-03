const express = require('express');
const router = express.Router();
const { getAllPurchaseRequests, createPurchaseRequest } = require('../controllers/procurementController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Purchase Requests
router.get('/requests', [auth, checkRole('procurement', 'manager')], getAllPurchaseRequests);
router.post('/requests', [auth, checkRole('procurement', 'manager')], createPurchaseRequest);

// Requisitions
router.get('/requisitions', [auth, checkRole('procurement', 'manager')], getAllRequisitions);
router.post('/requisitions', [auth, checkRole('procurement', 'manager')], createRequisition);
router.put('/requisitions/:requisitionId', [auth, checkRole('procurement', 'manager')], updateRequisition);
router.get('/requisitions/:requisitionId/items', [auth, checkRole('procurement', 'manager')], getRequisitionItems);
router.post('/requisitions/:requisitionId/items', [auth, checkRole('procurement', 'manager')], addRequisitionItem);

// Attachments
router.post('/attachments', [auth, checkRole('procurement', 'manager')], upload.single('file'), addAttachment);
router.get('/attachments/:attachmentId', [auth, checkRole('procurement', 'manager')], getAttachment);

// Workflow
router.get('/workflow/:requisitionId', [auth, checkRole('procurement', 'manager')], getWorkflow);
router.post('/workflow/:requisitionId/approve', [auth, checkRole('procurement', 'manager')], approveRequisition);
router.post('/workflow/:requisitionId/reject', [auth, checkRole('procurement', 'manager')], rejectRequisition);

module.exports = router;
