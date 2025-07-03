const Sequelize = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/dbConfig');
const logger = require('../utils/logger');

// Import models
const User = require('./User');
const Asset = require('./Asset');
const AssetMaintenance = require('./AssetMaintenance');
const Permission = require('./Permission');
const PurchaseRequest = require('./PurchaseRequest');
const RequisitionItem = require('./RequisitionItem');
const RequisitionAttachment = require('./RequisitionAttachment');
const RequisitionWorkflow = require('./RequisitionWorkflow');
const Department = require('./Department');
const BasicEmployeeData = require('./BasicEmployeeData');
const SalaryComponent = require('./SalaryComponent');
const Payroll = require('./Payroll');

// Initialize models
const models = {
  User,
  Asset,
  AssetMaintenance,
  Permission,
  PurchaseRequest,
  RequisitionItem,
  RequisitionAttachment,
  RequisitionWorkflow,
  Department,
  BasicEmployeeData,
  SalaryComponent,
  Payroll,
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