/**
 * CORS configuration - allow all origins without credentials
 */

const corsConfig = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: false, // No credentials (cookies/auth headers)
  maxAge: 86400, // Cache preflight for 24 hours
};

module.exports = corsConfig;
