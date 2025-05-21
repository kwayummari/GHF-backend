const { body } = require('express-validator');

/**
 * Clock in validation rules
 */
const clockInValidator = [
  body('date')
    .optional()
    .isDate().withMessage('Date must be a valid date'),
  
  body('activity')
    .optional()
    .trim(),
];

/**
 * Clock out validation rules
 */
const clockOutValidator = [
  body('date')
    .optional()
    .isDate().withMessage('Date must be a valid date'),
  
  body('activity')
    .optional()
    .trim(),
  
  body('description')
    .optional()
    .trim(),
];

/**
 * Attendance update validation rules
 */
const attendanceUpdateValidator = [
  body('date')
    .optional()
    .isDate().withMessage('Date must be a valid date'),
  
  body('arrival_time')
    .optional()
    .isISO8601().withMessage('Arrival time must be a valid datetime'),
  
  body('departure_time')
    .optional()
    .isISO8601().withMessage('Departure time must be a valid datetime')
    .custom((value, { req }) => {
      if (req.body.arrival_time && value) {
        const arrivalTime = new Date(req.body.arrival_time);
        const departureTime = new Date(value);
        
        if (departureTime < arrivalTime) {
          throw new Error('Departure time must be after arrival time');
        }
      }
      
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['absent', 'present', 'on leave', 'half day']).withMessage('Invalid status value'),
  
  body('description')
    .optional()
    .trim(),
  
  body('activity')
    .optional()
    .trim(),
  
  body('scheduler_status')
    .optional()
    .isIn(['working day', 'weekend', 'holiday in working day', 'holiday in weekend'])
    .withMessage('Invalid scheduler status value'),
  
  body('approval_status')
    .optional()
    .isIn(['draft', 'approved', 'rejected']).withMessage('Invalid approval status value'),
];

module.exports = {
  clockInValidator,
  clockOutValidator,
  attendanceUpdateValidator,
};