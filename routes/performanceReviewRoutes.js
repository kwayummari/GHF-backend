const express = require('express');
const router = express.Router();
const performanceReviewController = require('../controllers/performanceReviewController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Performance Review Routes
router.get('/reviews/:userId', auth, performanceReviewController.getAllReviews);
router.post('/reviews', [auth, checkRole('manager', 'hr')], performanceReviewController.createReview);
router.put('/reviews/:reviewId/submit', auth, performanceReviewController.submitReview);
router.put('/reviews/:reviewId/approve', [auth, checkRole('manager', 'hr')], performanceReviewController.approveReview);

module.exports = router;
