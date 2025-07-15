const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const passport = require('passport');
const { StatusCodes } = require('http-status-codes');

const config = require('./config/config');
const helmetConfig = require('./config/helmetConfig');
const corsConfig = require('./config/corsConfig');
const passportConfig = require('./config/passportConfig');
const swaggerConfig = require('./config/swaggerConfig');
const morganLogger = require('./middlewares/morganLogger');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const routes = require('./routes');
const { authenticateAndAuthorize } = require('./middlewares/combinedAuthMiddleware');
const { globalActivityLogger } = require('./middlewares/globalActivityLogger');

// Initialize Express app
const app = express();

// Security middlewares
app.use(helmet(helmetConfig));
app.use(cors(corsConfig));
app.use(rateLimiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance optimization
app.use(compression());

// Logging
app.use(morganLogger);

// Authentication
app.use(passport.initialize());
passportConfig(passport);

// API Documentation
swaggerConfig(app);

app.use(`/api/${config.API_VERSION}`, globalActivityLogger());

// Apply automatic authentication and authorization to all API routes
app.use('/api', authenticateAndAuthorize);

// Mount routes
app.use(`/api/${config.API_VERSION}`, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'UP', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Resource not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;