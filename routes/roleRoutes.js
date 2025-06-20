// routes/roleRoutes.js (FIXED)
const express = require('express');
const router = express.Router();
const {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions,
    getRolePermissions,
    updateRolePermissions,
    assignRole
} = require('../controllers/roleController');

// Middleware imports (adjust paths as needed)
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validateRole, validateRolePermissions, validateRoleAssignment } = require('../validators/roleValidator');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management
 */

// IMPORTANT: Static routes MUST come before parameterized routes
// Otherwise Express will treat "permissions" and "assign" as route parameters

/**
 * @swagger
 * /api/v1/roles/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, read, update, delete, manage]
 *         description: Filter by action
 *     responses:
 *       200:
 *         description: List of permissions
 */
router.get('/permissions',
    authenticate,
    authorize(['Admin', 'HR Manager']),
    getAllPermissions
);

/**
 * @swagger
 * /api/v1/roles/assign:
 *   post:
 *     summary: Assign roles to user
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
 *               - role_ids
 *             properties:
 *               user_id:
 *                 type: integer
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of role IDs
 *     responses:
 *       200:
 *         description: Roles assigned successfully
 *       400:
 *         description: Invalid user or role IDs
 *       404:
 *         description: User not found
 */
router.post('/assign',
    authenticate,
    authorize(['Admin', 'HR Manager']),
    validateRoleAssignment,
    assignRole
);

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: include_permissions
 *         schema:
 *           type: boolean
 *         description: Include permissions in response
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/',
    authenticate,
    authorize(['Admin', 'HR Manager']),
    getAllRoles
);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create new role
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
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Role already exists
 */
router.post('/',
    authenticate,
    authorize(['Admin']),
    validateRole,
    createRole
);

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
 *       - in: query
 *         name: include_permissions
 *         schema:
 *           type: boolean
 *         description: Include permissions in response
 *     responses:
 *       200:
 *         description: Role details
 *       404:
 *         description: Role not found
 */
router.get('/:id',
    authenticate,
    authorize(['Admin', 'HR Manager']),
    getRoleById
);

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
 *                 minLength: 2
 *                 maxLength: 50
 *               description:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 */
router.put('/:id',
    authenticate,
    authorize(['Admin']),
    validateRole,
    updateRole
);

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
 *         description: Cannot delete default role or role assigned to users
 *       404:
 *         description: Role not found
 */
router.delete('/:id',
    authenticate,
    authorize(['Admin']),
    deleteRole
);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   get:
 *     summary: Get role permissions
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
 *         description: Role permissions
 *       404:
 *         description: Role not found
 */
router.get('/:id/permissions',
    authenticate,
    authorize(['Admin', 'HR Manager']),
    getRolePermissions
);

/**
 * @swagger
 * /api/v1/roles/{id}/permissions:
 *   put:
 *     summary: Update role permissions
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of permission IDs
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
 *       400:
 *         description: Invalid permission IDs
 *       404:
 *         description: Role not found
 */
router.put('/:id/permissions',
    authenticate,
    authorize(['Admin']),
    validateRolePermissions,
    updateRolePermissions
);

module.exports = router;