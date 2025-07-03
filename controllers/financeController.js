const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { Asset, AssetMaintenance, User, Department, Supplier, Budget, Quarter, ExpenseReport, TravelAdvanceRequest, ExpenseLine, PurchaseRequest, Quotation, LPO } = require('../models');
const logger = require('../utils/logger');
const sequelize = require('sequelize');

// Helper to send Not Implemented
const notImplemented = (method) => (req, res) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    success: false,
    message: `${method} is not implemented yet.`
  });
};

// Helper to generate maintenance number
const generateMaintenanceNumber = async () => {
  const count = await AssetMaintenance.count();
  return `MAINT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
};

// Helper to generate asset code
const generateAssetCode = async () => {
  const count = await Asset.count();
  return `GHF-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
};

// ==================== BUDGET MANAGEMENT ====================

/**
 * Get all budgets with filtering and pagination
 */
exports.getAllBudgets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department_id,
      quarter_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (department_id) whereClause.department_id = department_id;
    if (quarter_id) whereClause.quarter_id = quarter_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { activity_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Budget.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budgets retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllBudgets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budgets',
      error: error.message
    });
  }
};

/**
 * Create a new budget
 */
exports.createBudget = async (req, res) => {
  try {
    const {
      quarter_id,
      department_id,
      activity_name,
      responsible_person_id,
      description,
      amount
    } = req.body;

    // Validate required fields
    if (!quarter_id || !department_id || !activity_name || !responsible_person_id || !amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if quarter exists
    const quarter = await Quarter.findByPk(quarter_id);
    if (!quarter) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Quarter not found'
      });
    }

    // Check if department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if responsible person exists
    const responsiblePerson = await User.findByPk(responsible_person_id);
    if (!responsiblePerson) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Responsible person not found'
      });
    }

    const budget = await Budget.create({
      quarter_id,
      department_id,
      activity_name,
      responsible_person_id,
      description,
      amount,
      status: 'draft',
      created_by: req.user.id
    });

    // Fetch the created budget with associations
    const createdBudget = await Budget.findByPk(budget.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Budget created successfully',
      data: createdBudget
    });
  } catch (error) {
    logger.error('Error in createBudget:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message
    });
  }
};

/**
 * Get budget by ID
 */
exports.getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget retrieved successfully',
      data: budget
    });
  } catch (error) {
    logger.error('Error in getBudgetById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget',
      error: error.message
    });
  }
};

/**
 * Update budget
 */
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      quarter_id,
      department_id,
      activity_name,
      responsible_person_id,
      description,
      amount
    } = req.body;

    const budget = await Budget.findByPk(id);
    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget can be updated (only draft status can be updated)
    if (budget.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only draft budgets can be updated'
      });
    }

    // Validate required fields
    if (!quarter_id || !department_id || !activity_name || !responsible_person_id || !amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if quarter exists
    const quarter = await Quarter.findByPk(quarter_id);
    if (!quarter) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Quarter not found'
      });
    }

    // Check if department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if responsible person exists
    const responsiblePerson = await User.findByPk(responsible_person_id);
    if (!responsiblePerson) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Responsible person not found'
      });
    }

    await budget.update({
      quarter_id,
      department_id,
      activity_name,
      responsible_person_id,
      description,
      amount,
      updated_by: req.user.id
    });

    // Fetch the updated budget with associations
    const updatedBudget = await Budget.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    logger.error('Error in updateBudget:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update budget',
      error: error.message
    });
  }
};

/**
 * Delete budget
 */
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findByPk(id);
    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget can be deleted (only draft status can be deleted)
    if (budget.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only draft budgets can be deleted'
      });
    }

    await budget.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteBudget:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete budget',
      error: error.message
    });
  }
};

/**
 * Approve budget
 */
exports.approveBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const budget = await Budget.findByPk(id);
    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget can be approved (only submitted status can be approved/rejected)
    if (budget.status !== 'submitted') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only submitted budgets can be approved or rejected'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    await budget.update({
      status,
      approval_comment: comment,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Fetch the updated budget with associations
    const updatedBudget = await Budget.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Budget ${status} successfully`,
      data: updatedBudget
    });
  } catch (error) {
    logger.error('Error in approveBudget:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve budget',
      error: error.message
    });
  }
};

// ==================== EXPENSE REPORTS ====================

/**
 * Get all expense reports with filtering and pagination
 */
exports.getAllExpenseReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      user_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (user_id) whereClause.user_id = user_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { expense_title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ExpenseReport.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: TravelAdvanceRequest,
          as: 'travel_advance_request',
          attributes: ['id', 'departure_date', 'return_date', 'total_cost']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Expense reports retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllExpenseReports:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve expense reports',
      error: error.message
    });
  }
};

/**
 * Create expense report
 */
exports.createExpenseReport = async (req, res) => {
  try {
    const {
      travel_advance_request_id,
      date,
      expense_title,
      expense_amount,
      deadline,
      description
    } = req.body;

    // Validate required fields
    if (!date || !expense_title || !expense_amount || !deadline) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if travel advance request exists (if provided)
    if (travel_advance_request_id) {
      const travelAdvance = await TravelAdvanceRequest.findByPk(travel_advance_request_id);
      if (!travelAdvance) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Travel advance request not found'
        });
      }
    }

    const expenseReport = await ExpenseReport.create({
      user_id: req.user.id,
      travel_advance_request_id,
      date,
      expense_title,
      expense_amount,
      deadline,
      description,
      status: 'pending',
      submitted_at: new Date()
    });

    // Fetch the created expense report with associations
    const createdExpenseReport = await ExpenseReport.findByPk(expenseReport.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: TravelAdvanceRequest,
          as: 'travel_advance_request',
          attributes: ['id', 'departure_date', 'return_date', 'total_cost']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Expense report created successfully',
      data: createdExpenseReport
    });
  } catch (error) {
    logger.error('Error in createExpenseReport:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create expense report',
      error: error.message
    });
  }
};

/**
 * Get expense report by ID
 */
exports.getExpenseReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const expenseReport = await ExpenseReport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: TravelAdvanceRequest,
          as: 'travel_advance_request',
          attributes: ['id', 'departure_date', 'return_date', 'total_cost']
        },
        {
          model: ExpenseLine,
          as: 'expense_lines',
          attributes: ['id', 'description', 'amount', 'receipt_url']
        }
      ]
    });

    if (!expenseReport) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Expense report not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Expense report retrieved successfully',
      data: expenseReport
    });
  } catch (error) {
    logger.error('Error in getExpenseReportById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve expense report',
      error: error.message
    });
  }
};

/**
 * Update expense report
 */
exports.updateExpenseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      expense_title,
      expense_amount,
      deadline,
      description
    } = req.body;

    const expenseReport = await ExpenseReport.findByPk(id);
    if (!expenseReport) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Expense report not found'
      });
    }

    // Check if expense report can be updated (only pending status can be updated)
    if (expenseReport.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending expense reports can be updated'
      });
    }

    // Check if user owns the expense report or is admin
    if (expenseReport.user_id !== req.user.id && !['Admin', 'Finance Manager'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only update your own expense reports'
      });
    }

    await expenseReport.update({
      date,
      expense_title,
      expense_amount,
      deadline,
      description
    });

    // Fetch the updated expense report with associations
    const updatedExpenseReport = await ExpenseReport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: TravelAdvanceRequest,
          as: 'travel_advance_request',
          attributes: ['id', 'departure_date', 'return_date', 'total_cost']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Expense report updated successfully',
      data: updatedExpenseReport
    });
  } catch (error) {
    logger.error('Error in updateExpenseReport:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update expense report',
      error: error.message
    });
  }
};

/**
 * Delete expense report
 */
exports.deleteExpenseReport = async (req, res) => {
  try {
    const { id } = req.params;

    const expenseReport = await ExpenseReport.findByPk(id);
    if (!expenseReport) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Expense report not found'
      });
    }

    // Check if expense report can be deleted (only pending status can be deleted)
    if (expenseReport.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending expense reports can be deleted'
      });
    }

    // Check if user owns the expense report or is admin
    if (expenseReport.user_id !== req.user.id && !['Admin', 'Finance Manager'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only delete your own expense reports'
      });
    }

    await expenseReport.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Expense report deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteExpenseReport:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete expense report',
      error: error.message
    });
  }
};

/**
 * Approve expense report
 */
exports.approveExpenseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const expenseReport = await ExpenseReport.findByPk(id);
    if (!expenseReport) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Expense report not found'
      });
    }

    // Check if expense report can be approved (only pending status can be approved/rejected)
    if (expenseReport.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending expense reports can be approved or rejected'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    await expenseReport.update({
      status,
      approval_comment: comment,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Fetch the updated expense report with associations
    const updatedExpenseReport = await ExpenseReport.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: TravelAdvanceRequest,
          as: 'travel_advance_request',
          attributes: ['id', 'departure_date', 'return_date', 'total_cost']
        },
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Expense report ${status} successfully`,
      data: updatedExpenseReport
    });
  } catch (error) {
    logger.error('Error in approveExpenseReport:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve expense report',
      error: error.message
    });
  }
};

