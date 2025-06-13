const express = require('express');
const menuController = require('../controllers/menuController');
const validateRequest = require('../middlewares/validateRequest');
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
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       required:
 *         - menu_name
 *         - menu_label
 *       properties:
 *         id:
 *           type: integer
 *           description: Menu ID
 *           example: 1
 *         menu_name:
 *           type: string
 *           description: Menu identifier/name (unique)
 *           example: "dashboard"
 *         menu_label:
 *           type: string
 *           description: Menu display label
 *           example: "Dashboard"
 *         menu_icon:
 *           type: string
 *           description: Menu icon (FontAwesome class)
 *           example: "fas fa-tachometer-alt"
 *         menu_url:
 *           type: string
 *           description: Menu URL/route
 *           example: "/dashboard"
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: Parent menu ID for nested menus
 *           example: null
 *         menu_order:
 *           type: integer
 *           description: Menu display order
 *           example: 1
 *         is_active:
 *           type: boolean
 *           description: Whether menu is active
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *           description: Required permissions for this menu
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Role'
 *           description: Roles that have access to this menu
 *         parent:
 *           $ref: '#/components/schemas/MenuBasic'
 *           description: Parent menu information
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuBasic'
 *           description: Child menus
 *     MenuBasic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         menu_name:
 *           type: string
 *         menu_label:
 *           type: string
 *         menu_order:
 *           type: integer
 *     MenuHierarchy:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         menu_name:
 *           type: string
 *         menu_label:
 *           type: string
 *         menu_icon:
 *           type: string
 *         menu_url:
 *           type: string
 *         menu_order:
 *           type: integer
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuHierarchy'
 *     MenuCreateRequest:
 *       type: object
 *       required:
 *         - menu_name
 *         - menu_label
 *       properties:
 *         menu_name:
 *           type: string
 *           description: Menu identifier/name (unique)
 *           example: "reports"
 *         menu_label:
 *           type: string
 *           description: Menu display label
 *           example: "Reports"
 *         menu_icon:
 *           type: string
 *           description: Menu icon (FontAwesome class)
 *           example: "fas fa-chart-bar"
 *         menu_url:
 *           type: string
 *           description: Menu URL/route
 *           example: "/reports"
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: Parent menu ID for nested menus
 *           example: 1
 *         menu_order:
 *           type: integer
 *           description: Menu display order
 *           example: 5
 *           default: 0
 *         is_active:
 *           type: boolean
 *           description: Whether menu is active
 *           example: true
 *           default: true
 *         permission_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of permission IDs required for this menu
 *           example: [1, 2, 3]
 *         role_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of role IDs that can access this menu
 *           example: [1, 2]
 *     MenuUpdateRequest:
 *       type: object
 *       properties:
 *         menu_name:
 *           type: string
 *           description: Menu identifier/name (unique)
 *           example: "reports"
 *         menu_label:
 *           type: string
 *           description: Menu display label
 *           example: "Reports & Analytics"
 *         menu_icon:
 *           type: string
 *           description: Menu icon (FontAwesome class)
 *           example: "fas fa-chart-line"
 *         menu_url:
 *           type: string
 *           description: Menu URL/route
 *           example: "/reports-analytics"
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: Parent menu ID for nested menus
 *           example: 1
 *         menu_order:
 *           type: integer
 *           description: Menu display order
 *           example: 10
 *         is_active:
 *           type: boolean
 *           description: Whether menu is active
 *           example: false
 *         permission_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of permission IDs required for this menu
 *           example: [1, 2, 3, 4]
 *         role_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of role IDs that can access this menu
 *           example: [1, 2, 3]
 *     RoleMenuAccessRequest:
 *       type: object
 *       required:
 *         - can_access
 *       properties:
 *         can_access:
 *           type: boolean
 *           description: Whether the role can access this menu
 *           example: true
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
 *             examples:
 *               success:
 *                 summary: Successful response
 *                 value:
 *                   success: true
 *                   message: "User menus retrieved successfully"
 *                   data:
 *                     - id: 1
 *                       menu_name: "dashboard"
 *                       menu_label: "Dashboard"
 *                       menu_icon: "fas fa-tachometer-alt"
 *                       menu_url: "/dashboard"
 *                       menu_order: 1
 *                       children: []
 *                     - id: 2
 *                       menu_name: "hr"
 *                       menu_label: "Human Resources"
 *                       menu_icon: "fas fa-users"
 *                       menu_url: "/hr"
 *                       menu_order: 2
 *                       children:
 *                         - id: 3
 *                           menu_name: "employees"
 *                           menu_label: "Employees"
 *                           menu_icon: "fas fa-user"
 *                           menu_url: "/hr/employees"
 *                           menu_order: 1
 *                           children: []
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user', menuController.getUserMenus);

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
 *                   example: "All menus retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hierarchy:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MenuHierarchy'
 *                       description: Hierarchical menu structure
 *                     flat:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Menu'
 *                       description: Flat array of all menus
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
 *           examples:
 *             simple_menu:
 *               summary: Simple menu without parent
 *               value:
 *                 menu_name: "dashboard"
 *                 menu_label: "Dashboard"
 *                 menu_icon: "fas fa-tachometer-alt"
 *                 menu_url: "/dashboard"
 *                 menu_order: 1
 *                 is_active: true
 *                 permission_ids: [1]
 *                 role_ids: [1, 2, 3]
 *             submenu:
 *               summary: Submenu with parent
 *               value:
 *                 menu_name: "user-profile"
 *                 menu_label: "User Profile"
 *                 menu_icon: "fas fa-user"
 *                 menu_url: "/hr/user-profile"
 *                 parent_id: 2
 *                 menu_order: 2
 *                 is_active: true
 *                 permission_ids: [2, 3]
 *                 role_ids: [1, 2]
 *     responses:
 *       201:
 *         description: Menu created successfully
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
 *                   example: "Menu created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               validation_error:
 *                 summary: Validation error example
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - field: "menu_name"
 *                       message: "Menu name is required"
 *                     - field: "menu_label"
 *                       message: "Menu label is required"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Menu name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Menu name already exists"
 *               errors:
 *                 - field: "menu_name"
 *                   message: "Menu name must be unique"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', menuValidator, validateRequest, menuController.createMenu);

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
 *                   example: "Menu retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Menu not found"
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
 *           examples:
 *             update_basic:
 *               summary: Update basic menu properties
 *               value:
 *                 menu_label: "Updated Dashboard"
 *                 menu_icon: "fas fa-chart-pie"
 *                 menu_order: 5
 *             update_with_permissions:
 *               summary: Update menu with new permissions
 *               value:
 *                 menu_label: "HR Management"
 *                 is_active: true
 *                 permission_ids: [1, 2, 3, 4]
 *                 role_ids: [1, 2]
 *             deactivate_menu:
 *               summary: Deactivate menu
 *               value:
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Menu updated successfully
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
 *                   example: "Menu updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Validation error or business logic error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               circular_reference:
 *                 summary: Circular reference error
 *                 value:
 *                   success: false
 *                   message: "Menu cannot be its own parent"
 *                   errors:
 *                     - field: "parent_id"
 *                       message: "Circular reference not allowed"
 *               invalid_parent:
 *                 summary: Invalid parent menu
 *                 value:
 *                   success: false
 *                   message: "Parent menu not found"
 *                   errors:
 *                     - field: "parent_id"
 *                       message: "Parent menu does not exist"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Menu not found"
 *       409:
 *         description: Menu name conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Menu name already exists"
 *               errors:
 *                 - field: "menu_name"
 *                   message: "Menu name must be unique"
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
 *                   example: "Menu deleted successfully"
 *       400:
 *         description: Cannot delete menu with child menus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Cannot delete menu with child menus"
 *               errors:
 *                 - field: "id"
 *                   message: "Menu has 3 child menu(s)"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Menu not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Menu not found"
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
 *           examples:
 *             grant_access:
 *               summary: Grant access to menu
 *               value:
 *                 can_access: true
 *             revoke_access:
 *               summary: Revoke access to menu
 *               value:
 *                 can_access: false
 *     responses:
 *       200:
 *         description: Role menu access updated successfully
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
 *                   example: "Role menu access updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     role_id:
 *                       type: integer
 *                       example: 2
 *                     menu_id:
 *                       type: integer
 *                       example: 5
 *                     can_access:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Role or menu not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               role_not_found:
 *                 summary: Role not found
 *                 value:
 *                   success: false
 *                   message: "Role not found"
 *               menu_not_found:
 *                 summary: Menu not found
 *                 value:
 *                   success: false
 *                   message: "Menu not found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/roles/:role_id/menus/:menu_id/access', menuController.updateRoleMenuAccess);

/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: Authentication required
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             message: "Authentication required"
 *     Forbidden:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             message: "Insufficient permissions"
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             message: "Internal server error"
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation error"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "menu_name"
 *               message:
 *                 type: string
 *                 example: "Menu name is required"
 *               value:
 *                 description: The invalid value that was provided
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "View Dashboard"
 *         module:
 *           type: string
 *           example: "Dashboard"
 *         action:
 *           type: string
 *           example: "read"
 *         description:
 *           type: string
 *           example: "Can view dashboard"
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         role_name:
 *           type: string
 *           example: "Admin"
 *         description:
 *           type: string
 *           example: "System administrator"
 *         is_default:
 *           type: boolean
 *           example: false
 *         RoleMenuAccess:
 *           type: object
 *           properties:
 *             can_access:
 *               type: boolean
 *               example: true
 */

module.exports = router;