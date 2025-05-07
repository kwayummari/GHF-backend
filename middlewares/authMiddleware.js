const passport = require('passport');
const { StatusCodes } = require('http-status-codes');

/**
 * Middleware to authenticate users using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info.message || 'Unauthorized access',
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware to check if the user has required roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized access',
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
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