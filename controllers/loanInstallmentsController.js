const { LoanInstallment } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class LoanInstallmentsController {
  // Get all installments for a loan
  static async getLoanInstallments(req, res) {
    try {
      const { loanId } = req.params;
      const installments = await LoanInstallment.findAll({
        where: {
          loan_id: loanId
        },
        order: [['installment_number', 'ASC']]
      });
      return res.json(installments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get overdue installments
  static async getOverdueInstallments(req, res) {
    try {
      const { userId } = req.user;
      const overdueInstallments = await LoanInstallment.findAll({
        where: {
          user_id: userId,
          status: 'overdue',
          due_date: {
            [Op.lt]: new Date()
          }
        },
        include: [
          {
            model: Loan,
            as: 'loan'
          }
        ],
        order: [['due_date', 'ASC']]
      });
      return res.json(overdueInstallments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update installment status
  static async updateInstallmentStatus(req, res) {
    try {
      const { installmentId } = req.params;
      const { status, paidAmount } = req.body;

      const installment = await LoanInstallment.findByPk(installmentId);
      if (!installment) {
        return res.status(404).json({ error: 'Installment not found' });
      }

      await installment.update({
        status,
        paid_amount: paidAmount,
        payment_date: status === 'paid' ? new Date() : null
      });

      return res.json(installment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get loan repayment schedule
  static async getRepaymentSchedule(req, res) {
    try {
      const { loanId } = req.params;
      const installments = await LoanInstallment.findAll({
        where: {
          loan_id: loanId
        },
        attributes: [
          'installment_number',
          'due_date',
          'amount',
          'principal',
          'interest',
          'status',
          'payment_date',
          'paid_amount',
          'balance'
        ],
        order: [['installment_number', 'ASC']]
      });

      return res.json(installments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LoanInstallmentsController;
