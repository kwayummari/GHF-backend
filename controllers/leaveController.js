const { LeaveType, LeaveBalance, LeaveRequest } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class LeaveController {
  // Get all leave types
  static async getLeaveTypes(req, res) {
    try {
      const leaveTypes = await LeaveType.findAll({
        where: {
          status: 'active'
        }
      });
      return res.json(leaveTypes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get leave balance for a user
  static async getLeaveBalance(req, res) {
    try {
      const { userId, year } = req.params;
      const balance = await LeaveBalance.findOne({
        where: {
          user_id: userId,
          year: year || new Date().getFullYear()
        },
        include: [
          {
            model: LeaveType,
            as: 'type'
          }
        ]
      });
      return res.json(balance || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Request leave
  static async requestLeave(req, res) {
    try {
      const { userId } = req.user;
      const { leaveTypeId, startDate, endDate, reason } = req.body;

      // Validate dates
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      // Calculate total days
      const totalDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;

      // Create leave request
      const leaveRequest = await LeaveRequest.create({
        user_id: userId,
        leave_type_id: leaveTypeId,
        startDate,
        endDate,
        totalDays,
        reason
      });

      return res.json(leaveRequest);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Approve/reject leave request
  static async updateLeaveRequest(req, res) {
    try {
      const { requestId, action } = req.params;
      const { userId } = req.user;

      const leaveRequest = await LeaveRequest.findByPk(requestId);
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      // Check if user has approval rights
      if (leaveRequest.user_id === userId) {
        return res.status(403).json({ error: 'Cannot approve/reject your own request' });
      }

      // Update request status
      const status = action === 'approve' ? 'approved' : 'rejected';
      await leaveRequest.update({
        status,
        approvedBy: userId,
        approvedDate: new Date()
      });

      return res.json(leaveRequest);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get user's leave history
  static async getLeaveHistory(req, res) {
    try {
      const { userId } = req.params;
      const leaveHistory = await LeaveRequest.findAll({
        where: {
          user_id: userId
        },
        include: [
          {
            model: LeaveType,
            as: 'type'
          },
          {
            model: User,
            as: 'approver'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json(leaveHistory);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LeaveController;
