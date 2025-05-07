const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate a JWT token
 * @param {Object} payload - The data to include in the token
 * @param {Object} options - Additional options
 * @returns {string} - The JWT token
 */
const generateToken = (payload, options = {}) => {
  const { expiresIn = config.JWT.EXPIRES_IN, secret = config.JWT.SECRET } = options;
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate a refresh token
 * @param {Object} payload - The data to include in the token
 * @returns {string} - The refresh token
 */
const generateRefreshToken = (payload) => {
  return generateToken(payload, {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
    secret: config.JWT.REFRESH_SECRET,
  });
};

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @param {Object} options - Additional options
 * @returns {Object} - The decoded token payload
 */
const verifyToken = (token, options = {}) => {
  const { secret = config.JWT.SECRET } = options;
  
  return jwt.verify(token, secret);
};

/**
 * Verify a refresh token
 * @param {string} token - The token to verify
 * @returns {Object} - The decoded token payload
 */
const verifyRefreshToken = (token) => {
  return verifyToken(token, { secret: config.JWT.REFRESH_SECRET });
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};