const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('../utils/logger');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.dialect || 'mysql',
    pool: config.DB.pool,
    logging: config.NODE_ENV === 'development' ? 
      (msg) => logger.debug(msg) : 
      false,
    define: {
      timestamps: true,
      underscored: true,
    },
    timezone: '+00:00', // UTC
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
}