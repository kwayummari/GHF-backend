const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { TravelAdvanceRequest, TravelAdvanceExpense, User, Department, ExpenseLine } = require('../models');
const logger = require('../utils/logger');

// ==================== TRAVEL ADVANCE REQUESTS ====================

/**
 * Get all travel advance requests with filtering and pagination
 */
exports.getAllTravelAdvanceRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department_id,
      user_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (department_id) whereClause.department_id = department_id;
    if (user_id) whereClause.user_id = user_id;

    if (search) {
      whereClause[Op.or] = [
        { purpose: { [Op.like]: `%${search}%` } },
        { departure_date: { [Op.like]: `%${search}%` } },
        { return_date: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await TravelAdvanceRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    return res.json({
      total: count,
      page,
      limit,
      data: rows
    });
  } catch (error) {
    logger.error('Error getting travel advance requests:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new travel advance request
 */
exports.createTravelAdvanceRequest = async (req, res) => {
  try {
    const { userId } = req.user;
    const { department_id, purpose, departure_date, return_date, total_cost } = req.body;

    // Validate required fields
    if (!department_id || !purpose || !departure_date || !return_date || !total_cost) {
      return res.status(400).json({
        error: 'Department ID, purpose, dates, and total cost are required'
      });
    }

    // Generate request number
    const lastRequest = await TravelAdvanceRequest.findOne({
      order: [['id', 'DESC']]
    });
    const requestNumber = `TAR-${new Date().getFullYear()}-${(lastRequest ? lastRequest.id + 1 : 1).toString().padStart(3, '0')}`;

    const travelAdvanceRequest = await TravelAdvanceRequest.create({
      request_number: requestNumber,
      user_id: userId,
      department_id,
      purpose,
      departure_date,
      return_date,
      total_cost,
      status: 'draft'
    });

    return res.status(StatusCodes.CREATED).json(travelAdvanceRequest);
  } catch (error) {
    logger.error('Error creating travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get travel advance request by ID
 */
exports.getTravelAdvanceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const travelAdvanceRequest = await TravelAdvanceRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'first_name', 'sur_name']
        },
        {
          model: TravelAdvanceExpense,
          as: 'expenses',
          include: [
            {
              model: ExpenseLine,
              as: 'expenseLine',
              attributes: ['description', 'category', 'amount']
            }
          ]
        }
      ]
    });

    if (!travelAdvanceRequest) {
      return res.status(404).json({ error: 'Travel advance request not found' });
    }

    return res.json(travelAdvanceRequest);
  } catch (error) {
    logger.error('Error getting travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update travel advance request
 */
exports.updateTravelAdvanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, departure_date, return_date, total_cost } = req.body;

    const travelAdvanceRequest = await TravelAdvanceRequest.findByPk(id);
    if (!travelAdvanceRequest) {
      return res.status(404).json({ error: 'Travel advance request not found' });
    }

    // Only allow updates if status is draft
    if (travelAdvanceRequest.status !== 'draft') {
      return res.status(400).json({
        error: 'Cannot update request that is not in draft status'
      });
    }

    await travelAdvanceRequest.update({
      purpose,
      departure_date,
      return_date,
      total_cost
    });

    return res.json(travelAdvanceRequest);
  } catch (error) {
    logger.error('Error updating travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete travel advance request
 */
exports.deleteTravelAdvanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await TravelAdvanceRequest.destroy({
      where: { id }
    });
    return res.json({ message: 'Travel advance request deleted successfully' });
  } catch (error) {
    logger.error('Error deleting travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Submit travel advance request for approval
 */
exports.submitTravelAdvanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const travelAdvanceRequest = await TravelAdvanceRequest.findByPk(id);

    if (!travelAdvanceRequest) {
      return res.status(404).json({ error: 'Travel advance request not found' });
    }

    // Only allow submission if status is draft
    if (travelAdvanceRequest.status !== 'draft') {
      return res.status(400).json({
        error: 'Cannot submit request that is not in draft status'
      });
    }

    await travelAdvanceRequest.update({
      status: 'submitted',
      submitted_at: new Date()
    });

    return res.json(travelAdvanceRequest);
  } catch (error) {
    logger.error('Error submitting travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Approve travel advance request
 */
exports.approveTravelAdvanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const travelAdvanceRequest = await TravelAdvanceRequest.findByPk(id);

    if (!travelAdvanceRequest) {
      return res.status(404).json({ error: 'Travel advance request not found' });
    }

    // Only allow approval if status is submitted
    if (travelAdvanceRequest.status !== 'submitted') {
      return res.status(400).json({
        error: 'Cannot approve request that is not in submitted status'
      });
    }

    await travelAdvanceRequest.update({
      status: 'approved',
      approved_by: req.user.userId,
      approved_at: new Date()
    });

    return res.json(travelAdvanceRequest);
  } catch (error) {
    logger.error('Error approving travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Reject travel advance request
 */
exports.rejectTravelAdvanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const travelAdvanceRequest = await TravelAdvanceRequest.findByPk(id);

    if (!travelAdvanceRequest) {
      return res.status(404).json({ error: 'Travel advance request not found' });
    }

    // Only allow rejection if status is submitted
    if (travelAdvanceRequest.status !== 'submitted') {
      return res.status(400).json({
        error: 'Cannot reject request that is not in submitted status'
      });
    }

    await travelAdvanceRequest.update({
      status: 'rejected',
      rejection_reason,
      rejected_by: req.user.userId,
      rejected_at: new Date()
    });

    return res.json(travelAdvanceRequest);
  } catch (error) {
    logger.error('Error rejecting travel advance request:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ==================== TRAVEL ADVANCE EXPENSES ====================

/**
 * Get all expenses for a travel advance request
 */
exports.getTravelAdvanceExpenses = async (req, res) => {
  try {
    const { requestId } = req.params;
    const expenses = await TravelAdvanceExpense.findAll({
      where: { travel_advance_request_id: requestId },
      include: [
        {
          model: ExpenseLine,
          as: 'expenseLine',
          attributes: ['description', 'category', 'amount']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ]
    });

    return res.json(expenses);
  } catch (error) {
    logger.error('Error getting travel advance expenses:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new travel advance expense
 */
exports.createTravelAdvanceExpense = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { expense_line_id, amount, description, receipt_path } = req.body;

    // Validate required fields
    if (!expense_line_id || !amount || !description) {
      return res.status(400).json({
        error: 'Expense line ID, amount, and description are required'
      });
    }

    const expense = await TravelAdvanceExpense.create({
      travel_advance_request_id: requestId,
      expense_line_id,
      amount,
      description,
      receipt_path
    });

    return res.status(StatusCodes.CREATED).json(expense);
  } catch (error) {
    logger.error('Error creating travel advance expense:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get travel advance expense by ID
 */
exports.getTravelAdvanceExpenseById = async (req, res) => {
  try {
    const { requestId, expenseId } = req.params;
    const expense = await TravelAdvanceExpense.findByPk(expenseId, {
      where: { travel_advance_request_id: requestId },
      include: [
        {
          model: ExpenseLine,
          as: 'expenseLine',
          attributes: ['description', 'category', 'amount']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.json(expense);
  } catch (error) {
    logger.error('Error getting travel advance expense:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update travel advance expense
 */
exports.updateTravelAdvanceExpense = async (req, res) => {
  try {
    const { requestId, expenseId } = req.params;
    const { amount, description, receipt_path } = req.body;

    const expense = await TravelAdvanceExpense.findByPk(expenseId, {
      where: { travel_advance_request_id: requestId }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only allow updates if status is pending
    if (expense.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot update expense that is not in pending status'
      });
    }

    await expense.update({
      amount,
      description,
      receipt_path
    });

    return res.json(expense);
  } catch (error) {
    logger.error('Error updating travel advance expense:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete travel advance expense
 */
exports.deleteTravelAdvanceExpense = async (req, res) => {
  try {
    const { requestId, expenseId } = req.params;
    await TravelAdvanceExpense.destroy({
      where: {
        id: expenseId,
        travel_advance_request_id: requestId
      }
    });
    return res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Error deleting travel advance expense:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Approve travel advance expense
 */
exports.approveTravelAdvanceExpense = async (req, res) => {
  try {
    const { requestId, expenseId } = req.params;
    const expense = await TravelAdvanceExpense.findByPk(expenseId, {
      where: { travel_advance_request_id: requestId }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only allow approval if status is pending
    if (expense.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot approve expense that is not in pending status'
      });
    }

    await expense.update({
      status: 'approved',
      approved_by: req.user.userId,
      approved_at: new Date()
    });

    return res.json(expense);
  } catch (error) {
    logger.error('Error approving travel advance expense:', error);
    return res.status(500).json({ error: error.message });
  }
};
