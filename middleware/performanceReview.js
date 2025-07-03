const { PerformanceReview } = require('../models');

// Validate review period
const validateReviewPeriod = async (req, res, next) => {
  try {
    const { reviewPeriod } = req.body;
    
    // Check if review period is valid format
    if (!reviewPeriod.match(/^(\d{4}|Q[1-4]|H[1-2])$/)) {
      return res.status(400).json({ error: 'Invalid review period format' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check review existence
const checkReviewExists = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await PerformanceReview.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    req.review = review;
    next();
  } catch (error) {
    next(error);
  }
};

// Check review status
const checkReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['draft', 'submitted', 'reviewed', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateReviewPeriod,
  checkReviewExists,
  checkReviewStatus
};
