const Sequelize = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/dbConfig');
const logger = require('../utils/logger');

// Import models
const User = require('./User');
// Import other models here

// Initialize models
const models = {
  User,
  // Add other models here
};

// Associate models
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

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
  Sequelize,
  ...models,
  testConnection,
};