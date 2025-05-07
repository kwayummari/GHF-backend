const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');
const config = require('../config/config');

/**
 * Rate limiting middleware to prevent abuse
 */
const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
  // Skip rate limiting for trusted IPs (optional)
  skip: (req) => {
    const trustedIps = ['127.0.0.1'];
    return trustedIps.includes(req.ip);
  },
});

module.exports = rateLimiter;