const { TimeOffPolicy, TimeOffBalance, TimeOffRequest } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class TimeOffController {
  // Get all time off policies
  static async getPolicies(req, res) {
    try {
      const policies = await TimeOffPolicy.findAll({
        where: {
          status: 'active'
        }
      });
      return res.json(policies);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get time off balance
  static async getBalance(req, res) {
    try {
      const { userId, year } = req.params;
      const balance = await TimeOffBalance.findOne({
        where: {
          user_id: userId,
          year: year || new Date().getFullYear()
        },
        include: [
          {
            model: TimeOffPolicy,
            as: 'policy'
          }
        ]
      });
      return res.json(balance || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Request time off
  static async requestTimeOff(req, res) {
    try {
      const { userId } = req.user;
      const { policyId, startDate, endDate, reason } = req.body;

      // Validate dates
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      // Calculate total days
      const totalDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;

      // Check balance
      const balance = await TimeOffBalance.findOne({
        where: {
          user_id: userId,
          policy_id: policyId
        }
      });

      if (!balance || balance.balance < totalDays) {
        return res.status(400).json({
          error: 'Insufficient balance',
          available: balance ? balance.balance : 0,
          requested: totalDays
        });
      }

      // Create time off request
      const request = await TimeOffRequest.create({
        user_id: userId,
        policy_id: policyId,
        startDate,
        endDate,
        totalDays,
        reason
      });

      // Update balance
      await balance.update({
        balance: balance.balance - totalDays
      });

      return res.json(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Approve/reject time off request
  static async updateRequest(req, res) {
    try {
      const { requestId, action } = req.params;
      const { userId } = req.user;

      const request = await TimeOffRequest.findByPk(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if user has approval rights
      if (request.user_id === userId) {
        return res.status(403).json({ error: 'Cannot approve/reject your own request' });
      }

      // Update request status
      const status = action === 'approve' ? 'approved' : 'rejected';
      const updatedRequest = await request.update({
        status,
        approved_by: userId,
        approvedDate: new Date()
      });

      // If approved, update balance
      if (status === 'approved') {
        const balance = await TimeOffBalance.findOne({
          where: {
            user_id: request.user_id,
            policy_id: request.policy_id
          }
        });

        if (balance) {
          await balance.update({
            balance: balance.balance - request.totalDays
          });
        }
      }

      return res.json(updatedRequest);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get time off history
  static async getTimeOffHistory(req, res) {
    try {
      const { userId } = req.params;
      const history = await TimeOffRequest.findAll({
        where: {
          user_id: userId
        },
        include: [
          {
            model: TimeOffPolicy,
            as: 'policy'
          },
          {
            model: User,
            as: 'approver'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json(history);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TimeOffController;
