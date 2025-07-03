const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { ExpenseReport, User, TravelAdvanceRequest, BudgetExpense, Budget } = require('../models');
const logger = require('../utils/logger');

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
      description,
      budget_id
    } = req.body;

    // Validate required fields
    if (!date || !expense_title || !expense_amount) {
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

    const expenseReport = await ExpenseReport.create({
      travel_advance_request_id,
      date,
      expense_title,
      expense_amount,
      deadline,
      description,
      budget_id,
      user_id: req.user.id,
      status: 'pending',
      submitted_at: new Date()
    });

    // Create budget expense record if budget is provided
    if (budget_id) {
      await BudgetExpense.create({
        budget_id,
        expense_report_id: expenseReport.id,
        amount: expense_amount
      });
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Expense report created successfully',
      data: expenseReport
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
          model: BudgetExpense,
          as: 'budgetExpenses',
          include: [
            {
              model: Budget,
              as: 'budget',
              attributes: ['id', 'activity_name', 'amount']
            }
          ]
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
    const updateData = req.body;

    const expenseReport = await ExpenseReport.findByPk(id);
    if (!expenseReport) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Expense report not found'
      });
    }

    if (expenseReport.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending expense reports can be updated'
      });
    }

    await expenseReport.update(updateData);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Expense report updated successfully',
      data: expenseReport
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

    if (expenseReport.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending expense reports can be deleted'
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

    if (expenseReport.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Only pending expense reports can be approved or rejected'
      });
    }

    await expenseReport.update({
      status,
      approval_comment: comment,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Expense report ${status} successfully`,
      data: expenseReport
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