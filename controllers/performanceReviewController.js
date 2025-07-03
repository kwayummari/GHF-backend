const { PerformanceReview, PerformanceMetric } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class PerformanceReviewController {
  // Get all performance reviews for a user
  static async getAllReviews(req, res) {
    try {
      const { userId } = req.params;
      const reviews = await PerformanceReview.findAll({
        where: {
          employee_id: userId
        },
        include: [
          {
            model: PerformanceMetric,
            as: 'metrics'
          },
          {
            model: User,
            as: 'reviewer'
          },
          {
            model: User,
            as: 'approver'
          }
        ],
        order: [['reviewDate', 'DESC']]
      });
      return res.json(reviews);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new performance review
  static async createReview(req, res) {
    try {
      const { userId } = req.user;
      const { employeeId, reviewPeriod, metrics } = req.body;

      // Create review
      const review = await PerformanceReview.create({
        employee_id: employeeId,
        review_by: userId,
        reviewPeriod,
        status: 'draft'
      });

      // Create metrics
      if (metrics && metrics.length > 0) {
        await PerformanceMetric.bulkCreate(metrics.map(metric => ({
          ...metric,
          review_id: review.id
        })));
      }

      return res.json(review);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Submit a performance review
  static async submitReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { metrics } = req.body;

      const review = await PerformanceReview.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Update metrics
      if (metrics) {
        await Promise.all(metrics.map(async metric => {
          if (metric.id) {
            await PerformanceMetric.update(metric, {
              where: { id: metric.id }
            });
          } else {
            await PerformanceMetric.create({
              ...metric,
              review_id: reviewId
            });
          }
        }));
      }

      // Calculate overall rating
      const metricsWithRatings = await PerformanceMetric.findAll({
        where: {
          review_id: reviewId,
          rating: {
            [Op.ne]: null
          }
        }
      });

      const totalRating = metricsWithRatings.reduce((sum, metric) => sum + metric.rating, 0);
      const averageRating = metricsWithRatings.length > 0 
        ? (totalRating / metricsWithRatings.length).toFixed(1)
        : null;

      // Update review status and rating
      await review.update({
        status: 'submitted',
        overallRating: averageRating
      });

      return res.json(review);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Approve a performance review
  static async approveReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { userId } = req.user;

      const review = await PerformanceReview.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      await review.update({
        status: 'completed',
        approved_by: userId,
        approvedDate: new Date()
      });

      return res.json(review);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PerformanceReviewController;
