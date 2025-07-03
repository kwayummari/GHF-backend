const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { PettyCashBook, PettyCashTransaction, User, Department } = require('../models');
const logger = require('../utils/logger');

// ==================== PETTY CASH BOOKS ====================

/**
 * Get all petty cash books with filtering and pagination
 */
exports.getAllPettyCashBooks = async (req, res) => {
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
        { book_number: { [Op.like]: `%${search}%` } },
        { opening_balance: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await PettyCashBook.findAndCountAll({
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
    logger.error('Error getting petty cash books:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new petty cash book
 */
exports.createPettyCashBook = async (req, res) => {
  try {
    const { userId } = req.user;
    const { department_id, opening_balance } = req.body;

    // Validate required fields
    if (!department_id || !opening_balance) {
      return res.status(400).json({
        error: 'Department ID and opening balance are required'
      });
    }

    // Generate book number
    const lastBook = await PettyCashBook.findOne({
      order: [['id', 'DESC']]
    });
    const bookNumber = `PCB-${new Date().getFullYear()}-${(lastBook ? lastBook.id + 1 : 1).toString().padStart(3, '0')}`;

    const pettyCashBook = await PettyCashBook.create({
      book_number: bookNumber,
      user_id: userId,
      department_id,
      opening_balance,
      current_balance: opening_balance
    });

    return res.status(StatusCodes.CREATED).json(pettyCashBook);
  } catch (error) {
    logger.error('Error creating petty cash book:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get petty cash book by ID
 */
exports.getPettyCashBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const pettyCashBook = await PettyCashBook.findByPk(id, {
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
      ]
    });

    if (!pettyCashBook) {
      return res.status(404).json({ error: 'Petty cash book not found' });
    }

    return res.json(pettyCashBook);
  } catch (error) {
    logger.error('Error getting petty cash book:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update petty cash book status
 */
exports.updatePettyCashBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive', 'closed'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: active, inactive, closed'
      });
    }

    const pettyCashBook = await PettyCashBook.findByPk(id);
    if (!pettyCashBook) {
      return res.status(404).json({ error: 'Petty cash book not found' });
    }

    await pettyCashBook.update({ status });
    return res.json(pettyCashBook);
  } catch (error) {
    logger.error('Error updating petty cash book:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete petty cash book
 */
exports.deletePettyCashBook = async (req, res) => {
  try {
    const { id } = req.params;
    await PettyCashBook.destroy({
      where: { id }
    });
    return res.json({ message: 'Petty cash book deleted successfully' });
  } catch (error) {
    logger.error('Error deleting petty cash book:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Export petty cash books to CSV
 */
exports.exportPettyCashBooks = async (req, res) => {
  try {
    const pettyCashBooks = await PettyCashBook.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['first_name', 'sur_name', 'email']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name']
        }
      ]
    });

    const formattedData = pettyCashBooks.map(book => ({
      'Book Number': book.book_number,
      'Department': book.department.name,
      'User': `${book.user.first_name} ${book.user.sur_name}`,
      'Email': book.user.email,
      'Opening Balance': book.opening_balance,
      'Current Balance': book.current_balance,
      'Status': book.status,
      'Created At': book.createdAt,
      'Updated At': book.updatedAt
    }));

    const csv = require('json2csv').parse(formattedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=petty_cash_books.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting petty cash books:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ==================== PETTY CASH TRANSACTIONS ====================

/**
 * Get all petty cash transactions with filtering and pagination
 */
exports.getAllPettyCashTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      transaction_type,
      status,
      book_id,
      user_id,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (transaction_type) whereClause.transaction_type = transaction_type;
    if (status) whereClause.status = status;
    if (book_id) whereClause.petty_cash_book_id = book_id;
    if (user_id) whereClause.user_id = user_id;

    const { count, rows } = await PettyCashTransaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PettyCashBook,
          as: 'pettyCashBook',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'first_name', 'sur_name']
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
    logger.error('Error getting petty cash transactions:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new petty cash transaction
 */
exports.createPettyCashTransaction = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      petty_cash_book_id,
      transaction_type,
      amount,
      description,
      reference_number
    } = req.body;

    // Validate required fields
    if (!petty_cash_book_id || !transaction_type || !amount || !description) {
      return res.status(400).json({
        error: 'Petty cash book ID, transaction type, amount, and description are required'
      });
    }

    // Validate transaction type
    if (!['debit', 'credit'].includes(transaction_type)) {
      return res.status(400).json({
        error: 'Invalid transaction type. Must be one of: debit, credit'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    const transaction = await PettyCashTransaction.create({
      petty_cash_book_id,
      transaction_type,
      amount,
      description,
      reference_number,
      user_id: userId
    });

    // Update petty cash book balance
    const pettyCashBook = await PettyCashBook.findByPk(petty_cash_book_id);
    if (transaction_type === 'credit') {
      await pettyCashBook.increment('current_balance', { by: amount });
    } else {
      await pettyCashBook.decrement('current_balance', { by: amount });
    }

    return res.status(StatusCodes.CREATED).json(transaction);
  } catch (error) {
    logger.error('Error creating petty cash transaction:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get petty cash transaction by ID
 */
exports.getPettyCashTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await PettyCashTransaction.findByPk(id, {
      include: [
        {
          model: PettyCashBook,
          as: 'pettyCashBook',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['id', 'first_name', 'sur_name']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error) {
    logger.error('Error getting petty cash transaction:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update petty cash transaction status
 */
exports.updatePettyCashTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: pending, approved, rejected'
      });
    }

    const transaction = await PettyCashTransaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update status and approved_by if approved
    const updateData = { status };
    if (status === 'approved') {
      updateData.approved_by = req.user.userId;
      updateData.approved_at = new Date();
    }

    await transaction.update(updateData);
    return res.json(transaction);
  } catch (error) {
    logger.error('Error updating petty cash transaction:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete petty cash transaction
 */
exports.deletePettyCashTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await PettyCashTransaction.destroy({
      where: { id }
    });
    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Error deleting petty cash transaction:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Export petty cash transactions to CSV
 */
exports.exportPettyCashTransactions = async (req, res) => {
  try {
    const transactions = await PettyCashTransaction.findAll({
      include: [
        {
          model: PettyCashBook,
          as: 'pettyCashBook',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['first_name', 'sur_name']
        },
        {
          model: User,
          as: 'approvedBy',
          attributes: ['first_name', 'sur_name']
        }
      ]
    });

    const formattedData = transactions.map(t => ({
      'Transaction ID': t.id,
      'Book Number': t.pettyCashBook.book_number,
      'Department': t.pettyCashBook.department.name,
      'Transaction Type': t.transaction_type,
      'Amount': t.amount,
      'Description': t.description,
      'Reference Number': t.reference_number,
      'Transaction Date': t.transaction_date,
      'Status': t.status,
      'Created By': `${t.user.first_name} ${t.user.sur_name}`,
      'Approved By': `${t.approvedBy?.first_name || ''} ${t.approvedBy?.sur_name || ''}`,
      'Approved At': t.approved_at,
      'Created At': t.createdAt,
      'Updated At': t.updatedAt
    }));

    const csv = require('json2csv').parse(formattedData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=petty_cash_transactions.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting petty cash transactions:', error);
    return res.status(500).json({ error: error.message });
  }
};
