const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { updateUserValidator, createUserValidator } = require('../validators/userValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for name or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by user status
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female]
 *         description: Filter by gender
 *       - in: query
 *         name: department
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A paginated list of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/', authenticate, authorize(['Admin', 'HR Manager']), userController.getAllUsers);

router.patch('/:id/partial', authenticate, authorize(['Admin', 'HR Manager']), userController.updateEmployeePartial);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, userController.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               middle_name:
 *                 type: string
 *               sur_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               basic_employee_data:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [active, inactive, on leave, terminated]
 *                   registration_number:
 *                     type: string
 *                   date_joined:
 *                     type: string
 *                     format: date
 *                   designation:
 *                     type: string
 *                   employment_type:
 *                     type: string
 *                     enum: [full time, contract, intern, part time, volunteer]
 *                   department_id:
 *                     type: integer
 *                   salary:
 *                     type: number
 *                   supervisor_id:
 *                     type: integer
 *                   bank_name:
 *                     type: string
 *                   account_number:
 *                     type: string
 *                   nida:
 *                     type: string
 *                   bima:
 *                     type: string
 *                   nssf:
 *                     type: string
 *                   helsb:
 *                     type: string
 *               bio_data:
 *                 type: object
 *                 properties:
 *                   marital_status:
 *                     type: string
 *                     enum: [single, married, divorced, widowed]
 *                   dob:
 *                     type: string
 *                     format: date
 *                   national_id:
 *                     type: string
 *                   blood_group:
 *                     type: string
 *               personal_employee_data:
 *                 type: object
 *                 properties:
 *                   location:
 *                     type: string
 *                   education_level:
 *                     type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of role IDs
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       409:
 *         description: Email or phone already in use
 */
router.put('/:id', authenticate, authorize(['Admin', 'HR Manager']), updateUserValidator, validateRequest, userController.updateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user (sets status to inactive)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, authorize(['Admin']), userController.deleteUser);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user (admin function)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - sur_name
 *               - email
 *               - gender
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               middle_name:
 *                 type: string
 *                 description: User's middle name
 *               sur_name:
 *                 type: string
 *                 description: User's surname
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 description: User's gender
 *               password:
 *                 type: string
 *                 description: User's password (required if generate_random_password is false)
 *               generate_random_password:
 *                 type: boolean
 *                 description: Generate a random password for the user
 *                 default: false
 *               send_welcome_email:
 *                 type: boolean
 *                 description: Send welcome email to the user
 *                 default: true
 *               basic_employee_data:
 *                 type: object
 *                 description: Employee-specific data
 *               bio_data:
 *                 type: object
 *                 description: Biographical data
 *               personal_employee_data:
 *                 type: object
 *                 description: Personal employee information
 *               emergency_contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     relationship:
 *                       type: string
 *                 description: Emergency contacts
 *               next_of_kin:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     percentage:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 100
 *                     relationship:
 *                       type: string
 *                 description: Next of kin (percentages must sum to 100%)
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of role IDs to assign to the user
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: User already exists
 */
router.post('/', authenticate, authorize(['Admin', 'HR Manager']), createUserValidator, validateRequest, userController.createUser);

module.exports = router;