// ==================== PURCHASE REQUESTS ====================

/**
 * Get all purchase requests with filtering and pagination
 */
exports.getAllPurchaseRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      requester_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (requester_id) whereClause.requester_id = requester_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { item: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await PurchaseRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase requests retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllPurchaseRequests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve purchase requests',
      error: error.message
    });
  }
};

/**
 * Create purchase request
 */
exports.createPurchaseRequest = async (req, res) => {
  try {
    const {
      item,
      budget_id,
      quantity,
      estimated_cost,
      description,
      urgency_level
    } = req.body;

    // Validate required fields
    if (!item || !quantity || !estimated_cost) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if budget exists (if provided)
    if (budget_id) {
      const budget = await Budget.findByPk(budget_id);
      if (!budget) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Budget not found'
        });
      }
    }

    const purchaseRequest = await PurchaseRequest.create({
      item,
      budget_id,
      requester_id: req.user.id,
      quantity,
      estimated_cost,
      description,
      urgency_level: urgency_level || 'normal',
      status: 'pending',
      submitted_at: new Date()
    });

    // Fetch the created purchase request with associations
    const createdPurchaseRequest = await PurchaseRequest.findByPk(purchaseRequest.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Purchase request created successfully',
      data: createdPurchaseRequest
    });
  } catch (error) {
    logger.error('Error in createPurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create purchase request',
      error: error.message
    });
  }
};

/**
 * Get purchase request by ID
 */
exports.getPurchaseRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseRequest = await PurchaseRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        }
      ]
    });

    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request retrieved successfully',
      data: purchaseRequest
    });
  } catch (error) {
    logger.error('Error in getPurchaseRequestById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve purchase request',
      error: error.message
    });
  }
};

/**
 * Update purchase request
 */
exports.updatePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item,
      budget_id,
      quantity,
      estimated_cost,
      description,
      urgency_level
    } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    // Check if purchase request can be updated (only pending status can be updated)
    if (purchaseRequest.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending purchase requests can be updated'
      });
    }

    // Check if user owns the purchase request or is admin
    if (purchaseRequest.requester_id !== req.user.id && !['Admin', 'Finance Manager'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only update your own purchase requests'
      });
    }

    // Check if budget exists (if provided)
    if (budget_id) {
      const budget = await Budget.findByPk(budget_id);
      if (!budget) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Budget not found'
        });
      }
    }

    await purchaseRequest.update({
      item,
      budget_id,
      quantity,
      estimated_cost,
      description,
      urgency_level
    });

    // Fetch the updated purchase request with associations
    const updatedPurchaseRequest = await PurchaseRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request updated successfully',
      data: updatedPurchaseRequest
    });
  } catch (error) {
    logger.error('Error in updatePurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update purchase request',
      error: error.message
    });
  }
};

/**
 * Delete purchase request
 */
exports.deletePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    // Check if purchase request can be deleted (only pending status can be deleted)
    if (purchaseRequest.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending purchase requests can be deleted'
      });
    }

    // Check if user owns the purchase request or is admin
    if (purchaseRequest.requester_id !== req.user.id && !['Admin', 'Finance Manager'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only delete your own purchase requests'
      });
    }

    await purchaseRequest.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deletePurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete purchase request',
      error: error.message
    });
  }
};

/**
 * Approve purchase request
 */
