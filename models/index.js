const {Sequelize} = require('sequelize');
const {sequelize} = require('../config/dbConfig');
const logger = require('../utils/logger');

// Import all models
const User = require('./User');
const Department = require('./Department');
const BasicEmployeeData = require('./BasicEmployeeData');
const BioData = require('./BioData');
const PersonalEmployeeData = require('./PersonalEmployeeData');
const EmergencyContact = require('./EmergencyContact');
const NextOfKin = require('./NextOfKin');
const Fingerprint = require('./Fingerprint');
const LeaveType = require('./LeaveType');
const LeaveApplication = require('./LeaveApplication');
const WorkScheduler = require('./WorkScheduler');
const HolidayList = require('./HolidayList');
const Attendance = require('./Attendance');
const Document = require('./Document');
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');
const FiscalYear = require('./FiscalYear');
const Quarter = require('./Quarter');
const Budget = require('./Budget');
const BudgetExpense = require('./BudgetExpense');
const PurchaseRequest = require('./PurchaseRequest');
const Supplier = require('./Supplier');
const Quotation = require('./Quotation');
const LPO = require('./LPO');
const FlatRate = require('./FlatRate');
const TravelAdvanceRequest = require('./TravelAdvanceRequest');
const ExpenseReport = require('./ExpenseReport');
const ExpenseLine = require('./ExpenseLine');
const PettyCashBook = require('./PettyCashBook');
const PettyCashExpense = require('./PettyCashExpense');
const ReplenishmentRequest = require('./ReplenishmentRequest');
const MeetingRecord = require('./MeetingRecord');
const MeetingTask = require('./MeetingTask');
const Notification = require('./Notification');
const Objective = require('./Objective');
const AppraisalForm = require('./AppraisalForm');
const Increment = require('./Increment');
const Payroll = require('./Payroll');
const SalaryComponent = require('./SalaryComponent');
const Menu = require('./Menu');
const MenuPermission = require('./MenuPermission');
const RoleMenuAccess = require('./RoleMenuAccess');

// Initialize models object with all models
const models = {
  User,
  Department,
  BasicEmployeeData,
  BioData,
  PersonalEmployeeData,
  EmergencyContact,
  NextOfKin,
  Fingerprint,
  LeaveType,
  LeaveApplication,
  WorkScheduler,
  HolidayList,
  Attendance,
  Document,
  Role,
  Permission,
  UserRole,
  RolePermission,
  FiscalYear,
  Quarter,
  Budget,
  BudgetExpense,
  PurchaseRequest,
  Supplier,
  Quotation,
  LPO,
  FlatRate,
  TravelAdvanceRequest,
  ExpenseReport,
  ExpenseLine,
  PettyCashBook,
  PettyCashExpense,
  ReplenishmentRequest,
  MeetingRecord,
  MeetingTask,
  Notification,
  Objective,
  AppraisalForm,
  Increment,
  Payroll,
  SalaryComponent,
  Menu,
  MenuPermission,
  RoleMenuAccess
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