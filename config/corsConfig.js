/**
 * CORS configuration
 */
const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Define whitelist of allowed origins
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://185.172.57.203',
      // Add production domains here
      'https://yourproductiondomain.com',
    ];
    
    // Check if origin is in whitelist
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

module.exports = corsConfig;