exports.approvePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    // Check if purchase request can be approved (only pending status can be approved/rejected)
    if (purchaseRequest.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending purchase requests can be approved or rejected'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    await purchaseRequest.update({
      status,
      approval_comment: comment,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Fetch the updated purchase request with associations
    const updatedPurchaseRequest = await PurchaseRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        },
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Purchase request ${status} successfully`,
      data: updatedPurchaseRequest
    });
  } catch (error) {
    logger.error('Error in approvePurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve purchase request',
      error: error.message
    });
  }
};

// ==================== SUPPLIERS ====================

/**
 * Get all suppliers with filtering and pagination
 */
exports.getAllSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { supplier_name: { [Op.like]: `%${search}%` } },
        { contact_person: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Suppliers retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllSuppliers:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve suppliers',
      error: error.message
    });
  }
};

/**
 * Create supplier
 */
exports.createSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      category,
      tax_number,
      registration_number,
      bank_details,
      payment_terms,
      notes
    } = req.body;

    // Validate required fields
    if (!supplier_name || !contact_person || !email || !phone) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: supplier_name, contact_person, email, phone'
      });
    }

    // Check if supplier with same email already exists
    const existingSupplier = await Supplier.findOne({ where: { email } });
    if (existingSupplier) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'Supplier with this email already exists'
      });
    }

    const supplier = await Supplier.create({
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      category,
      tax_number,
      registration_number,
      bank_details,
      payment_terms,
      notes,
      status: 'active',
      created_by: req.user.id
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    logger.error('Error in createSupplier:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

/**
 * Get supplier by ID
 */
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Supplier retrieved successfully',
      data: supplier
    });
  } catch (error) {
    logger.error('Error in getSupplierById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve supplier',
      error: error.message
    });
  }
};

/**
 * Update supplier
 */
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      category,
      tax_number,
      registration_number,
      bank_details,
      payment_terms,
      notes,
      status
    } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== supplier.email) {
      const existingSupplier = await Supplier.findOne({ where: { email } });
      if (existingSupplier) {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: 'Supplier with this email already exists'
        });
      }
    }

    await supplier.update({
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      category,
      tax_number,
      registration_number,
      bank_details,
      payment_terms,
      notes,
      status,
      updated_by: req.user.id
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    logger.error('Error in updateSupplier:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

/**
 * Delete supplier
 */
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has associated records (quotations, LPOs, etc.)
    // This is a soft delete, so we just update the status
    await supplier.update({
      status: 'inactive',
      updated_by: req.user.id
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteSupplier:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};

/**
 * Export suppliers
 */
exports.exportSuppliers = async (req, res) => {
  try {
    const { format = 'xlsx', status, category } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const suppliers = await Supplier.findAll({
      where: whereClause,
      order: [['supplier_name', 'ASC']]
    });

    // For now, return JSON format
    // In a real implementation, you would generate Excel/CSV files
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Suppliers exported successfully',
      data: suppliers,
      format: format
    });
  } catch (error) {
    logger.error('Error in exportSuppliers:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to export suppliers',
      error: error.message
    });
  }
};

/**
 * Get supplier statistics
 */
exports.getSupplierStatistics = async (req, res) => {
  try {
    const totalSuppliers = await Supplier.count();
    const activeSuppliers = await Supplier.count({ where: { status: 'active' } });
    const inactiveSuppliers = await Supplier.count({ where: { status: 'inactive' } });

    // Get suppliers by category
    const suppliersByCategory = await Supplier.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Supplier statistics retrieved successfully',
      data: {
        total_suppliers: totalSuppliers,
        active_suppliers: activeSuppliers,
        inactive_suppliers: inactiveSuppliers,
        suppliers_by_category: suppliersByCategory
      }
    });
  } catch (error) {
    logger.error('Error in getSupplierStatistics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve supplier statistics',
      error: error.message
    });
  }
};

// ==================== QUOTATIONS ====================

/**
 * Get all quotations with filtering and pagination
 */
exports.getAllQuotations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      supplier_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (supplier_id) whereClause.supplier_id = supplier_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { procurement_title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Quotation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email']
        },
        {
          model: User,
          as: 'submitted_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Quotations retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllQuotations:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve quotations',
      error: error.message
    });
  }
};

/**
 * Create quotation
 */
exports.createQuotation = async (req, res) => {
  try {
    const {
      supplier_id,
      date,
      procurement_title,
      amount,
      currency,
      description,
      submitted_by
    } = req.body;

    // Validate required fields
    if (!supplier_id || !date || !procurement_title || !amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: supplier_id, date, procurement_title, amount'
      });
    }

    // Check if supplier exists
    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const quotation = await Quotation.create({
      supplier_id,
      date,
      procurement_title,
      amount,
      currency: currency || 'USD',
      description,
      submitted_by: submitted_by || req.user.id,
      status: 'pending',
      created_at: new Date()
    });

    // Fetch the created quotation with associations
    const createdQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email']
        },
        {
          model: User,
          as: 'submitted_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Quotation created successfully',
      data: createdQuotation
    });
  } catch (error) {
    logger.error('Error in createQuotation:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create quotation',
      error: error.message
    });
  }
};

/**
 * Get quotation by ID
 */
exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'submitted_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    if (!quotation) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Quotation retrieved successfully',
      data: quotation
    });
  } catch (error) {
    logger.error('Error in getQuotationById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve quotation',
      error: error.message
    });
  }
};

/**
 * Update quotation
 */
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_id,
      date,
      procurement_title,
      amount,
      currency,
      description,
      status
    } = req.body;

    const quotation = await Quotation.findByPk(id);
    if (!quotation) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check if quotation can be updated (only pending status can be updated)
    if (quotation.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending quotations can be updated'
      });
    }

    // Check if supplier exists (if provided)
    if (supplier_id) {
      const supplier = await Supplier.findByPk(supplier_id);
      if (!supplier) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }

    await quotation.update({
      supplier_id,
      date,
      procurement_title,
      amount,
      currency,
      description,
      status,
      updated_at: new Date()
    });

    // Fetch the updated quotation with associations
    const updatedQuotation = await Quotation.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email']
        },
        {
          model: User,
          as: 'submitted_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Quotation updated successfully',
      data: updatedQuotation
    });
  } catch (error) {
    logger.error('Error in updateQuotation:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update quotation',
      error: error.message
    });
  }
};

/**
 * Delete quotation
 */
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findByPk(id);
    if (!quotation) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check if quotation can be deleted (only pending status can be deleted)
    if (quotation.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending quotations can be deleted'
      });
    }

    await quotation.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteQuotation:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete quotation',
      error: error.message
    });
  }
};

// ==================== LPOS ====================

/**
 * Get all LPOs with filtering and pagination
 */
exports.getAllLPOs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      supplier_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (supplier_id) whereClause.supplier_id = supplier_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { lpo_number: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await LPO.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email']
        },
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'LPOs retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllLPOs:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve LPOs',
      error: error.message
    });
  }
};

/**
 * Create LPO
 */
exports.createLPO = async (req, res) => {
  try {
    const {
      supplier_id,
      lpo_number,
      date,
      description,
      amount,
      currency,
      delivery_date,
      terms_conditions,
      items
    } = req.body;

    // Validate required fields
    if (!supplier_id || !lpo_number || !date || !amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: supplier_id, lpo_number, date, amount'
      });
    }

    // Check if supplier exists
    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if LPO number already exists
    const existingLPO = await LPO.findOne({ where: { lpo_number } });
    if (existingLPO) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'LPO number already exists'
      });
    }

    const lpo = await LPO.create({
      supplier_id,
      lpo_number,
      date,
      description,
      amount,
      currency: currency || 'USD',
      delivery_date,
      terms_conditions,
      items: items ? JSON.stringify(items) : null,
      status: 'draft',
      created_by: req.user.id
    });

    // Fetch the created LPO with associations
    const createdLPO = await LPO.findByPk(lpo.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email']
        },
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'LPO created successfully',
      data: createdLPO
    });
  } catch (error) {
    logger.error('Error in createLPO:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create LPO',
      error: error.message
    });
  }
};

/**
 * Get LPO by ID
 */
exports.getLPOById = async (req, res) => {
  try {
    const { id } = req.params;

    const lpo = await LPO.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    if (!lpo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'LPO not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'LPO retrieved successfully',
      data: lpo
    });
  } catch (error) {
    logger.error('Error in getLPOById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve LPO',
      error: error.message
    });
  }
};

/**
 * Update LPO
 */
exports.updateLPO = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_id,
      lpo_number,
      date,
      description,
      amount,
      currency,
      delivery_date,
      terms_conditions,
      items,
      status
    } = req.body;

    const lpo = await LPO.findByPk(id);
    if (!lpo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'LPO not found'
      });
    }

    // Check if LPO can be updated (only draft status can be updated)
    if (lpo.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only draft LPOs can be updated'
      });
    }

    // Check if supplier exists (if provided)
    if (supplier_id) {
      const supplier = await Supplier.findByPk(supplier_id);
      if (!supplier) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }

    // Check if LPO number is being changed and if it already exists
    if (lpo_number && lpo_number !== lpo.lpo_number) {
      const existingLPO = await LPO.findOne({ where: { lpo_number } });
      if (existingLPO) {
        return res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: 'LPO number already exists'
        });
      }
    }

    await lpo.update({
      supplier_id,
      lpo_number,
      date,
      description,
      amount,
      currency,
      delivery_date,
      terms_conditions,
      items: items ? JSON.stringify(items) : lpo.items,
      status,
      updated_by: req.user.id
    });

    // Fetch the updated LPO with associations
    const updatedLPO = await LPO.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplier_name', 'contact_person', 'email']
        },
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'LPO updated successfully',
      data: updatedLPO
    });
  } catch (error) {
    logger.error('Error in updateLPO:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update LPO',
      error: error.message
    });
  }
};

/**
 * Delete LPO
 */
exports.deleteLPO = async (req, res) => {
  try {
    const { id } = req.params;

    const lpo = await LPO.findByPk(id);
    if (!lpo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'LPO not found'
      });
    }

    // Check if LPO can be deleted (only draft status can be deleted)
    if (lpo.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only draft LPOs can be deleted'
      });
    }

    await lpo.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'LPO deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteLPO:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete LPO',
      error: error.message
    });
  }
};

// ==================== PETTY CASH ====================
exports.getAllPettyCashBooks = notImplemented('getAllPettyCashBooks');
exports.createPettyCashBook = notImplemented('createPettyCashBook');
exports.getPettyCashBookById = notImplemented('getPettyCashBookById');
exports.updatePettyCashBook = notImplemented('updatePettyCashBook');
exports.deletePettyCashBook = notImplemented('deletePettyCashBook');

// ==================== PETTY CASH EXPENSES ====================
exports.getAllPettyCashExpenses = notImplemented('getAllPettyCashExpenses');
exports.createPettyCashExpense = notImplemented('createPettyCashExpense');
exports.getPettyCashExpenseById = notImplemented('getPettyCashExpenseById');
exports.updatePettyCashExpense = notImplemented('updatePettyCashExpense');
exports.deletePettyCashExpense = notImplemented('deletePettyCashExpense');

// ==================== TRAVEL ADVANCE REQUESTS ====================
exports.getAllTravelAdvanceRequests = notImplemented('getAllTravelAdvanceRequests');
exports.createTravelAdvanceRequest = notImplemented('createTravelAdvanceRequest');
exports.getTravelAdvanceRequestById = notImplemented('getTravelAdvanceRequestById');
exports.updateTravelAdvanceRequest = notImplemented('updateTravelAdvanceRequest');
exports.deleteTravelAdvanceRequest = notImplemented('deleteTravelAdvanceRequest');
exports.approveTravelAdvanceRequest = notImplemented('approveTravelAdvanceRequest');

// ==================== FLAT RATES ====================
exports.getAllFlatRates = notImplemented('getAllFlatRates');
exports.createFlatRate = notImplemented('createFlatRate');

// ==================== REPLENISHMENT REQUESTS ====================
exports.getAllReplenishmentRequests = notImplemented('getAllReplenishmentRequests');
exports.createReplenishmentRequest = notImplemented('createReplenishmentRequest');
exports.approveReplenishmentRequest = notImplemented('approveReplenishmentRequest');

// ==================== FISCAL YEARS ====================
exports.getAllFiscalYears = notImplemented('getAllFiscalYears');
exports.getCurrentFiscalYear = notImplemented('getCurrentFiscalYear');

// ==================== QUARTERS ====================
exports.getAllQuarters = notImplemented('getAllQuarters');

// ==================== EXPORT APIs ====================

/**
 * Export budgets
 */
exports.exportBudgets = async (req, res) => {
  try {
    const { 
      fiscal_year, 
      department, 
      status, 
      format = 'xlsx',
      date_from,
      date_to 
    } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;
    if (status) whereClause.status = status;
    if (date_from && date_to) {
      whereClause.created_at = {
        [Op.between]: [new Date(date_from), new Date(date_to)]
      };
    }

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // For now, return JSON. In production, you would generate Excel/CSV/PDF
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budgets exported successfully',
      data: budgets,
      format: format,
      total_records: budgets.length,
      export_date: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in exportBudgets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to export budgets',
      error: error.message
    });
  }
};

exports.exportExpenseReports = notImplemented('exportExpenseReports');

// ==================== REPORTS & ANALYTICS ====================

/**
 * Get budget reports
 */
exports.getBudgetReports = async (req, res) => {
  try {
    const { 
      fiscal_year, 
      department, 
      report_type = 'summary',
      period = 'quarterly' 
    } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        }
      ]
    });

    // Calculate summary statistics
    const totalBudgets = budgets.length;
    const totalAmount = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const approvedBudgets = budgets.filter(budget => budget.status === 'approved').length;
    const draftBudgets = budgets.filter(budget => budget.status === 'draft').length;
    const rejectedBudgets = budgets.filter(budget => budget.status === 'rejected').length;

    // Department breakdown
    const departmentBreakdown = {};
    budgets.forEach(budget => {
      const deptName = budget.department?.department_name || 'Unknown';
      if (!departmentBreakdown[deptName]) {
        departmentBreakdown[deptName] = {
          budget_count: 0,
          total_amount: 0,
          approved_count: 0
        };
      }
      departmentBreakdown[deptName].budget_count++;
      departmentBreakdown[deptName].total_amount += parseFloat(budget.amount);
      if (budget.status === 'approved') {
        departmentBreakdown[deptName].approved_count++;
      }
    });

    const reportData = {
      summary: {
        total_budgets: totalBudgets,
        total_amount: totalAmount,
        approved_budgets: approvedBudgets,
        draft_budgets: draftBudgets,
        rejected_budgets: rejectedBudgets,
        approval_rate: totalBudgets > 0 ? (approvedBudgets / totalBudgets) * 100 : 0
      },
      department_breakdown: Object.entries(departmentBreakdown).map(([dept, data]) => ({
        department: dept,
        budget_count: data.budget_count,
        total_amount: data.total_amount,
        approved_count: data.approved_count,
        approval_rate: data.budget_count > 0 ? (data.approved_count / data.budget_count) * 100 : 0
      })),
      period: period,
      fiscal_year: fiscal_year,
      generated_at: new Date().toISOString()
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget reports retrieved successfully',
      data: reportData
    });
  } catch (error) {
    logger.error('Error in getBudgetReports:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget reports',
      error: error.message
    });
  }
};

exports.getProcurementReports = notImplemented('getProcurementReports');

/**
 * Get budget statistics
 */
exports.getBudgetStatistics = async (req, res) => {
  try {
    const { fiscal_year, department } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        }
      ]
    });

    // Calculate statistics
    const totalBudgets = budgets.length;
    const totalAmount = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const averageBudget = totalBudgets > 0 ? totalAmount / totalBudgets : 0;

    // Status distribution
    const statusDistribution = {
      draft: budgets.filter(b => b.status === 'draft').length,
      submitted: budgets.filter(b => b.status === 'submitted').length,
      approved: budgets.filter(b => b.status === 'approved').length,
      rejected: budgets.filter(b => b.status === 'rejected').length
    };

    // Department statistics
    const deptStats = {};
    budgets.forEach(budget => {
      const deptName = budget.department?.department_name || 'Unknown';
      if (!deptStats[deptName]) {
        deptStats[deptName] = {
          budget_count: 0,
          total_amount: 0,
          average_amount: 0
        };
      }
      deptStats[deptName].budget_count++;
      deptStats[deptName].total_amount += parseFloat(budget.amount);
    });

    // Calculate averages
    Object.keys(deptStats).forEach(dept => {
      deptStats[dept].average_amount = deptStats[dept].budget_count > 0 
        ? deptStats[dept].total_amount / deptStats[dept].budget_count 
        : 0;
    });

    const statistics = {
      overview: {
        total_budgets: totalBudgets,
        total_amount: totalAmount,
        average_budget: averageBudget,
        fiscal_year: fiscal_year
      },
      status_distribution: statusDistribution,
      department_statistics: Object.entries(deptStats).map(([dept, data]) => ({
        department: dept,
        budget_count: data.budget_count,
        total_amount: data.total_amount,
        average_amount: data.average_amount
      })),
      generated_at: new Date().toISOString()
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    logger.error('Error in getBudgetStatistics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget statistics',
      error: error.message
    });
  }
};

// ==================== ENHANCED BUDGET FEATURES ====================

/**
 * Copy budget
 */
exports.copyBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      new_budget_name, 
      new_budget_code, 
      fiscal_year, 
      adjust_percentage = 0 
    } = req.body;

    const originalBudget = await Budget.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        }
      ]
    });

    if (!originalBudget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Original budget not found'
      });
    }

    // Calculate adjusted amount
    const adjustmentFactor = 1 + (adjust_percentage / 100);
    const adjustedAmount = parseFloat(originalBudget.amount) * adjustmentFactor;

    // Create new budget
    const newBudget = await Budget.create({
      quarter_id: originalBudget.quarter_id,
      department_id: originalBudget.department_id,
      activity_name: new_budget_name || `${originalBudget.activity_name} (Copy)`,
      responsible_person_id: originalBudget.responsible_person_id,
      description: originalBudget.description,
      amount: adjustedAmount,
      status: 'draft',
      created_by: req.user.id
    });

    // Fetch the created budget with associations
    const createdBudget = await Budget.findByPk(newBudget.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: Quarter,
          as: 'quarter',
          attributes: ['id', 'quarter_name', 'fiscal_year_id']
        },
        {
          model: User,
          as: 'responsible_person',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Budget copied successfully',
      data: createdBudget,
      copy_details: {
        original_budget_id: id,
        adjustment_percentage: adjust_percentage,
        original_amount: originalBudget.amount,
        new_amount: adjustedAmount
      }
    });
  } catch (error) {
    logger.error('Error in copyBudget:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to copy budget',
      error: error.message
    });
  }
};

/**
 * Get budget utilization
 */
exports.getBudgetUtilization = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'monthly' } = req.query;

    const budget = await Budget.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses',
          include: [
            {
              model: ExpenseReport,
              as: 'expenseReport',
              attributes: ['id', 'expense_title', 'expense_amount', 'created_at']
            }
          ]
        }
      ]
    });

    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Calculate utilization
    const totalBudget = parseFloat(budget.amount);
    const totalSpent = budget.budgetExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount), 0);
    const remainingAmount = totalBudget - totalSpent;
    const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Monthly breakdown (simplified)
    const monthlyBreakdown = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate.getFullYear(), i, 1);
      const monthExpenses = budget.budgetExpenses.filter(expense => {
        const expenseDate = new Date(expense.expenseReport.created_at);
        return expenseDate.getMonth() === i && expenseDate.getFullYear() === currentDate.getFullYear();
      });
      
      const monthSpent = monthExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      
      monthlyBreakdown.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        allocated: totalBudget / 12, // Simplified allocation
        spent: monthSpent,
        remaining: (totalBudget / 12) - monthSpent
      });
    }

    const utilizationData = {
      budget_id: id,
      budget_name: budget.activity_name,
      total_budget: totalBudget,
      total_spent: totalSpent,
      remaining_amount: remainingAmount,
      utilization_percentage: utilizationPercentage,
      monthly_breakdown: monthlyBreakdown,
      status: utilizationPercentage > 90 ? 'critical' : 
              utilizationPercentage > 75 ? 'warning' : 'normal'
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget utilization retrieved successfully',
      data: utilizationData
    });
  } catch (error) {
    logger.error('Error in getBudgetUtilization:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget utilization',
      error: error.message
    });
  }
};

/**
 * Get budget variance analysis
 */
exports.getBudgetVariance = async (req, res) => {
  try {
    const { fiscal_year, department, variance_type } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    const variances = budgets.map(budget => {
      const plannedAmount = parseFloat(budget.amount);
      const actualAmount = budget.budgetExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      const varianceAmount = actualAmount - plannedAmount;
      const variancePercentage = plannedAmount > 0 ? (varianceAmount / plannedAmount) * 100 : 0;
      
      let varianceType = 'on_budget';
      if (varianceAmount > 0) varianceType = 'over_budget';
      else if (varianceAmount < 0) varianceType = 'under_budget';

      return {
        budget_id: budget.id,
        budget_name: budget.activity_name,
        department: budget.department?.department_name,
        planned_amount: plannedAmount,
        actual_amount: actualAmount,
        variance_amount: varianceAmount,
        variance_percentage: variancePercentage,
        variance_type: varianceType,
        period: budget.quarter?.quarter_name || 'Unknown',
        analysis: varianceAmount > 0 ? 'Spending exceeds planned budget' : 
                 varianceAmount < 0 ? 'Spending under planned budget' : 'On target'
      };
    });

    // Filter by variance type if specified
    const filteredVariances = variance_type 
      ? variances.filter(v => v.variance_type === variance_type)
      : variances;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget variance analysis retrieved successfully',
      data: {
        variances: filteredVariances,
        summary: {
          total_budgets: variances.length,
          over_budget: variances.filter(v => v.variance_type === 'over_budget').length,
          under_budget: variances.filter(v => v.variance_type === 'under_budget').length,
          on_budget: variances.filter(v => v.variance_type === 'on_budget').length
        }
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetVariance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget variance analysis',
      error: error.message
    });
  }
};

/**
 * Get budget analytics
 */
exports.getBudgetAnalytics = async (req, res) => {
  try {
    const { fiscal_year, department, analysis_type = 'trends' } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    // Calculate analytics
    const totalBudgets = budgets.length;
    const totalAmount = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const averageBudget = totalBudgets > 0 ? totalAmount / totalBudgets : 0;

    // Calculate utilization rate
    const totalSpent = budgets.reduce((sum, budget) => 
      sum + budget.budgetExpenses.reduce((expSum, expense) => 
        expSum + parseFloat(expense.amount), 0), 0);
    const utilizationRate = totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0;

    // Calculate variance rate
    const totalVariance = budgets.reduce((sum, budget) => {
      const planned = parseFloat(budget.amount);
      const actual = budget.budgetExpenses.reduce((expSum, expense) => 
        expSum + parseFloat(expense.amount), 0);
      return sum + Math.abs(actual - planned);
    }, 0);
    const varianceRate = totalAmount > 0 ? (totalVariance / totalAmount) * 100 : 0;

    // Monthly trends (simplified)
    const trends = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const monthExpenses = budgets.reduce((sum, budget) => 
        sum + budget.budgetExpenses.filter(expense => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate.getMonth() === i && expenseDate.getFullYear() === currentYear;
        }).reduce((expSum, expense) => expSum + parseFloat(expense.amount), 0), 0);

      trends.push({
        month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }),
        planned: totalAmount / 12,
        actual: monthExpenses,
        variance: monthExpenses - (totalAmount / 12)
      });
    }

    const analytics = {
      total_budgets: totalBudgets,
      total_amount: totalAmount,
      average_budget: averageBudget,
      utilization_rate: utilizationRate,
      variance_rate: varianceRate,
      trends: trends,
      department_breakdown: Object.entries(
        budgets.reduce((acc, budget) => {
          const dept = budget.department?.department_name || 'Unknown';
          if (!acc[dept]) acc[dept] = { count: 0, amount: 0 };
          acc[dept].count++;
          acc[dept].amount += parseFloat(budget.amount);
          return acc;
        }, {})
      ).map(([dept, data]) => ({
        department: dept,
        budget_count: data.count,
        total_amount: data.amount,
        average_amount: data.count > 0 ? data.amount / data.count : 0
      }))
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget analytics retrieved successfully',
      data: {
        analytics: analytics,
        analysis_type: analysis_type,
        fiscal_year: fiscal_year
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetAnalytics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget analytics',
      error: error.message
    });
  }
};

/**
 * Get budget summary
 */
exports.getBudgetSummary = async (req, res) => {
  try {
    const { fiscal_year, department } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    const totalBudgets = budgets.length;
    const totalPlanned = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const totalSpent = budgets.reduce((sum, budget) => 
      sum + budget.budgetExpenses.reduce((expSum, expense) => 
        expSum + parseFloat(expense.amount), 0), 0);
    const totalRemaining = totalPlanned - totalSpent;
    const overallUtilization = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

    // Department breakdown
    const departmentBreakdown = Object.entries(
      budgets.reduce((acc, budget) => {
        const dept = budget.department?.department_name || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            budget_count: 0,
            total_amount: 0,
            spent_amount: 0
          };
        }
        acc[dept].budget_count++;
        acc[dept].total_amount += parseFloat(budget.amount);
        acc[dept].spent_amount += budget.budgetExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0);
        return acc;
      }, {})
    ).map(([dept, data]) => ({
      department: dept,
      budget_count: data.budget_count,
      total_amount: data.total_amount,
      spent_amount: data.spent_amount,
      remaining_amount: data.total_amount - data.spent_amount,
      utilization: data.total_amount > 0 ? (data.spent_amount / data.total_amount) * 100 : 0
    }));

    const summary = {
      total_budgets: totalBudgets,
      total_planned: totalPlanned,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      overall_utilization: overallUtilization,
      department_breakdown: departmentBreakdown,
      fiscal_year: fiscal_year,
      generated_at: new Date().toISOString()
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget summary retrieved successfully',
      data: {
        summary: summary
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetSummary:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget summary',
      error: error.message
    });
  }
};

/**
 * Get budget trends
 */
exports.getBudgetTrends = async (req, res) => {
  try {
    const { fiscal_year, trend_period = 'monthly' } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    // Generate trends based on period
    const trends = [];
    const currentYear = new Date().getFullYear();
    
    if (trend_period === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const monthExpenses = budgets.reduce((sum, budget) => 
          sum + budget.budgetExpenses.filter(expense => {
            const expenseDate = new Date(expense.created_at);
            return expenseDate.getMonth() === i && expenseDate.getFullYear() === currentYear;
          }).reduce((expSum, expense) => expSum + parseFloat(expense.amount), 0), 0);

        const monthBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0) / 12;

        trends.push({
          period: new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }),
          planned_amount: monthBudget,
          actual_amount: monthExpenses,
          variance: monthExpenses - monthBudget,
          trend_direction: monthExpenses > monthBudget ? 'over_budget' : 
                          monthExpenses < monthBudget ? 'under_budget' : 'on_budget'
        });
      }
    } else if (trend_period === 'quarterly') {
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      quarters.forEach((quarter, index) => {
        const quarterExpenses = budgets.reduce((sum, budget) => 
          sum + budget.budgetExpenses.filter(expense => {
            const expenseDate = new Date(expense.created_at);
            const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
            return expenseQuarter === index && expenseDate.getFullYear() === currentYear;
          }).reduce((expSum, expense) => expSum + parseFloat(expense.amount), 0), 0);

        const quarterBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0) / 4;

        trends.push({
          period: quarter,
          planned_amount: quarterBudget,
          actual_amount: quarterExpenses,
          variance: quarterExpenses - quarterBudget,
          trend_direction: quarterExpenses > quarterBudget ? 'over_budget' : 
                          quarterExpenses < quarterBudget ? 'under_budget' : 'on_budget'
        });
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget trends retrieved successfully',
      data: {
        trends: trends,
        trend_period: trend_period,
        fiscal_year: fiscal_year
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetTrends:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget trends',
      error: error.message
    });
  }
};

/**
 * Get budget comparison
 */
exports.getBudgetComparison = async (req, res) => {
  try {
    const { budget_ids, comparison_type = 'performance' } = req.body;

    if (!budget_ids || !Array.isArray(budget_ids) || budget_ids.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'At least two budget IDs are required for comparison'
      });
    }

    const budgets = await Budget.findAll({
      where: {
        id: budget_ids
      },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    if (budgets.length !== budget_ids.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'One or more budgets not found'
      });
    }

    const budgetComparisons = budgets.map(budget => {
      const totalBudget = parseFloat(budget.amount);
      const totalSpent = budget.budgetExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const variance = totalSpent - totalBudget;
      const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

      return {
        budget_id: budget.id,
        budget_name: budget.activity_name,
        department: budget.department?.department_name,
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_amount: totalBudget - totalSpent,
        utilization: utilization,
        variance: variance,
        variance_percentage: variancePercentage,
        status: budget.status
      };
    });

    // Calculate analysis
    const totalUtilization = budgetComparisons.reduce((sum, budget) => sum + budget.utilization, 0);
    const averageUtilization = budgetComparisons.length > 0 ? totalUtilization / budgetComparisons.length : 0;
    
    const bestPerformer = budgetComparisons.reduce((best, current) => 
      current.utilization > best.utilization ? current : best);
    const worstPerformer = budgetComparisons.reduce((worst, current) => 
      current.utilization < worst.utilization ? current : worst);

    const comparison = {
      budgets: budgetComparisons,
      analysis: {
        best_performer: bestPerformer.budget_id,
        worst_performer: worstPerformer.budget_id,
        average_utilization: averageUtilization,
        total_budgets: budgetComparisons.length,
        comparison_type: comparison_type
      }
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget comparison retrieved successfully',
      data: {
        comparison: comparison
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetComparison:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget comparison',
      error: error.message
    });
  }
};

/**
 * Get department budget summary
 */
exports.getDepartmentBudgetSummary = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { fiscal_year } = req.query;

    const whereClause = { department_id: departmentId };
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    if (budgets.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No budgets found for this department'
      });
    }

    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const totalSpent = budgets.reduce((sum, budget) => 
      sum + budget.budgetExpenses.reduce((expSum, expense) => 
        expSum + parseFloat(expense.amount), 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const summary = {
      department_id: departmentId,
      department_name: budgets[0].department?.department_name,
      fiscal_year: fiscal_year,
      total_budget: totalBudget,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      utilization_percentage: utilizationPercentage,
      budget_count: budgets.length,
      budgets: budgets.map(budget => ({
        id: budget.id,
        budget_name: budget.activity_name,
        amount: budget.amount,
        status: budget.status,
        spent_amount: budget.budgetExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0)
      }))
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Department budget summary retrieved successfully',
      data: {
        summary: summary
      }
    });
  } catch (error) {
    logger.error('Error in getDepartmentBudgetSummary:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve department budget summary',
      error: error.message
    });
  }
};

// ==================== ASSET MAINTENANCE ====================

/**
 * Get all asset maintenance records with filtering and pagination
 */
exports.getAllAssetMaintenance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      asset_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (type) whereClause.maintenance_type = type;
    if (asset_id) whereClause.asset_id = asset_id;

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { maintenance_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await AssetMaintenance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'completer',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance records retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve asset maintenance records',
      error: error.message
    });
  }
};

/**
 * Create new asset maintenance record
 */
exports.createAssetMaintenance = async (req, res) => {
  try {
    const {
      asset_id,
      maintenance_type,
      title,
      description,
      scheduled_date,
      estimated_duration,
      estimated_cost,
      assigned_to,
      vendor_id,
      priority,
      maintenance_category,
      notes
    } = req.body;

    // Validate required fields
    if (!asset_id || !maintenance_type || !title || !scheduled_date) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: asset_id, maintenance_type, title, scheduled_date'
      });
    }

    // Check if asset exists
    const asset = await Asset.findByPk(asset_id);
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Generate maintenance number
    const maintenance_number = await generateMaintenanceNumber();

    // Create maintenance record
    const maintenance = await AssetMaintenance.create({
      maintenance_number,
      asset_id,
      maintenance_type,
      title,
      description,
      scheduled_date,
      estimated_duration,
      estimated_cost,
      assigned_to,
      vendor_id,
      priority: priority || 'medium',
      maintenance_category,
      notes,
      created_by: req.user.id
    });

    // Update asset status to maintenance if it's currently active
    if (asset.status === 'active') {
      await asset.update({ status: 'maintenance' });
    }

    // Fetch the created record with associations
    const createdMaintenance = await AssetMaintenance.findByPk(maintenance.id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Asset maintenance record created successfully',
      data: createdMaintenance
    });
  } catch (error) {
    logger.error('Error in createAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create asset maintenance record',
      error: error.message
    });
  }
};

/**
 * Get asset maintenance record by ID
 */
exports.getAssetMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await AssetMaintenance.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status', 'location', 'department_id'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'department_name']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'completer',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });
    if (!maintenance) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset maintenance record not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance record retrieved successfully',
      data: maintenance
    });
  } catch (error) {
    logger.error('Error in getAssetMaintenanceById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve asset maintenance record',
      error: error.message
    });
  }
};

/**
 * Update asset maintenance record
 */
exports.updateAssetMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const maintenance = await AssetMaintenance.findByPk(id);
    if (!maintenance) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset maintenance record not found'
      });
    }

    // Update the maintenance record
    await maintenance.update(updateData);

    // Fetch updated record with associations
    const updatedMaintenance = await AssetMaintenance.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'completer',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance record updated successfully',
      data: updatedMaintenance
    });
  } catch (error) {
    logger.error('Error in updateAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update asset maintenance record',
      error: error.message
    });
  }
};

/**
 * Delete asset maintenance record
 */
exports.deleteAssetMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await AssetMaintenance.findByPk(id);
    if (!maintenance) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset maintenance record not found'
      });
    }

    // Check if maintenance is completed
    if (maintenance.status === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot delete completed maintenance records'
      });
    }

    await maintenance.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance record deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete asset maintenance record',
      error: error.message
    });
  }
};

/**
 * Complete asset maintenance
 */
exports.completeAssetMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_date, actual_duration, actual_cost, completion_notes } = req.body;

    const maintenance = await AssetMaintenance.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset'
        }
      ]
    });

    if (!maintenance) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset maintenance record not found'
      });
    }

    if (maintenance.status === 'completed') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Maintenance is already completed'
      });
    }

    // Update maintenance record
    await maintenance.update({
      status: 'completed',
      completed_date: completed_date || new Date(),
      actual_duration,
      actual_cost,
      completion_notes,
      completion_percentage: 100,
      completed_by: req.user.id
    });

    // Update asset status back to active
    if (maintenance.asset) {
      await maintenance.asset.update({ status: 'active' });
    }

    // Fetch updated record with associations
    const completedMaintenance = await AssetMaintenance.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'completer',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance completed successfully',
      data: completedMaintenance
    });
  } catch (error) {
    logger.error('Error in completeAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to complete asset maintenance',
      error: error.message
    });
  }
};

/**
 * Export asset maintenance data
 */
exports.exportAssetMaintenance = async (req, res) => {
  try {
    const { status, type, format = 'xlsx' } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.maintenance_type = type;

    const maintenanceRecords = await AssetMaintenance.findAll({
      where: whereClause,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['asset_code', 'asset_name', 'asset_tag', 'category']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['first_name', 'sur_name']
        },
        {
          model: User,
          as: 'completer',
          attributes: ['first_name', 'sur_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // For now, return JSON. In a real implementation, you would generate Excel/CSV/PDF
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance data exported successfully',
      data: maintenanceRecords,
      format: format,
      total_records: maintenanceRecords.length
    });
  } catch (error) {
    logger.error('Error in exportAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to export asset maintenance data',
      error: error.message
    });
  }
};

/**
 * Get all assets for maintenance assignment
 */
exports.getAllAssets = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { asset_code: { [Op.like]: `%${search}%` } },
        { asset_name: { [Op.like]: `%${search}%` } },
        { asset_tag: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Asset.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: User,
          as: 'custodian',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ],
      attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status', 'location'],
      order: [['asset_name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Assets retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAllAssets:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve assets',
      error: error.message
    });
  }
};

// ==================== ASSET MAINTENANCE ENHANCED FEATURES ====================

/**
 * Get overdue maintenance
 */
exports.getOverdueMaintenance = async (req, res) => {
  try {
    const { days_overdue = 7 } = req.query;
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - parseInt(days_overdue));

    const overdueMaintenance = await AssetMaintenance.findAll({
      where: {
        scheduled_date: {
          [Op.lt]: overdueDate
        },
        status: {
          [Op.in]: ['scheduled', 'in_progress']
        }
      },
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'asset_code', 'asset_name', 'asset_tag', 'category', 'status']
        }
      ],
      order: [['scheduled_date', 'ASC']]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Overdue maintenance retrieved successfully',
      data: overdueMaintenance,
      total_overdue: overdueMaintenance.length
    });
  } catch (error) {
    logger.error('Error in getOverdueMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve overdue maintenance',
      error: error.message
    });
  }
};

/**
 * Get maintenance calendar data
 */
exports.getMaintenanceCalendar = async (req, res) => {
  try {
    const { month } = req.query;
    let startDate, endDate;

    if (month) {
      const [year, monthNum] = month.split('-');
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const calendarData = await AssetMaintenance.findAll({
      where: {
        scheduled_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['asset_code', 'asset_name', 'category']
        }
      ],
      order: [['scheduled_date', 'ASC']]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Maintenance calendar data retrieved successfully',
      data: calendarData,
      period: {
        start_date: startDate,
        end_date: endDate
      }
    });
  } catch (error) {
    logger.error('Error in getMaintenanceCalendar:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve maintenance calendar data',
      error: error.message
    });
  }
};

/**
 * Get maintenance cost analytics
 */
exports.getMaintenanceCosts = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    // This is a simplified version. In a real implementation, you would use raw SQL
    const completedMaintenance = await AssetMaintenance.findAll({
      where: {
        status: 'completed',
        completed_date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1)
        }
      },
      attributes: ['actual_cost', 'completed_date'],
      order: [['completed_date', 'ASC']]
    });

    // Calculate totals
    const totalCost = completedMaintenance.reduce((sum, record) => sum + (record.actual_cost || 0), 0);
    const totalRecords = completedMaintenance.length;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Maintenance cost analytics retrieved successfully',
      data: {
        total_cost: totalCost,
        total_maintenance_records: totalRecords,
        average_cost_per_maintenance: totalRecords > 0 ? totalCost / totalRecords : 0,
        period: period,
        year: year,
        records: completedMaintenance
      }
    });
  } catch (error) {
    logger.error('Error in getMaintenanceCosts:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve maintenance cost analytics',
      error: error.message
    });
  }
};

/**
 * Schedule maintenance for specific asset
 */
exports.scheduleAssetMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenance_type, scheduled_date, estimated_duration } = req.body;

    // Validate required fields
    if (!maintenance_type || !scheduled_date) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required fields: maintenance_type, scheduled_date'
      });
    }

    // Check if asset exists
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Generate maintenance number
    const maintenance_number = await generateMaintenanceNumber();

    // Create maintenance record
    const maintenance = await AssetMaintenance.create({
      maintenance_number,
      asset_id: id,
      maintenance_type,
      title: `Scheduled ${maintenance_type} maintenance for ${asset.asset_name}`,
      scheduled_date,
      estimated_duration,
      status: 'scheduled',
      created_by: req.user.id
    });

    // Update asset status to maintenance
    await asset.update({ status: 'maintenance' });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Maintenance scheduled successfully',
      data: maintenance
    });
  } catch (error) {
    logger.error('Error in scheduleAssetMaintenance:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to schedule maintenance',
      error: error.message
    });
  }
};

/**
 * Get maintenance history for asset
 */
exports.getAssetMaintenanceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { asset_id: id };
    if (status) whereClause.status = status;

    const { count, rows } = await AssetMaintenance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'sur_name']
        },
        {
          model: User,
          as: 'completer',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset maintenance history retrieved successfully',
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        records_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error in getAssetMaintenanceHistory:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve asset maintenance history',
      error: error.message
    });
  }
};

// ==================== ADDITIONAL BUDGET FEATURES ====================

/**
 * Get budget trends
 */
exports.getBudgetTrends = async (req, res) => {
  try {
    const { fiscal_year, trend_period = 'monthly' } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    // Generate trends based on period
    const trends = [];
    const currentYear = new Date().getFullYear();
    
    if (trend_period === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const monthExpenses = budgets.reduce((sum, budget) => 
          sum + budget.budgetExpenses.filter(expense => {
            const expenseDate = new Date(expense.created_at);
            return expenseDate.getMonth() === i && expenseDate.getFullYear() === currentYear;
          }).reduce((expSum, expense) => expSum + parseFloat(expense.amount), 0), 0);

        const monthBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0) / 12;

        trends.push({
          period: new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }),
          planned_amount: monthBudget,
          actual_amount: monthExpenses,
          variance: monthExpenses - monthBudget,
          trend_direction: monthExpenses > monthBudget ? 'over_budget' : 
                          monthExpenses < monthBudget ? 'under_budget' : 'on_budget'
        });
      }
    } else if (trend_period === 'quarterly') {
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      quarters.forEach((quarter, index) => {
        const quarterExpenses = budgets.reduce((sum, budget) => 
          sum + budget.budgetExpenses.filter(expense => {
            const expenseDate = new Date(expense.created_at);
            const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
            return expenseQuarter === index && expenseDate.getFullYear() === currentYear;
          }).reduce((expSum, expense) => expSum + parseFloat(expense.amount), 0), 0);

        const quarterBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0) / 4;

        trends.push({
          period: quarter,
          planned_amount: quarterBudget,
          actual_amount: quarterExpenses,
          variance: quarterExpenses - quarterBudget,
          trend_direction: quarterExpenses > quarterBudget ? 'over_budget' : 
                          quarterExpenses < quarterBudget ? 'under_budget' : 'on_budget'
        });
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget trends retrieved successfully',
      data: {
        trends: trends,
        trend_period: trend_period,
        fiscal_year: fiscal_year
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetTrends:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget trends',
      error: error.message
    });
  }
};

/**
 * Get budget comparison
 */
exports.getBudgetComparison = async (req, res) => {
  try {
    const { budget_ids, comparison_type = 'performance' } = req.body;

    if (!budget_ids || !Array.isArray(budget_ids) || budget_ids.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'At least two budget IDs are required for comparison'
      });
    }

    const budgets = await Budget.findAll({
      where: {
        id: budget_ids
      },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    if (budgets.length !== budget_ids.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'One or more budgets not found'
      });
    }

    const budgetComparisons = budgets.map(budget => {
      const totalBudget = parseFloat(budget.amount);
      const totalSpent = budget.budgetExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const variance = totalSpent - totalBudget;
      const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

      return {
        budget_id: budget.id,
        budget_name: budget.activity_name,
        department: budget.department?.department_name,
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_amount: totalBudget - totalSpent,
        utilization: utilization,
        variance: variance,
        variance_percentage: variancePercentage,
        status: budget.status
      };
    });

    // Calculate analysis
    const totalUtilization = budgetComparisons.reduce((sum, budget) => sum + budget.utilization, 0);
    const averageUtilization = budgetComparisons.length > 0 ? totalUtilization / budgetComparisons.length : 0;
    
    const bestPerformer = budgetComparisons.reduce((best, current) => 
      current.utilization > best.utilization ? current : best);
    const worstPerformer = budgetComparisons.reduce((worst, current) => 
      current.utilization < worst.utilization ? current : worst);

    const comparison = {
      budgets: budgetComparisons,
      analysis: {
        best_performer: bestPerformer.budget_id,
        worst_performer: worstPerformer.budget_id,
        average_utilization: averageUtilization,
        total_budgets: budgetComparisons.length,
        comparison_type: comparison_type
      }
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget comparison retrieved successfully',
      data: {
        comparison: comparison
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetComparison:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget comparison',
      error: error.message
    });
  }
};

/**
 * Get department budget summary
 */
exports.getDepartmentBudgetSummary = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { fiscal_year } = req.query;

    const whereClause = { department_id: departmentId };
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    if (budgets.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No budgets found for this department'
      });
    }

    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const totalSpent = budgets.reduce((sum, budget) => 
      sum + budget.budgetExpenses.reduce((expSum, expense) => 
        expSum + parseFloat(expense.amount), 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const summary = {
      department_id: departmentId,
      department_name: budgets[0].department?.department_name,
      fiscal_year: fiscal_year,
      total_budget: totalBudget,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      utilization_percentage: utilizationPercentage,
      budget_count: budgets.length,
      budgets: budgets.map(budget => ({
        id: budget.id,
        budget_name: budget.activity_name,
        amount: budget.amount,
        status: budget.status,
        spent_amount: budget.budgetExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0)
      }))
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Department budget summary retrieved successfully',
      data: {
        summary: summary
      }
    });
  } catch (error) {
    logger.error('Error in getDepartmentBudgetSummary:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve department budget summary',
      error: error.message
    });
  }
};

/**
 * Get budget summary
 */
exports.getBudgetSummary = async (req, res) => {
  try {
    const { fiscal_year, department } = req.query;

    const whereClause = {};
    if (fiscal_year) whereClause.fiscal_year = fiscal_year;
    if (department) whereClause.department_id = department;

    const budgets = await Budget.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: BudgetExpense,
          as: 'budgetExpenses'
        }
      ]
    });

    const totalBudgets = budgets.length;
    const totalPlanned = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    const totalSpent = budgets.reduce((sum, budget) => 
      sum + budget.budgetExpenses.reduce((expSum, expense) => 
        expSum + parseFloat(expense.amount), 0), 0);
    const totalRemaining = totalPlanned - totalSpent;
    const overallUtilization = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

    // Department breakdown
    const departmentBreakdown = Object.entries(
      budgets.reduce((acc, budget) => {
        const dept = budget.department?.department_name || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            budget_count: 0,
            total_amount: 0,
            spent_amount: 0
          };
        }
        acc[dept].budget_count++;
        acc[dept].total_amount += parseFloat(budget.amount);
        acc[dept].spent_amount += budget.budgetExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0);
        return acc;
      }, {})
    ).map(([dept, data]) => ({
      department: dept,
      budget_count: data.budget_count,
      total_amount: data.total_amount,
      spent_amount: data.spent_amount,
      remaining_amount: data.total_amount - data.spent_amount,
      utilization: data.total_amount > 0 ? (data.spent_amount / data.total_amount) * 100 : 0
    }));

    const summary = {
      total_budgets: totalBudgets,
      total_planned: totalPlanned,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      overall_utilization: overallUtilization,
      department_breakdown: departmentBreakdown,
      fiscal_year: fiscal_year,
      generated_at: new Date().toISOString()
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget summary retrieved successfully',
      data: {
        summary: summary
      }
    });
  } catch (error) {
    logger.error('Error in getBudgetSummary:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget summary',
      error: error.message
    });
  }
};

/**
 * Submit budget for approval
 */
exports.submitBudgetForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { submission_notes, approver_id } = req.body;

    const budget = await Budget.findByPk(id);
    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only draft budgets can be submitted for approval'
      });
    }

    await budget.update({
      status: 'submitted',
      submission_notes: submission_notes,
      submitted_by: req.user.id,
      submitted_at: new Date()
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget submitted for approval successfully',
      data: {
        budget_id: id,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in submitBudgetForApproval:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to submit budget for approval',
      error: error.message
    });
  }
};

/**
 * Reject budget
 */
exports.rejectBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason, suggested_changes } = req.body;

    const budget = await Budget.findByPk(id);
    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (budget.status !== 'submitted') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only submitted budgets can be rejected'
      });
    }

    await budget.update({
      status: 'rejected',
      rejection_reason: rejection_reason,
      suggested_changes: suggested_changes,
      rejected_by: req.user.id,
      rejected_at: new Date()
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget rejected successfully',
      data: {
        budget_id: id,
        status: 'rejected',
        rejected_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in rejectBudget:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reject budget',
      error: error.message
    });
  }
};

/**
 * Get budget workflow
 */
exports.getBudgetWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findByPk(id, {
      include: [
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        }
      ]
    });

    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const workflowSteps = [
      {
        step: 1,
        approver_role: 'Department Head',
        approver_id: budget.responsible_person_id,
        status: budget.status === 'draft' ? 'pending' : 'completed',
        completed_at: budget.status !== 'draft' ? budget.updated_at : null,
        notes: budget.status === 'draft' ? 'Awaiting department head approval' : 'Department head approved'
      }
    ];

    if (budget.status === 'submitted' || budget.status === 'approved' || budget.status === 'rejected') {
      workflowSteps.push({
        step: 2,
        approver_role: 'Finance Manager',
        approver_id: budget.approved_by,
        status: budget.status === 'submitted' ? 'pending' : 'completed',
        completed_at: budget.approved_at || budget.rejected_at,
        notes: budget.status === 'submitted' ? 'Awaiting finance manager approval' : 
               budget.status === 'approved' ? 'Finance manager approved' : 'Finance manager rejected'
      });
    }

    const workflow = {
      budget_id: id,
      current_status: budget.status,
      workflow_steps: workflowSteps,
      created_at: budget.created_at,
      updated_at: budget.updated_at
    };

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Budget workflow retrieved successfully',
      data: workflow
    });
  } catch (error) {
    logger.error('Error in getBudgetWorkflow:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve budget workflow',
      error: error.message
    });
  }
};
