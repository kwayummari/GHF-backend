const express = require('express');
const menuController = require('../controllers/menuController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticate } = require('../middlewares/authMiddleware'); // Import explicit auth middleware
const { menuValidator, menuUpdateValidator } = require('../validators/menuValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu management operations
 */

/**
 * @swagger
 * /api/v1/menus/user:
 *   get:
 *     summary: Get user's accessible menu structure
 *     description: Returns hierarchical menu structure based on user's roles and permissions. Only shows menus the authenticated user has access to.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's accessible menu structure retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User menus retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuHierarchy'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// FIXED: Add explicit authentication middleware for this critical route
router.get('/user', authenticate, menuController.getUserMenus);

/**
 * @swagger
 * /api/v1/menus:
 *   get:
 *     summary: Get all menus (Admin function)
 *     description: Retrieve all menus in the system with optional inclusion of permissions and roles. Only accessible by administrators.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_permissions
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include menu permissions in response
 *         example: true
 *       - in: query
 *         name: include_roles
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include menu roles in response
 *         example: true
 *     responses:
 *       200:
 *         description: All menus retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', menuController.getAllMenus);

/**
 * @swagger
 * /api/v1/menus:
 *   post:
 *     summary: Create a new menu
 *     description: Create a new menu item with optional permissions and role assignments. Only accessible by administrators.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuCreateRequest'
 *     responses:
 *       201:
 *         description: Menu created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Menu name already exists
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', menuValidator, validateRequest, menuController.createMenu);

/**
 * @swagger
 * /api/v1/menus/permission-matrix:
 *   get:
 *     summary: Get menu permission matrix
 *     description: Retrieve the complete permission matrix showing which roles have access to which menus.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission matrix retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Menu permission matrix retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     roles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 *                     menus:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Menu'
 *                     matrix:
 *                       type: object
 *                       description: Permission matrix with keys as "roleId-menuId" and values as boolean
 *                       example:
 *                         "1-1": true
 *                         "1-2": false
 *                         "2-1": true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/permission-matrix', menuController.getMenuPermissionMatrix);

/**
 * @swagger
 * /api/v1/menus/statistics:
 *   get:
 *     summary: Get menu statistics
 *     description: Retrieve various statistics related to menus, roles, and permissions.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics', menuController.getMenuStatistics);

/**
 * @swagger
 * /api/v1/menus/bulk-permissions:
 *   put:
 *     summary: Bulk update role-menu permissions
 *     description: Update multiple role-menu permissions in a single request for efficient permission management.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 description: Array of permission updates
 *                 items:
 *                   type: object
 *                   required:
 *                     - role_id
 *                     - menu_id
 *                     - can_access
 *                   properties:
 *                     role_id:
 *                       type: integer
 *                       description: Role ID
 *                       example: 2
 *                     menu_id:
 *                       type: integer
 *                       description: Menu ID
 *                       example: 5
 *                     can_access:
 *                       type: boolean
 *                       description: Whether role can access the menu
 *                       example: true
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/bulk-permissions', menuController.bulkUpdateRoleMenuPermissions);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     description: Retrieve detailed information about a specific menu including its parent, children, permissions, and roles.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Menu details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', menuController.getMenuById);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   put:
 *     summary: Update menu
 *     description: Update an existing menu's properties, permissions, and role assignments. Only accessible by administrators.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuUpdateRequest'
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *       400:
 *         description: Validation error or business logic error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *       409:
 *         description: Menu name conflict
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', menuUpdateValidator, validateRequest, menuController.updateMenu);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   delete:
 *     summary: Delete menu
 *     description: Delete a menu item. Cannot delete menus that have child menus. Only accessible by administrators.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *       400:
 *         description: Cannot delete menu with child menus
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', menuController.deleteMenu);

/**
 * @swagger
 * /api/v1/menus/roles/{role_id}/menus/{menu_id}/access:
 *   put:
 *     summary: Update role menu access
 *     description: Grant or revoke a specific role's access to a specific menu. Only accessible by administrators.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Role ID
 *         example: 2
 *       - in: path
 *         name: menu_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleMenuAccessRequest'
 *     responses:
 *       200:
 *         description: Role menu access updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Role or menu not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/roles/:role_id/menus/:menu_id/access', menuController.updateRoleMenuAccess);

/**
 * @swagger
 * /api/v1/menus/{id}/order:
 *   put:
 *     summary: Update menu order
 *     description: Update the display order and parent of a menu item for reorganizing navigation structure.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menu_order:
 *                 type: integer
 *                 description: New display order
 *                 example: 5
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *                 description: New parent menu ID (null for top-level)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Menu order updated successfully
 *       400:
 *         description: Validation error or circular reference
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id/order', menuController.updateMenuOrder);

/**
 * @swagger
 * /api/v1/menus/{menu_id}/role-permissions:
 *   get:
 *     summary: Get role permissions for a specific menu
 *     description: Retrieve all roles and their access status for a specific menu item.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menu_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 5
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:menu_id/role-permissions', menuController.getRoleMenuPermissions);

/**
 * @swagger
 * /api/v1/menus/{menu_id}/role-permissions:
 *   put:
 *     summary: Update role permissions for a specific menu
 *     description: Update multiple role permissions for a specific menu item.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menu_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Menu ID
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_permissions
 *             properties:
 *               role_permissions:
 *                 type: object
 *                 description: Object with keys as "roleId-menuId" and values as boolean
 *                 example:
 *                   "1-5": true
 *                   "2-5": false
 *                   "3-5": true
 *     responses:
 *       200:
 *         description: Menu permissions updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:menu_id/role-permissions', menuController.updateRoleMenuPermissions);

module.exports = router;