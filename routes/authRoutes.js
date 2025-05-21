const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { loginValidator, resetPasswordValidator } = require('../validators/authValidator');
const { registerValidator } = require('../validators/userValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *               - password
 *               - confirm_password
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               middle_name:
 *                 type: string
 *                 description: User's middle name (optional)
 *               sur_name:
 *                 type: string
 *                 description: User's surname/last name
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
 *                 format: password
 *                 description: User's password
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 description: Confirm password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', registerValidator, validateRequest, authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, validateRequest, authController.login);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password is incorrect or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/change-password', authenticate, resetPasswordValidator, validateRequest, authController.changePassword);

module.exports = router;