const passport = require('passport');
const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate users using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('Authentication error:', err);
      return next(err);
    }

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info?.message || 'Unauthorized access',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware to authorize users based on roles
 * @param {String[]} roles - Array of allowed roles
 * @returns {Function} - Express middleware
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user has any of the required roles
    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (roles.length > 0 && !hasRequiredRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};