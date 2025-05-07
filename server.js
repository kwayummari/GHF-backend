const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const db = require('./models');

const server = http.createServer(app);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Sync database models
db.sequelize
  .sync({ alter: config.NODE_ENV === 'development' })
  .then(() => {
    logger.info('Database connected');
    
    // Start the server
    server.listen(config.PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`API Documentation available at http://localhost:${config.PORT}/api-docs`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });