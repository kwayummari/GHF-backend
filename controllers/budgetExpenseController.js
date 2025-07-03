const { BudgetExpense, BudgetCategory } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class BudgetExpenseController {
  // Get all budget expenses
  static async getAllExpenses(req, res) {
    try {
      const { categoryId, status, startDate, endDate } = req.query;
      const where = {};

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.date[Op.lte] = new Date(endDate);
        }
      }

      const expenses = await BudgetExpense.findAll({
        where,
        include: [
          {
            model: BudgetCategory,
            as: 'category'
          },
          {
            model: User,
            as: 'approvedBy'
          }
        ],
        order: [['date', 'DESC']]
      });

      return res.json(expenses);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new budget expense
  static async createExpense(req, res) {
    try {
      const { userId } = req.user;
      const { categoryId, amount, description, date, status } = req.body;

      const expense = await BudgetExpense.create({
        category_id: categoryId,
        amount,
        description,
        date: date || new Date(),
        status: status || 'pending',
        created_by: userId
      });

      return res.json(expense);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update expense status
  static async updateExpenseStatus(req, res) {
    try {
      const { expenseId } = req.params;
      const { status } = req.body;

      const expense = await BudgetExpense.findByPk(expenseId);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      await expense.update({
        status,
        approved_by: req.user.id,
        approved_date: new Date()
      });

      return res.json(expense);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get expense statistics
  static async getExpenseStatistics(req, res) {
    try {
      const { categoryId, startDate, endDate } = req.query;
      const where = {};

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.date[Op.lte] = new Date(endDate);
        }
      }

      const [totalAmount, totalRecords] = await Promise.all([
        BudgetExpense.sum('amount', { where }),
        BudgetExpense.count({ where })
      ]);

      const categoryStats = await BudgetCategory.findAll({
        where: {
          id: {
            [Op.in]: await BudgetExpense.findAll({
              attributes: ['category_id'],
              where,
              group: ['category_id']
            }).map(expense => expense.category_id)
          }
        },
        attributes: ['id', 'name'],
        include: [
          {
            model: BudgetExpense,
            attributes: ['amount'],
            where
          }
        ]
      });

      return res.json({
        totalAmount: totalAmount || 0,
        totalRecords: totalRecords || 0,
        categoryStats
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BudgetExpenseController;
