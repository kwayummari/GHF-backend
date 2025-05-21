const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { documentUpdateValidator } = require('../validators/documentValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management operations
 */

/**
 * @swagger
 * /api/v1/documents/upload:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file
 *               name:
 *                 type: string
 *                 description: Document name (defaults to original filename)
 *               description:
 *                 type: string
 *                 description: Document description
 *               user_id:
 *                 type: integer
 *                 description: User ID to associate with the document (defaults to current user)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: No file uploaded or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/upload', authenticate, upload.single('file'), documentController.uploadDocument);

/**
 * @swagger
 * /api/v1/documents/my-documents:
 *   get:
 *     summary: Get documents for current user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of documents per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: file_type
 *         schema:
 *           type: string
 *         description: Filter by file type
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: uploaded_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of documents
 *       401:
 *         description: Unauthorized
 */
router.get('/my-documents', authenticate, documentController.getMyDocuments);

/**
 * @swagger
 * /api/v1/documents/users/{id}:
 *   get:
 *     summary: Get documents for a specific user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of documents per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: file_type
 *         schema:
 *           type: string
 *         description: Filter by file type
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: uploaded_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of user documents
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 */
router.get('/users/:id', authenticate, documentController.getUserDocuments);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: Get document details by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document not found
 */
router.get('/:id', authenticate, documentController.getDocumentById);

/**
 * @swagger
 * /api/v1/documents/{id}/download:
 *   get:
 *     summary: Download document file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document or file not found
 */
router.get('/:id/download', authenticate, documentController.downloadDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   put:
 *     summary: Update document details
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Document name
 *               description:
 *                 type: string
 *                 description: Document description
 *               user_id:
 *                 type: integer
 *                 description: User ID to associate with the document
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document or user not found
 */
router.put('/:id', authenticate, documentUpdateValidator, validateRequest, documentController.updateDocument);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document not found
 */
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;