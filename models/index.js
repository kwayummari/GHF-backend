const Sequelize = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/dbConfig');
const logger = require('../utils/logger');

// Import models
const User = require('./User');
const Department = require('./Department');
const Permission = require('./Permission');
const SalaryComponent = require('./SalaryComponent');
const PurchaseRequest = require('./PurchaseRequest');
const RequisitionItem = require('./RequisitionItem');
const RequisitionAttachment = require('./RequisitionAttachment');
const RequisitionWorkflow = require('./RequisitionWorkflow');
const Asset = require('./Asset');
const AssetMaintenance = require('./AssetMaintenance');
const Payroll = require('./Payroll');
const BioData = require('./BioData');
const BonusRecord = require('./BonusRecord');
const BudgetExpense = require('./BudgetExpense');
const BasicEmployeeData = require('./BasicEmployeeData');
const Attendance = require('./Attendance');
const AttendanceRecord = require('./AttendanceRecord');
const BankAccount = require('./BankAccount');
const HolidayList = require('./HolidayList');
const LoanInstallment = require('./LoanInstallment');
const Meeting = require('./Meeting');
const MeetingAttendee = require('./MeetingAttendee');
const MeetingAttachment = require('./MeetingAttachment');
const MeetingTask = require('./MeetingTask');
const Objective = require('./Objective');

// Define associations
User.hasMany(PurchaseRequest, { foreignKey: 'user_id' });
PurchaseRequest.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RequisitionWorkflow, { foreignKey: 'user_id' });
RequisitionWorkflow.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Asset, { foreignKey: 'custodian_id' });
Asset.belongsTo(User, { foreignKey: 'custodian_id' });

User.hasMany(AssetMaintenance, { foreignKey: 'created_by' });
AssetMaintenance.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Payroll, { foreignKey: 'employee_id' });
Payroll.belongsTo(User, { foreignKey: 'employee_id' });

Department.hasMany(Asset, { foreignKey: 'department_id' });
Asset.belongsTo(Department, { foreignKey: 'department_id' });

Department.hasMany(Payroll, { foreignKey: 'department_id' });
Payroll.belongsTo(Department, { foreignKey: 'department_id' });

// New associations
User.hasOne(BioData, { foreignKey: 'user_id' });
BioData.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(BasicEmployeeData, { foreignKey: 'user_id' });
BasicEmployeeData.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(BonusRecord, { foreignKey: 'user_id' });
BonusRecord.belongsTo(User, { foreignKey: 'user_id' });

BonusRecord.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver'
});

BudgetExpense.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Attendance associations
User.hasMany(Attendance, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AttendanceRecord, { foreignKey: 'user_id' });
AttendanceRecord.belongsTo(User, { foreignKey: 'user_id' });

// Bank Account associations
User.hasMany(BankAccount, { foreignKey: 'user_id' });
BankAccount.belongsTo(User, { foreignKey: 'user_id' });

// Holiday List associations
User.hasMany(HolidayList, { foreignKey: 'created_by' });
HolidayList.belongsTo(User, { foreignKey: 'created_by' });

HolidayList.belongsTo(User, {
  foreignKey: 'updated_by',
  as: 'updater'
});

// Loan Installment associations
LoanInstallment.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Meeting associations
User.hasMany(Meeting, { foreignKey: 'created_by' });
Meeting.belongsTo(User, { foreignKey: 'created_by' });

Meeting.hasMany(MeetingAttendee, { foreignKey: 'meeting_id' });
MeetingAttendee.belongsTo(Meeting, { foreignKey: 'meeting_id' });

Meeting.hasMany(MeetingAttachment, { foreignKey: 'meeting_id' });
MeetingAttachment.belongsTo(Meeting, { foreignKey: 'meeting_id' });

Meeting.hasMany(MeetingTask, { foreignKey: 'meeting_id' });
MeetingTask.belongsTo(Meeting, { foreignKey: 'meeting_id' });

MeetingAttendee.belongsTo(User, { foreignKey: 'user_id' });

MeetingAttachment.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'uploader'
});

MeetingTask.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

MeetingTask.belongsTo(User, {
  foreignKey: 'completed_by',
  as: 'completer'
});

// Objective associations
User.hasMany(Objective, { foreignKey: 'user_id' });
Objective.belongsTo(User, { foreignKey: 'user_id' });

Objective.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver'
});

// Initialize models
const models = {
  User,
  Department,
  Permission,
  SalaryComponent,
  PurchaseRequest,
  RequisitionItem,
  RequisitionAttachment,
  RequisitionWorkflow,
  Asset,
  AssetMaintenance,
  Payroll,
  BioData,
  BonusRecord,
  BudgetExpense,
  BasicEmployeeData,
  Attendance,
  AttendanceRecord,
  BankAccount,
  HolidayList,
  LoanInstallment,
  Meeting,
  MeetingAttendee,
  MeetingAttachment,
  MeetingTask,
  Objective,
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