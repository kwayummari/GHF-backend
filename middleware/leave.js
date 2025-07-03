const { LeaveRequest } = require('../models');

// Validate leave dates
const validateLeaveDates = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Check if dates are valid
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Check if start date is before end date
    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Check if dates are not in the past
    const now = new Date();
    if (start < now) {
      return res.status(400).json({ error: 'Cannot request leave for past dates' });
    }

    req.validatedDates = { start, end };
    next();
  } catch (error) {
    next(error);
  }
};

// Check leave balance
const checkLeaveBalance = async (req, res, next) => {
  try {
    const { userId, leaveTypeId } = req.body;
    const { start, end } = req.validatedDates;

    const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

    const balance = await LeaveBalance.findOne({
      where: {
        user_id: userId,
        leave_type_id: leaveTypeId
      }
    });

    if (!balance) {
      return res.status(404).json({ error: 'No leave balance found for this type' });
    }

    if (balance.balance < totalDays) {
      return res.status(400).json({ 
        error: 'Insufficient leave balance',
        available: balance.balance,
        requested: totalDays
      });
    }

    req.leaveBalance = balance;
    next();
  } catch (error) {
    next(error);
  }
};

// Check overlapping leave requests
const checkOverlappingLeaves = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { start, end } = req.validatedDates;

    const overlappingLeave = await LeaveRequest.findOne({
      where: {
        user_id: userId,
        status: { [Op.not]: 'cancelled' },
        [Op.or]: [
          {
            startDate: { [Op.lte]: start },
            endDate: { [Op.gte]: start }
          },
          {
            startDate: { [Op.lte]: end },
            endDate: { [Op.gte]: end }
          }
        ]
      }
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        error: 'Overlapping leave request exists',
        existing: overlappingLeave
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateLeaveDates,
  checkLeaveBalance,
  checkOverlappingLeaves
};
