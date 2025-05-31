const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const { StatusCodes } = require('http-status-codes');
const config = require('./config/config');
const models = require('./models');
const passportConfig = require('./config/passportConfig');
const setupSwagger = require('./config/swaggerConfig');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Apply basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup logger
app.use(morgan('dev', { stream: logger.stream }));

// Initialize Passport
app.use(passport.initialize());
passportConfig(passport);

// Static files directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup API routes
app.use(`/api/${config.API_VERSION}`, routes);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Error handling
app.use((req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Endpoint not found',
  });
});

app.use(errorHandler);

// Start server
const PORT = config.PORT;

// Only start server if database connection is successful
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await models.testConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database. Server not started.');
      process.exit(1);
    }

    // Sync database models (this ensures associations are set up)
    await models.sequelize.sync({ alter: false });
    logger.info('Database models synchronized');

    app.listen(PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;