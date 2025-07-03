const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Reset password routes
router.post('/request', passwordResetController.generateResetToken);
router.get('/validate/:token', passwordResetController.validateResetToken);
router.post('/reset', passwordResetController.resetPassword);

module.exports = router;
