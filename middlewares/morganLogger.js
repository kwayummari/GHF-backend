const morgan = require('morgan');
const config = require('../config/config');
const logger = require('../utils/logger');

// Skip logging in test environment
const skip = () => {
  return config.NODE_ENV === 'test';
};

// Define custom token for request body (sanitized)
morgan.token('body', (req) => {
  if (!req.body) return '';
  
  const sanitized = { ...req.body };
  
  // Remove sensitive data
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.passwordConfirmation) sanitized.passwordConfirmation = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  
  return JSON.stringify(sanitized);
});

// Define format based on environment
const format = config.NODE_ENV === 'development'
  ? ':method :url :status :response-time ms - :res[content-length] :body'
  : ':remote-addr - :method :url :status :response-time ms - :res[content-length]';

// Create and export the middleware
const morganMiddleware = morgan(format, {
  stream: logger.stream,
  skip,
});

module.exports = morganMiddleware;