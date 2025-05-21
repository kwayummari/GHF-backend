const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate a JWT token
 * @param {Object} payload - Data to include in the token
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT.SECRET, {
    expiresIn: config.JWT.EXPIRES_IN,
  });
};

/**
 * Generate a refresh token
 * @param {Object} payload - Data to include in the token
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.JWT.REFRESH_SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT.SECRET);
};

/**
 * Verify a refresh token
 * @param {string} token - Refresh token
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT.REFRESH_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};