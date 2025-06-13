const passport = require('passport');
const { StatusCodes } = require('http-status-codes');
const { checkPermissions } = require('./autoPermissionMiddleware');

/**
 * Combined authentication and permission middleware
 * This replaces the need for separate authenticate() and authorize() calls
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateAndAuthorize = (req, res, next) => {
    // First, authenticate the user
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err) {
            return next(err);
        }

        // For public routes, user might be null - that's okay
        if (user) {
            req.user = user;
        }

        // Now check permissions
        await checkPermissions(req, res, next);
    })(req, res, next);
};

module.exports = {
    authenticateAndAuthorize,
};