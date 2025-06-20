const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { roleValidator, userRoleValidator } = require('../validators/roleValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management operations
 */

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles with permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', authenticate, authorize(['Admin', 'HR Manager']), roleController.getAllRoles);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_name
 *             properties:
 *               role_name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of permission IDs
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error or invalid permission IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Role already exists
 */
router.post('/', authenticate, authorize(['Admin']), roleValidator, validateRequest, roleController.createRole);

/**
 * @swagger
 * /api/v1/roles/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/permissions', authenticate, authorize(['Admin', 'HR Manager']), roleController.getAllPermissions);

/**
 * @swagger
 * /api/v1/roles/assign:
 *   post:
 *     summary: Assign role to user
 *     tags: [Roles]
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
 *               - role_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *               role_id:
 *                 type: integer
 *                 description: Role ID
 *     responses:
 *       200:
 *         description: Role assigned to user successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User or role not found
 *       409:
 *         description: User already has this role
 */
router.post('/assign', authenticate, authorize(['Admin', 'HR Manager']), userRoleValidator, validateRequest, roleController.assignRoleToUser);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details with permissions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 */
router.get('/:id', authenticate, authorize(['Admin', 'HR Manager']), roleController.getRoleById);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 description: Role name
 *               description:
 *                 type: string
 *                 description: Role description
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of permission IDs
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Validation error or invalid permission IDs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already in use
 */
router.put('/:id', authenticate, authorize(['Admin']), roleValidator, validateRequest, roleController.updateRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Cannot delete role assigned to users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions or default role
 *       404:
 *         description: Role not found
 */
router.delete('/:id', authenticate, authorize(['Admin']), roleController.deleteRole);

/**
 * @swagger
 * /api/v1/roles/users/{user_id}/roles/{role_id}:
 *   delete:
 *     summary: Remove role from user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: role_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role removed from user successfully
 *       400:
 *         description: Cannot remove the only role from a user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User does not have this role
 */
router.delete('/users/:user_id/roles/:role_id', authenticate, authorize(['Admin', 'HR Manager']), roleController.removeRoleFromUser);

module.exports = router;