const { TimeOffRequest } = require('../models');

// Validate time off dates
const validateTimeOffDates = async (req, res, next) => {
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
      return res.status(400).json({ error: 'Cannot request time off for past dates' });
    }

    req.validatedDates = { start, end };
    next();
  } catch (error) {
    next(error);
  }
};

// Check overlapping time off requests
const checkOverlappingRequests = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { start, end } = req.validatedDates;

    const overlappingRequest = await TimeOffRequest.findOne({
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

    if (overlappingRequest) {
      return res.status(400).json({ 
        error: 'Overlapping time off request exists',
        existing: overlappingRequest
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check time off balance
const checkTimeOffBalance = async (req, res, next) => {
  try {
    const { userId, policyId } = req.body;
    const { start, end } = req.validatedDates;

    const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

    const balance = await TimeOffBalance.findOne({
      where: {
        user_id: userId,
        policy_id: policyId
      }
    });

    if (!balance) {
      return res.status(404).json({ error: 'No time off balance found for this policy' });
    }

    if (balance.balance < totalDays) {
      return res.status(400).json({ 
        error: 'Insufficient time off balance',
        available: balance.balance,
        requested: totalDays
      });
    }

    req.timeOffBalance = balance;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateTimeOffDates,
  checkOverlappingRequests,
  checkTimeOffBalance
};
