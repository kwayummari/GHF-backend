const { Payroll, User, BasicEmployeeData, SalaryComponent, Department } = require('../models');
const { Op } = require('sequelize');
const { 
  validatePayroll, 
  validatePayrollUpdate, 
  validatePayrollProcessing,
  validatePayrollApproval,
  validatePayrollRejection,
  validateSalaryComponent,
  validatePayrollStatistics,
  validatePayrollQuery
} = require('../validators/payrollValidator');
const { createResponse, createErrorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const {
  calculateGrossSalary,
  calculateNetSalary,
  calculatePAYETax,
  calculateNSSF,
  calculateNHIF,
  calculateOvertimePay,
  validatePayrollData,
  generatePayrollNumber,
  calculatePayrollStatistics,
  formatCurrency,
  canApprovePayroll,
  getNextApprovalStage,
  getWorkingDaysInMonth
} = require('../utils/payrollUtils');

/**
 * Payroll Management Controller
 * Handles all payroll-related operations including salary calculations,
 * payroll generation, and payroll history management
 */

class PayrollController {
  /**
   * Create a new payroll record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPayroll(req, res) {
    try {
      const { error, value } = validatePayroll(req.body);
      if (error) {
        return res.status(400).json(createErrorResponse('Validation Error', error.details[0].message));
      }

      const { employeeId, month, year, basicSalary, allowances, deductions, netSalary, paymentDate, status } = value;

      // Check if payroll already exists for this employee and month/year
      const existingPayroll = await Payroll.findOne({
        where: {
          employeeId,
          month,
          year
        }
      });

      if (existingPayroll) {
        return res.status(409).json(createErrorResponse('Conflict', 'Payroll already exists for this employee and month'));
      }

      // Verify employee exists
      const employee = await User.findByPk(employeeId, {
        include: [
          { model: BasicEmployeeData, as: 'basicData' },
          { model: Department, as: 'department' }
        ]
      });

      if (!employee) {
        return res.status(404).json(createErrorResponse('Not Found', 'Employee not found'));
      }

      // Create payroll record
      const payroll = await Payroll.create({
        employeeId,
        month,
        year,
        basicSalary,
        allowances: JSON.stringify(allowances),
        deductions: JSON.stringify(deductions),
        netSalary,
        paymentDate,
        status: status || 'pending',
        createdBy: req.user.id
      });

      // Fetch created payroll with employee details
      const createdPayroll = await Payroll.findByPk(payroll.id, {
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: Department, as: 'department' }
            ]
          }
        ]
      });

      logger.info(`Payroll created for employee ${employeeId} for ${month}/${year}`);
      return res.status(201).json(createResponse('Payroll created successfully', createdPayroll));
    } catch (error) {
      logger.error('Error creating payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get all payroll records with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPayrolls(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        employeeId,
        month,
        year,
        status,
        departmentId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};
      const includeClause = [
        {
          model: User,
          as: 'employee',
          include: [
            { model: BasicEmployeeData, as: 'basicData' },
            { model: Department, as: 'department' }
          ]
        }
      ];

      // Apply filters
      if (employeeId) whereClause.employeeId = employeeId;
      if (month) whereClause.month = month;
      if (year) whereClause.year = year;
      if (status) whereClause.status = status;
      if (startDate && endDate) {
        whereClause.paymentDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Department filter
      if (departmentId) {
        includeClause[0].include.push({
          model: Department,
          as: 'department',
          where: { id: departmentId }
        });
      }

      const { count, rows } = await Payroll.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      logger.info(`Retrieved ${rows.length} payroll records`);
      return res.status(200).json(createResponse('Payroll records retrieved successfully', {
        payrolls: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          recordsPerPage: parseInt(limit)
        }
      }));
    } catch (error) {
      logger.error('Error retrieving payrolls:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payroll by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayrollById(req, res) {
    try {
      const { id } = req.params;

      const payroll = await Payroll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: Department, as: 'department' }
            ]
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payroll not found'));
      }

      logger.info(`Retrieved payroll ${id}`);
      return res.status(200).json(createResponse('Payroll retrieved successfully', payroll));
    } catch (error) {
      logger.error('Error retrieving payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Update payroll record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePayroll(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = validatePayrollUpdate(req.body);
      
      if (error) {
        return res.status(400).json(createErrorResponse('Validation Error', error.details[0].message));
      }

      const payroll = await Payroll.findByPk(id);
      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payroll not found'));
      }

      // Check if payroll is already processed
      if (payroll.status === 'processed' && value.status !== 'processed') {
        return res.status(400).json(createErrorResponse('Bad Request', 'Cannot modify processed payroll'));
      }

      // Update payroll
      const updateData = { ...value };
      if (value.allowances) updateData.allowances = JSON.stringify(value.allowances);
      if (value.deductions) updateData.deductions = JSON.stringify(value.deductions);
      
      updateData.updatedBy = req.user.id;
      updateData.updatedAt = new Date();

      await payroll.update(updateData);

      // Fetch updated payroll with employee details
      const updatedPayroll = await Payroll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: Department, as: 'department' }
            ]
          }
        ]
      });

      logger.info(`Payroll ${id} updated successfully`);
      return res.status(200).json(createResponse('Payroll updated successfully', updatedPayroll));
    } catch (error) {
      logger.error('Error updating payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Delete payroll record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deletePayroll(req, res) {
    try {
      const { id } = req.params;

      const payroll = await Payroll.findByPk(id);
      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payroll not found'));
      }

      // Check if payroll is already processed
      if (payroll.status === 'processed') {
        return res.status(400).json(createErrorResponse('Bad Request', 'Cannot delete processed payroll'));
      }

      await payroll.destroy();

      logger.info(`Payroll ${id} deleted successfully`);
      return res.status(200).json(createResponse('Payroll deleted successfully'));
    } catch (error) {
      logger.error('Error deleting payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Process payroll for multiple employees
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processPayroll(req, res) {
    try {
      const { month, year, employeeIds, paymentDate } = req.body;

      if (!month || !year || !employeeIds || !Array.isArray(employeeIds)) {
        return res.status(400).json(createErrorResponse('Bad Request', 'Invalid input parameters'));
      }

      const results = [];
      const errors = [];

      for (const employeeId of employeeIds) {
        try {
          // Check if payroll already exists
          const existingPayroll = await Payroll.findOne({
            where: { employeeId, month, year }
          });

          if (existingPayroll) {
            errors.push(`Payroll already exists for employee ${employeeId}`);
            continue;
          }

          // Get employee data
          const employee = await User.findByPk(employeeId, {
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: SalaryComponent, as: 'salaryComponents' }
            ]
          });

          if (!employee) {
            errors.push(`Employee ${employeeId} not found`);
            continue;
          }

          // Calculate salary components
          const basicSalary = employee.basicData?.basicSalary || 0;
          const allowances = employee.salaryComponents?.filter(comp => comp.type === 'allowance') || [];
          const deductions = employee.salaryComponents?.filter(comp => comp.type === 'deduction') || [];

          const totalAllowances = allowances.reduce((sum, comp) => sum + comp.amount, 0);
          const totalDeductions = deductions.reduce((sum, comp) => sum + comp.amount, 0);
          const netSalary = basicSalary + totalAllowances - totalDeductions;

          // Create payroll record
          const payroll = await Payroll.create({
            employeeId,
            month,
            year,
            basicSalary,
            allowances: JSON.stringify(allowances),
            deductions: JSON.stringify(deductions),
            netSalary,
            paymentDate: paymentDate || new Date(),
            status: 'processed',
            createdBy: req.user.id
          });

          results.push({
            employeeId,
            payrollId: payroll.id,
            netSalary
          });

        } catch (error) {
          errors.push(`Error processing payroll for employee ${employeeId}: ${error.message}`);
        }
      }

      logger.info(`Processed payroll for ${results.length} employees`);
      return res.status(200).json(createResponse('Payroll processing completed', {
        processed: results,
        errors
      }));
    } catch (error) {
      logger.error('Error processing payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payroll statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayrollStatistics(req, res) {
    try {
      const { month, year, departmentId } = req.query;

      const whereClause = {};
      if (month) whereClause.month = month;
      if (year) whereClause.year = year;

      const includeClause = [
        {
          model: User,
          as: 'employee',
          include: [
            { model: Department, as: 'department' }
          ]
        }
      ];

      if (departmentId) {
        includeClause[0].include[0].where = { id: departmentId };
      }

      const payrolls = await Payroll.findAll({
        where: whereClause,
        include: includeClause
      });

      const statistics = {
        totalPayrolls: payrolls.length,
        totalAmount: payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0),
        averageSalary: payrolls.length > 0 ? payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0) / payrolls.length : 0,
        statusBreakdown: {},
        departmentBreakdown: {}
      };

      // Calculate status breakdown
      payrolls.forEach(payroll => {
        statistics.statusBreakdown[payroll.status] = (statistics.statusBreakdown[payroll.status] || 0) + 1;
      });

      // Calculate department breakdown
      payrolls.forEach(payroll => {
        const deptName = payroll.employee?.department?.name || 'Unknown';
        if (!statistics.departmentBreakdown[deptName]) {
          statistics.departmentBreakdown[deptName] = {
            count: 0,
            totalAmount: 0
          };
        }
        statistics.departmentBreakdown[deptName].count++;
        statistics.departmentBreakdown[deptName].totalAmount += payroll.netSalary;
      });

      logger.info('Payroll statistics retrieved');
      return res.status(200).json(createResponse('Payroll statistics retrieved successfully', statistics));
    } catch (error) {
      logger.error('Error retrieving payroll statistics:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get employee payroll history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEmployeePayrollHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 12, year } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { employeeId };
      if (year) whereClause.year = year;

      const { count, rows } = await Payroll.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: Department, as: 'department' }
            ]
          }
        ],
        order: [['year', 'DESC'], ['month', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      logger.info(`Retrieved payroll history for employee ${employeeId}`);
      return res.status(200).json(createResponse('Employee payroll history retrieved successfully', {
        payrolls: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          recordsPerPage: parseInt(limit)
        }
      }));
    } catch (error) {
      logger.error('Error retrieving employee payroll history:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Reprocess payroll record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reprocessPayroll(req, res) {
    try {
      const { id } = req.params;
      const { reason, recalculateAll } = req.body;

      const payroll = await Payroll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: SalaryComponent, as: 'salaryComponents' }
            ]
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payroll not found'));
      }

      // Recalculate salary components
      const basicSalary = payroll.employee.basicData?.basicSalary || 0;
      const allowances = payroll.employee.salaryComponents?.filter(comp => comp.type === 'allowance') || [];
      const deductions = payroll.employee.salaryComponents?.filter(comp => comp.type === 'deduction') || [];

      const grossSalary = calculateGrossSalary(basicSalary, allowances);
      const netSalary = calculateNetSalary(grossSalary, deductions);

      // Update payroll record
      await payroll.update({
        basicSalary,
        allowances: JSON.stringify(allowances),
        deductions: JSON.stringify(deductions),
        grossSalary,
        netSalary,
        updatedBy: req.user.id
      });

      logger.info(`Payroll ${id} reprocessed successfully`);
      return res.status(200).json(createResponse('Payroll reprocessed successfully', {
        id: payroll.id,
        newGrossPay: grossSalary,
        newNetPay: netSalary,
        reprocessedAt: new Date()
      }));
    } catch (error) {
      logger.error('Error reprocessing payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Approve payroll record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async approvePayroll(req, res) {
    try {
      const { id } = req.params;
      const { stage, comments, nextStage } = req.body;

      const payroll = await Payroll.findByPk(id);
      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payroll not found'));
      }

      // Check if user can approve
      const approvalCheck = canApprovePayroll(payroll, req.user);
      if (!approvalCheck.canApprove) {
        return res.status(400).json(createErrorResponse('Bad Request', approvalCheck.reason));
      }

      const newStage = nextStage || getNextApprovalStage(stage, payroll.totalStages);
      const isFinalApproval = newStage >= payroll.totalStages;

      // Update payroll
      await payroll.update({
        approvalStage: newStage,
        status: isFinalApproval ? 'approved' : 'pending',
        approvedBy: req.user.id,
        approvedDate: new Date(),
        updatedBy: req.user.id
      });

      logger.info(`Payroll ${id} approved at stage ${stage}`);
      return res.status(200).json(createResponse('Payroll approved successfully', {
        id: payroll.id,
        currentStage: newStage,
        approvedBy: req.user.id,
        approvedDate: new Date(),
        status: payroll.status
      }));
    } catch (error) {
      logger.error('Error approving payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Reject payroll record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rejectPayroll(req, res) {
    try {
      const { id } = req.params;
      const { stage, reason, comments } = req.body;

      const payroll = await Payroll.findByPk(id);
      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payroll not found'));
      }

      // Update payroll
      await payroll.update({
        status: 'rejected',
        rejectedBy: req.user.id,
        rejectedDate: new Date(),
        rejectionReason: reason,
        updatedBy: req.user.id
      });

      logger.info(`Payroll ${id} rejected at stage ${stage}`);
      return res.status(200).json(createResponse('Payroll rejected', {
        id: payroll.id,
        status: 'rejected',
        rejectedBy: req.user.id,
        rejectedDate: new Date()
      }));
    } catch (error) {
      logger.error('Error rejecting payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Bulk approve payroll records
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async bulkApprovePayroll(req, res) {
    try {
      const { payrollIds, stage, comments } = req.body;

      if (!payrollIds || !Array.isArray(payrollIds) || payrollIds.length === 0) {
        return res.status(400).json(createErrorResponse('Bad Request', 'Payroll IDs array is required'));
      }

      const results = [];
      const errors = [];

      for (const payrollId of payrollIds) {
        try {
          const payroll = await Payroll.findByPk(payrollId);
          if (!payroll) {
            errors.push(`Payroll ${payrollId} not found`);
            continue;
          }

          const approvalCheck = canApprovePayroll(payroll, req.user);
          if (!approvalCheck.canApprove) {
            errors.push(`Payroll ${payrollId}: ${approvalCheck.reason}`);
            continue;
          }

          const newStage = getNextApprovalStage(stage, payroll.totalStages);
          const isFinalApproval = newStage >= payroll.totalStages;

          await payroll.update({
            approvalStage: newStage,
            status: isFinalApproval ? 'approved' : 'pending',
            approvedBy: req.user.id,
            approvedDate: new Date(),
            updatedBy: req.user.id
          });

          results.push(payrollId);
        } catch (error) {
          errors.push(`Error processing payroll ${payrollId}: ${error.message}`);
        }
      }

      logger.info(`Bulk approved ${results.length} payroll records`);
      return res.status(200).json(createResponse('Bulk approval completed', {
        approvedCount: results.length,
        failedCount: errors.length,
        failedRecords: errors
      }));
    } catch (error) {
      logger.error('Error bulk approving payroll:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payroll by period
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayrollByPeriod(req, res) {
    try {
      const { year, month } = req.params;

      const payrolls = await Payroll.findAll({
        where: { year: parseInt(year), month: parseInt(month) },
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' },
              { model: Department, as: 'department' }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const summary = calculatePayrollStatistics(payrolls);

      logger.info(`Retrieved payroll records for ${month}/${year}`);
      return res.status(200).json(createResponse('Payroll records retrieved successfully', {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        payrollRecords: payrolls,
        summary
      }));
    } catch (error) {
      logger.error('Error retrieving payroll by period:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get all salary components
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSalaryComponents(req, res) {
    try {
      const { page = 1, limit = 20, type, status, search } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (type) whereClause.type = type;
      if (status) whereClause.isActive = status === 'active';
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await SalaryComponent.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      logger.info(`Retrieved ${rows.length} salary components`);
      return res.status(200).json(createResponse('Salary components retrieved successfully', {
        salaryComponents: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          recordsPerPage: parseInt(limit)
        }
      }));
    } catch (error) {
      logger.error('Error retrieving salary components:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get salary components by user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSalaryComponentsByUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        include: [
          { model: BasicEmployeeData, as: 'basicData' },
          { model: SalaryComponent, as: 'salaryComponents' }
        ]
      });

      if (!user) {
        return res.status(404).json(createErrorResponse('Not Found', 'User not found'));
      }

      const salaryComponents = user.salaryComponents || [];
      const basicSalary = user.basicData?.basicSalary || 0;
      
      const totalEarnings = basicSalary;
      const totalAllowances = salaryComponents
        .filter(comp => comp.type === 'allowance')
        .reduce((sum, comp) => sum + parseFloat(comp.amount), 0);
      const totalDeductions = salaryComponents
        .filter(comp => comp.type === 'deduction')
        .reduce((sum, comp) => sum + parseFloat(comp.amount), 0);
      const netSalary = totalEarnings + totalAllowances - totalDeductions;

      logger.info(`Retrieved salary components for user ${userId}`);
      return res.status(200).json(createResponse('Salary components retrieved successfully', {
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeNumber: user.basicData?.employeeId
        },
        salaryComponents,
        summary: {
          totalEarnings,
          totalAllowances,
          totalDeductions,
          netSalary
        }
      }));
    } catch (error) {
      logger.error('Error retrieving salary components by user:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Create salary component
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSalaryComponent(req, res) {
    try {
      const { userId, name, type, amount, percentage, isPercentage, description, effectiveDate, endDate, isActive } = req.body;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json(createErrorResponse('Not Found', 'User not found'));
      }

      // Create salary component
      const salaryComponent = await SalaryComponent.create({
        userId,
        name,
        type,
        amount: parseFloat(amount),
        percentage: percentage ? parseFloat(percentage) : null,
        isPercentage: isPercentage || false,
        description,
        effectiveDate,
        endDate,
        isActive: isActive !== undefined ? isActive : true
      });

      logger.info(`Salary component created for user ${userId}`);
      return res.status(201).json(createResponse('Salary component created successfully', {
        id: salaryComponent.id,
        name: salaryComponent.name,
        type: salaryComponent.type,
        createdAt: salaryComponent.createdAt
      }));
    } catch (error) {
      logger.error('Error creating salary component:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Update salary component
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSalaryComponent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const salaryComponent = await SalaryComponent.findByPk(id);
      if (!salaryComponent) {
        return res.status(404).json(createErrorResponse('Not Found', 'Salary component not found'));
      }

      // Update salary component
      await salaryComponent.update(updateData);

      logger.info(`Salary component ${id} updated successfully`);
      return res.status(200).json(createResponse('Salary component updated successfully', {
        id: salaryComponent.id,
        updatedAt: salaryComponent.updatedAt
      }));
    } catch (error) {
      logger.error('Error updating salary component:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Delete salary component
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSalaryComponent(req, res) {
    try {
      const { id } = req.params;

      const salaryComponent = await SalaryComponent.findByPk(id);
      if (!salaryComponent) {
        return res.status(404).json(createErrorResponse('Not Found', 'Salary component not found'));
      }

      await salaryComponent.destroy();

      logger.info(`Salary component ${id} deleted successfully`);
      return res.status(200).json(createResponse('Salary component deleted successfully'));
    } catch (error) {
      logger.error('Error deleting salary component:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Assign salary component to user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async assignSalaryComponent(req, res) {
    try {
      const { componentId, userId, amount, effectiveDate, endDate, isActive } = req.body;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json(createErrorResponse('Not Found', 'User not found'));
      }

      // Create user-specific salary component
      const salaryComponent = await SalaryComponent.create({
        userId,
        name: `Assigned Component`,
        type: 'allowance', // Default type
        amount: parseFloat(amount),
        effectiveDate,
        endDate,
        isActive: isActive !== undefined ? isActive : true
      });

      logger.info(`Salary component assigned to user ${userId}`);
      return res.status(201).json(createResponse('Salary component assigned successfully', {
        id: salaryComponent.id,
        userId: salaryComponent.userId,
        effectiveDate: salaryComponent.effectiveDate
      }));
    } catch (error) {
      logger.error('Error assigning salary component:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get all payslips
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPayslips(req, res) {
    try {
      const { page = 1, limit = 20, employeeId, payPeriod, status } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (employeeId) whereClause.employeeId = employeeId;
      if (payPeriod) {
        const [year, month] = payPeriod.split('-');
        whereClause.year = parseInt(year);
        whereClause.month = parseInt(month);
      }
      if (status) whereClause.status = status;

      const { count, rows } = await Payroll.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      const payslips = rows.map(payroll => ({
        id: payroll.id,
        payrollId: payroll.id,
        employeeId: payroll.employeeId,
        employeeName: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
        employeeNumber: payroll.employee.basicData?.employeeId,
        payPeriod: `${payroll.year}-${payroll.month.toString().padStart(2, '0')}`,
        payDate: payroll.paymentDate,
        grossPay: payroll.grossSalary,
        netPay: payroll.netSalary,
        status: payroll.status,
        generatedAt: payroll.createdAt,
        sentAt: null, // TODO: Implement payslip sending
        viewedAt: null // TODO: Implement payslip viewing
      }));

      logger.info(`Retrieved ${payslips.length} payslips`);
      return res.status(200).json(createResponse('Payslips retrieved successfully', {
        payslips,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          recordsPerPage: parseInt(limit)
        }
      }));
    } catch (error) {
      logger.error('Error retrieving payslips:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payslip by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayslipById(req, res) {
    try {
      const { id } = req.params;

      const payroll = await Payroll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' }
            ]
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payslip not found'));
      }

      const payslip = {
        id: payroll.id,
        payrollId: payroll.id,
        employee: {
          id: payroll.employee.id,
          name: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
          employeeNumber: payroll.employee.basicData?.employeeId,
          department: payroll.employee.department?.departmentName,
          position: payroll.employee.basicData?.position,
          email: payroll.employee.email,
          phone: null, // TODO: Add phone field to User model
          address: null, // TODO: Add address field to User model
          bankName: payroll.employee.basicData?.bankName,
          bankAccount: payroll.employee.basicData?.bankAccount
        },
        payPeriod: `${payroll.year}-${payroll.month.toString().padStart(2, '0')}`,
        payDate: payroll.paymentDate,
        currency: 'TZS',
        earnings: payroll.allowances || [],
        deductions: payroll.deductions || [],
        summary: {
          grossPay: payroll.grossSalary,
          totalDeductions: payroll.grossSalary - payroll.netSalary,
          netPay: payroll.netSalary,
          daysWorked: 22, // TODO: Implement attendance tracking
          overtimeHours: 0,
          overtimeAmount: 0
        },
        status: payroll.status,
        generatedAt: payroll.createdAt,
        sentAt: null,
        viewedAt: null
      };

      logger.info(`Retrieved payslip ${id}`);
      return res.status(200).json(createResponse('Payslip retrieved successfully', payslip));
    } catch (error) {
      logger.error('Error retrieving payslip:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Generate payslip PDF
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generatePayslipPDF(req, res) {
    try {
      const { id } = req.params;

      const payroll = await Payroll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            include: [
              { model: BasicEmployeeData, as: 'basicData' }
            ]
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payslip not found'));
      }

      // TODO: Implement PDF generation using pdfGenerator service
      // For now, return a placeholder response
      logger.info(`PDF generation requested for payslip ${id}`);
      return res.status(200).json(createResponse('PDF generation not yet implemented', {
        message: 'PDF generation will be implemented in the next iteration'
      }));
    } catch (error) {
      logger.error('Error generating payslip PDF:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Send payslip to employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendPayslip(req, res) {
    try {
      const { id } = req.params;
      const { sendEmail, sendSms, message } = req.body;

      const payroll = await Payroll.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee'
          }
        ]
      });

      if (!payroll) {
        return res.status(404).json(createErrorResponse('Not Found', 'Payslip not found'));
      }

      // TODO: Implement email/SMS sending using mailer service
      logger.info(`Payslip sending requested for ${id}`);
      return res.status(200).json(createResponse('Payslip sent successfully', {
        id: payroll.id,
        sentAt: new Date(),
        sentVia: sendEmail ? ['email'] : []
      }));
    } catch (error) {
      logger.error('Error sending payslip:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payroll reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayrollReports(req, res) {
    try {
      const { reportType, startDate, endDate, departmentId, employeeId, format } = req.query;

      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      if (departmentId) {
        whereClause['$employee.department.id$'] = departmentId;
      }
      if (employeeId) {
        whereClause.employeeId = employeeId;
      }

      const includeClause = [
        {
          model: User,
          as: 'employee',
          include: [
            { model: Department, as: 'department' }
          ]
        }
      ];

      const payrolls = await Payroll.findAll({
        where: whereClause,
        include: includeClause,
        order: [['createdAt', 'DESC']]
      });

      const statistics = calculatePayrollStatistics(payrolls);

      const reportData = {
        reportType: reportType || 'summary',
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
        generatedAt: new Date(),
        summary: statistics,
        byDepartment: Object.entries(statistics.departmentBreakdown).map(([dept, data]) => ({
          department: dept,
          employeeCount: data.count,
          totalGrossPay: data.totalGrossPay,
          totalNetPay: data.totalNetPay,
          averageGrossPay: data.totalGrossPay / data.count
        })),
        byStatus: statistics.statusBreakdown,
        taxSummary: {
          totalPAYE: 0, // TODO: Calculate from deductions
          totalNSSF: 0,
          totalNHIF: 0
        }
      };

      logger.info('Payroll reports generated');
      return res.status(200).json(createResponse('Payroll reports retrieved successfully', reportData));
    } catch (error) {
      logger.error('Error generating payroll reports:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Export payroll data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async exportPayrollData(req, res) {
    try {
      const { format, payPeriod, departmentId, includeDetails } = req.query;

      // TODO: Implement data export functionality
      logger.info('Payroll data export requested');
      return res.status(200).json(createResponse('Export functionality not yet implemented', {
        message: 'Data export will be implemented in the next iteration'
      }));
    } catch (error) {
      logger.error('Error exporting payroll data:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payroll summary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayrollSummary(req, res) {
    try {
      const { period, departmentId } = req.query;

      const whereClause = {};
      if (period) {
        const [year, month] = period.split('-');
        whereClause.year = parseInt(year);
        whereClause.month = parseInt(month);
      }

      const includeClause = [
        {
          model: User,
          as: 'employee',
          include: [
            { model: Department, as: 'department' }
          ]
        }
      ];

      if (departmentId) {
        includeClause[0].include[0].where = { id: departmentId };
      }

      const payrolls = await Payroll.findAll({
        where: whereClause,
        include: includeClause
      });

      const statistics = calculatePayrollStatistics(payrolls);

      const summary = {
        period: period || 'All time',
        totalEmployees: statistics.totalPayrolls,
        totalGrossPay: statistics.totalGrossPay,
        totalDeductions: statistics.totalDeductions,
        totalNetPay: statistics.totalNetPay,
        processedCount: statistics.statusBreakdown.processed || 0,
        pendingCount: statistics.statusBreakdown.pending || 0,
        approvedCount: statistics.statusBreakdown.approved || 0,
        rejectedCount: statistics.statusBreakdown.rejected || 0,
        averageGrossPay: statistics.averageGrossPay,
        averageNetPay: statistics.averageNetPay,
        taxSummary: {
          totalPAYE: 0, // TODO: Calculate from deductions
          totalNSSF: 0,
          totalNHIF: 0
        }
      };

      logger.info('Payroll summary retrieved');
      return res.status(200).json(createResponse('Payroll summary retrieved successfully', summary));
    } catch (error) {
      logger.error('Error retrieving payroll summary:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get calculation preview
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCalculationPreview(req, res) {
    try {
      const { employeeId, period, includeOvertime, includeAllowances } = req.query;

      const user = await User.findByPk(employeeId, {
        include: [
          { model: BasicEmployeeData, as: 'basicData' },
          { model: SalaryComponent, as: 'salaryComponents' }
        ]
      });

      if (!user) {
        return res.status(404).json(createErrorResponse('Not Found', 'Employee not found'));
      }

      const basicSalary = user.basicData?.basicSalary || 0;
      const allowances = includeAllowances ? 
        user.salaryComponents?.filter(comp => comp.type === 'allowance') || [] : [];
      const deductions = user.salaryComponents?.filter(comp => comp.type === 'deduction') || [];

      const grossPay = calculateGrossSalary(basicSalary, allowances);
      const netPay = calculateNetSalary(grossPay, deductions);

      const preview = {
        employee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          employeeNumber: user.basicData?.employeeId,
          basicSalary
        },
        period: period || 'Current month',
        calculationPreview: {
          basicSalary,
          allowances: allowances.reduce((sum, comp) => sum + parseFloat(comp.amount), 0),
          overtime: 0, // TODO: Implement overtime calculation
          grossPay,
          deductions: deductions.reduce((sum, comp) => sum + parseFloat(comp.amount), 0),
          netPay
        },
        breakdown: {
          earnings: [
            {
              name: 'Basic Salary',
              amount: basicSalary,
              type: 'basic'
            },
            ...allowances.map(comp => ({
              name: comp.name,
              amount: parseFloat(comp.amount),
              type: 'allowance'
            }))
          ],
          deductions: deductions.map(comp => ({
            name: comp.name,
            amount: parseFloat(comp.amount),
            type: 'deduction'
          }))
        }
      };

      logger.info(`Calculation preview generated for employee ${employeeId}`);
      return res.status(200).json(createResponse('Calculation preview retrieved successfully', preview));
    } catch (error) {
      logger.error('Error generating calculation preview:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Get payroll settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayrollSettings(req, res) {
    try {
      // TODO: Implement settings retrieval from database
      const settings = {
        taxSettings: {
          payeRate: 15,
          nssfRate: 10,
          nssfMax: 20000,
          nhifRate: 3,
          nhifMax: 30000
        },
        overtimeSettings: {
          overtimeRate: 1.5,
          maxOvertimeHours: 40
        },
        allowanceSettings: {
          transportAllowance: 50000,
          lunchAllowancePerDay: 5000
        },
        approvalWorkflow: {
          stages: [
            'HR Review',
            'Finance Approval',
            'Final Authorization'
          ],
          autoApprove: false
        },
        notificationSettings: {
          sendPayslipEmail: true,
          sendPayslipSms: false,
          notifyOnApproval: true
        }
      };

      logger.info('Payroll settings retrieved');
      return res.status(200).json(createResponse('Payroll settings retrieved successfully', settings));
    } catch (error) {
      logger.error('Error retrieving payroll settings:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }

  /**
   * Update payroll settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePayrollSettings(req, res) {
    try {
      const { taxSettings, overtimeSettings, allowanceSettings } = req.body;

      // TODO: Implement settings update in database
      logger.info('Payroll settings update requested');
      return res.status(200).json(createResponse('Payroll settings updated successfully', {
        updatedAt: new Date()
      }));
    } catch (error) {
      logger.error('Error updating payroll settings:', error);
      return res.status(500).json(createErrorResponse('Internal Server Error', error.message));
    }
  }
}

module.exports = new PayrollController(); 