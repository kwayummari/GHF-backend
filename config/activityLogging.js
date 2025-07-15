module.exports = {
    // Enable/disable global logging
    enabled: process.env.ACTIVITY_LOGGING_ENABLED !== 'false',

    // Routes to exclude from logging
    excludedRoutes: [
        '/api/v1/settings/logs',
        '/api-docs',
        '/favicon.ico',
        '/health',
        '/metrics'
    ],

    // Skip frequent read operations
    skipLogRoutes: [
        'GET /api/v1/settings/logs',
        'GET /api/v1/users/profile',
        'GET /api/v1/menus/user',
        'GET /api/v1/attendance/my-attendance'
    ],

    // Log retention (days)
    retentionDays: 90,

    // Maximum metadata size (to prevent huge logs)
    maxMetadataSize: 1000
  };