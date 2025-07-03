const { ExpenseReport } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class ExpenseReportController {
  // Get all expense reports
  static async getAllExpenseReports(req, res) {
    try {
      const { userId, departmentId, status, startDate, endDate } = req.query;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (departmentId) {
        where.department_id = departmentId;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const expenseReports = await ExpenseReport.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user'
          },
          {
            model: User,
            as: 'approvedBy'
          },
          {
            model: Department,
            as: 'department'
          },
          {
            model: Budget,
            as: 'budget'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.json(expenseReports);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create expense report
  static async createExpenseReport(req, res) {
    try {
      const { userId } = req.user;
      const { departmentId, budgetId, title, description, items } = req.body;

      // Generate report number
      const lastReport = await ExpenseReport.findOne({
        order: [['id', 'DESC']]
      });

      const reportNumber = `EXP-${new Date().getFullYear()}-${(lastReport ? lastReport.id + 1 : 1).toString().padStart(5, '0')}`;

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

      const expenseReport = await ExpenseReport.create({
        report_number: reportNumber,
        user_id: userId,
        department_id: departmentId,
        budget_id: budgetId,
        title,
        description,
        total_amount: totalAmount,
        status: 'draft'
      });

      return res.json(expenseReport);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Submit expense report
  static async submitExpenseReport(req, res) {
    try {
      const { reportId } = req.params;
      const expenseReport = await ExpenseReport.findByPk(reportId);

      if (!expenseReport) {
        return res.status(404).json({ error: 'Expense report not found' });
      }

      if (expenseReport.status !== 'draft') {
        return res.status(400).json({ error: 'Expense report cannot be submitted' });
      }

      await expenseReport.update({
        status: 'submitted',
        submitted_at: new Date()
      });

      return res.json(expenseReport);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Approve expense report
  static async approveExpenseReport(req, res) {
    try {
      const { reportId } = req.params;
      const { userId } = req.user;

      const expenseReport = await ExpenseReport.findByPk(reportId);

      if (!expenseReport) {
        return res.status(404).json({ error: 'Expense report not found' });
      }

      if (expenseReport.status !== 'submitted') {
        return res.status(400).json({ error: 'Expense report cannot be approved' });
      }

      await expenseReport.update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date()
      });

      return res.json(expenseReport);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get expense report statistics
  static async getExpenseReportStatistics(req, res) {
    try {
      const { departmentId, startDate, endDate } = req.query;
      const where = {};

      if (departmentId) {
        where.department_id = departmentId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const [totalReports, totalAmount, approvedReports] = await Promise.all([
        ExpenseReport.count({ where }),
        ExpenseReport.sum('total_amount', { where }),
        ExpenseReport.count({
          where: {
            ...where,
            status: 'approved'
          }
        })
      ]);

      return res.json({
        totalReports: totalReports || 0,
        totalAmount: totalAmount || 0,
        approvedReports: approvedReports || 0,
        approvalRate: totalReports > 0 ? ((approvedReports / totalReports) * 100).toFixed(2) : 0
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ExpenseReportController;
