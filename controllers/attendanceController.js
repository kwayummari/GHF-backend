const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const WorkScheduler = require('../models/WorkScheduler');
const HolidayList = require('../models/HolidayList');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const Department = require('../models/Department');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Clock in - Record arrival time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const clockIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date = new Date().toISOString().split('T')[0], activity } = req.body;
    
    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        user_id: userId,
        date
      }
    });
    
    if (existingAttendance && existingAttendance.arrival_time) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Already clocked in today',
        [{
          field: 'date',
          message: `Already clocked in at ${new Date(existingAttendance.arrival_time).toLocaleTimeString()}`
        }]
      );
    }
    
    // Check if it's a workday, weekend, or holiday
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check work schedule
    const workDay = await WorkScheduler.findOne({
      where: {
        day_of_week: dayOfWeek
      }
    });
    
    // Check if it's a holiday
    const holiday = await HolidayList.findOne({
      where: {
        date
      }
    });
    
    let schedulerStatus;
    
    if (holiday) {
      schedulerStatus = workDay ? 'holiday in working day' : 'holiday in weekend';
    } else {
      schedulerStatus = workDay ? 'working day' : 'weekend';
    }
    
    // Create or update attendance record
    const now = new Date();
    
    if (existingAttendance) {
      await existingAttendance.update({
        arrival_time: now,
        status: 'present',
        activity,
        scheduler_status: schedulerStatus
      });
      
      return successResponse(
        res,
        StatusCodes.OK,
        'Clock in successful',
        {
          ...existingAttendance.toJSON(),
          arrival_time: now
        }
      );
    } else {
      const newAttendance = await Attendance.create({
        user_id: userId,
        date,
        arrival_time: now,
        status: 'present',
        activity,
        scheduler_status: schedulerStatus,
        approval_status: 'draft'
      });
      
      return successResponse(
        res,
        StatusCodes.CREATED,
        'Clock in successful',
        newAttendance
      );
    }
  } catch (error) {
    logger.error('Clock in error:', error);
    next(error);
  }
};

/**
 * Clock out - Record departure time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const clockOut = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date = new Date().toISOString().split('T')[0], activity, description } = req.body;
    
    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        user_id: userId,
        date
      }
    });
    
    if (!existingAttendance || !existingAttendance.arrival_time) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Must clock in before clocking out',
        [{
          field: 'date',
          message: 'No clock in record found for today'
        }]
      );
    }
    
    if (existingAttendance.departure_time) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Already clocked out today',
        [{
          field: 'date',
          message: `Already clocked out at ${new Date(existingAttendance.departure_time).toLocaleTimeString()}`
        }]
      );
    }
    
    // Update attendance record with departure time
    const now = new Date();
    
    // Calculate work duration in hours
    const arrivalTime = new Date(existingAttendance.arrival_time);
    const durationHours = (now - arrivalTime) / (1000 * 60 * 60);
    
    // Determine if it's half day (less than 4 hours) or full day
    const status = durationHours < 4 ? 'half day' : 'present';
    
    // Update attendance
    await existingAttendance.update({
      departure_time: now,
      status,
      activity: activity || existingAttendance.activity,
      description: description || existingAttendance.description
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Clock out successful',
      {
        ...existingAttendance.toJSON(),
        departure_time: now,
        duration_hours: durationHours.toFixed(2)
      }
    );
  } catch (error) {
    logger.error('Clock out error:', error);
    next(error);
  }
};

/**
 * Get attendance records for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 31, 
      month, 
      year,
      status = ''
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const whereConditions = {
      user_id: userId
    };
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
      
      whereConditions.date = {
        [Op.between]: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ]
      };
    } else if (year) {
      // Just filter by year
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      
      whereConditions.date = {
        [Op.between]: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ]
      };
    }
    
    // Filter by status if provided
    if (status) {
      whereConditions.status = status;
    }
    
    // Execute query
    const { count, rows } = await Attendance.findAndCountAll({
      where: whereConditions,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    
    // Calculate summary statistics
    const presentDays = rows.filter(record => record.status === 'present').length;
    const halfDays = rows.filter(record => record.status === 'half day').length;
    const absentDays = rows.filter(record => record.status === 'absent').length;
    const leaveDays = rows.filter(record => record.status === 'on leave').length;
    
    return paginatedResponse(
      res,
      StatusCodes.OK,
      'Attendance records retrieved successfully',
      rows,
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        summary: {
          presentDays,
          halfDays,
          absentDays,
          leaveDays,
          workingDays: rows.filter(record => record.scheduler_status === 'working day').length
        }
      }
    );
  } catch (error) {
    logger.error('Get my attendance error:', error);
    next(error);
  }
};

/**
 * Get attendance for a specific employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 31, 
      month, 
      year,
      status = ''
    } = req.query;
    
    // Check permissions - only admin, HR, or the employee's supervisor can view
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    
    if (!isAdmin && !isHR) {
      // Check if user is supervisor
      const employeeData = await BasicEmployeeData.findOne({
        where: { user_id: id }
      });
      
      if (!employeeData || employeeData.supervisor_id !== req.user.id) {
        return errorResponse(
          res,
          StatusCodes.FORBIDDEN,
          'You do not have permission to view this employee\'s attendance'
        );
      }
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const whereConditions = {
      user_id: id
    };
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
      
      whereConditions.date = {
        [Op.between]: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ]
      };
    } else if (year) {
      // Just filter by year
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      
      whereConditions.date = {
        [Op.between]: [
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ]
      };
    }
    
    // Filter by status if provided
    if (status) {
      whereConditions.status = status;
    }
    
    // Get employee details
    const employee = await User.findOne({
      where: { id },
      attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
      include: [
        {
          model: BasicEmployeeData,
          as: 'basicEmployeeData',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'department_name']
            }
          ]
        }
      ]
    });
    
    if (!employee) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Employee not found'
      );
    }
    
    // Execute query
    const { count, rows } = await Attendance.findAndCountAll({
      where: whereConditions,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    
    // Calculate summary statistics
    const presentDays = rows.filter(record => record.status === 'present').length;
    const halfDays = rows.filter(record => record.status === 'half day').length;
    const absentDays = rows.filter(record => record.status === 'absent').length;
    const leaveDays = rows.filter(record => record.status === 'on leave').length;
    
    return paginatedResponse(
      res,
      StatusCodes.OK,
      'Employee attendance records retrieved successfully',
      {
        employee: {
          id: employee.id,
          name: `${employee.first_name} ${employee.middle_name ? employee.middle_name + ' ' : ''}${employee.sur_name}`,
          email: employee.email,
          department: employee.basicEmployeeData?.department?.department_name || 'Not assigned',
          designation: employee.basicEmployeeData?.designation || 'Not assigned'
        },
        attendance: rows
      },
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        summary: {
          presentDays,
          halfDays,
          absentDays,
          leaveDays,
          workingDays: rows.filter(record => record.scheduler_status === 'working day').length
        }
      }
    );
  } catch (error) {
    logger.error('Get employee attendance error:', error);
    next(error);
  }
};

/**
 * Get attendance report for all employees in a department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getDepartmentAttendanceReport = async (req, res, next) => {
  try {
    const { department_id } = req.params;
    const { 
      date = new Date().toISOString().split('T')[0]
    } = req.query;
    
    // Check if department exists
    const department = await Department.findByPk(department_id);
    
    if (!department) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Department not found'
      );
    }
    
    // Get all employees in department
    const employees = await User.findAll({
      include: [
        {
          model: BasicEmployeeData,
          as: 'basicEmployeeData',
          where: { department_id },
          required: true
        }
      ],
      where: {
        status: 'active'
      },
      attributes: ['id', 'first_name', 'middle_name', 'sur_name'],
      order: [['first_name', 'ASC'], ['sur_name', 'ASC']]
    });
    
    // Get attendance records for the day
    const attendanceRecords = await Attendance.findAll({
      where: {
        user_id: employees.map(emp => emp.id),
        date
      }
    });
    
    // Map attendance records to employees
    const attendanceReport = employees.map(employee => {
      const attendanceRecord = attendanceRecords.find(record => record.user_id === employee.id);
      
      return {
        employee_id: employee.id,
        name: `${employee.first_name} ${employee.middle_name ? employee.middle_name + ' ' : ''}${employee.sur_name}`,
        status: attendanceRecord ? attendanceRecord.status : 'absent',
        arrival_time: attendanceRecord?.arrival_time,
        departure_time: attendanceRecord?.departure_time,
        activity: attendanceRecord?.activity
      };
    });
    
    // Calculate summary
    const present = attendanceReport.filter(record => record.status === 'present').length;
    const halfDay = attendanceReport.filter(record => record.status === 'half day').length;
    const absent = attendanceReport.filter(record => record.status === 'absent').length;
    const onLeave = attendanceReport.filter(record => record.status === 'on leave').length;
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Department attendance report retrieved successfully',
      {
        department: department.department_name,
        date,
        total_employees: employees.length,
        summary: {
          present,
          half_day: halfDay,
          absent,
          on_leave: onLeave,
          attendance_rate: ((present + halfDay + onLeave) / employees.length * 100).toFixed(2) + '%'
        },
        employees: attendanceReport
      }
    );
  } catch (error) {
    logger.error('Get department attendance report error:', error);
    next(error);
  }
};

/**
 * Admin function to manually update attendance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      date,
      arrival_time,
      departure_time,
      status,
      description,
      activity,
      scheduler_status,
      approval_status
    } = req.body;
    
    // Check if attendance record exists
    const attendance = await Attendance.findByPk(id);
    
    if (!attendance) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Attendance record not found'
      );
    }
    
    // Check permissions - only admin or HR can update attendance
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    
    if (!isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to update attendance records'
      );
    }
    
    // Update attendance record
    const updateData = {};
    
    if (date) updateData.date = date;
    if (arrival_time) updateData.arrival_time = arrival_time;
    if (departure_time) updateData.departure_time = departure_time;
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (activity !== undefined) updateData.activity = activity;
    if (scheduler_status) updateData.scheduler_status = scheduler_status;
    if (approval_status) updateData.approval_status = approval_status;
    
    await attendance.update(updateData);
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Attendance record updated successfully',
      attendance
    );
  } catch (error) {
    logger.error('Update attendance error:', error);
    next(error);
  }
};

/**
 * Get work schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getWorkSchedule = async (req, res, next) => {
  try {
    const workSchedule = await WorkScheduler.findAll({
      order: [
        [sequelize.literal(`CASE 
          WHEN day_of_week = 'Monday' THEN 1 
          WHEN day_of_week = 'Tuesday' THEN 2 
          WHEN day_of_week = 'Wednesday' THEN 3 
          WHEN day_of_week = 'Thursday' THEN 4 
          WHEN day_of_week = 'Friday' THEN 5 
          WHEN day_of_week = 'Saturday' THEN 6 
          WHEN day_of_week = 'Sunday' THEN 7 
        END`), 'ASC']
      ]
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Work schedule retrieved successfully',
      workSchedule
    );
  } catch (error) {
    logger.error('Get work schedule error:', error);
    next(error);
  }
};

/**
 * Update work schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateWorkSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;
    
    // Check if work schedule exists
    const workSchedule = await WorkScheduler.findByPk(id);
    
    if (!workSchedule) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Work schedule not found'
      );
    }
    
    // Check permissions - only admin can update work schedule
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    
    if (!isAdmin) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to update work schedule'
      );
    }
    
    // Update work schedule
    await workSchedule.update({
      start_time: start_time || workSchedule.start_time,
      end_time: end_time || workSchedule.end_time
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Work schedule updated successfully',
      workSchedule
    );
  } catch (error) {
    logger.error('Update work schedule error:', error);
    next(error);
  }
};

/**
 * Get holidays
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getHolidays = async (req, res, next) => {
  try {
    const { year } = req.query;
    
    const whereConditions = {};
    
    if (year) {
      whereConditions.date = {
        [Op.between]: [
          `${year}-01-01`,
          `${year}-12-31`
        ]
      };
    }
    
    const holidays = await HolidayList.findAll({
      where: whereConditions,
      order: [['date', 'ASC']]
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Holidays retrieved successfully',
      holidays
    );
  } catch (error) {
    logger.error('Get holidays error:', error);
    next(error);
  }
};

/**
 * Create holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createHoliday = async (req, res, next) => {
  try {
    const { name, date, is_workday = false } = req.body;
    
    // Check if holiday already exists on this date
    const existingHoliday = await HolidayList.findOne({
      where: { date }
    });
    
    if (existingHoliday) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'Holiday already exists on this date',
        [{ field: 'date', message: `${existingHoliday.name} is already scheduled for this date` }]
      );
    }
    
    // Create holiday
    const holiday = await HolidayList.create({
      name,
      date,
      is_workday,
      status: 'editable',
      created_by: req.user.id
    });
    
    return successResponse(
      res,
      StatusCodes.CREATED,
      'Holiday created successfully',
      holiday
    );
  } catch (error) {
    logger.error('Create holiday error:', error);
    next(error);
  }
};

/**
 * Update holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, date, is_workday } = req.body;
    
    // Check if holiday exists
    const holiday = await HolidayList.findByPk(id);
    
    if (!holiday) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Holiday not found'
      );
    }
    
    // Check if holiday is editable
    if (holiday.status === 'non-editable') {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'This holiday cannot be edited'
      );
    }
    
    // Check if date is being changed and if so, check for conflicts
    if (date && date !== holiday.date) {
      const existingHoliday = await HolidayList.findOne({
        where: { 
          date,
          id: { [Op.ne]: id } // Exclude current holiday
        }
      });
      
      if (existingHoliday) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'Holiday already exists on this date',
          [{ field: 'date', message: `${existingHoliday.name} is already scheduled for this date` }]
        );
      }
    }
    
    // Update holiday
    await holiday.update({
      name: name || holiday.name,
      date: date || holiday.date,
      is_workday: is_workday !== undefined ? is_workday : holiday.is_workday,
      updated_by: req.user.id
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Holiday updated successfully',
      holiday
    );
  } catch (error) {
    logger.error('Update holiday error:', error);
    next(error);
  }
};

/**
 * Delete holiday
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if holiday exists
    const holiday = await HolidayList.findByPk(id);
    
    if (!holiday) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Holiday not found'
      );
    }
    
    // Check if holiday is editable
    if (holiday.status === 'non-editable') {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'This holiday cannot be deleted'
      );
    }
    
    // Delete holiday
    await holiday.destroy();
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Holiday deleted successfully'
    );
  } catch (error) {
    logger.error('Delete holiday error:', error);
    next(error);
  }
};

module.exports = {
  clockIn,
  clockOut,
  getMyAttendance,
  getEmployeeAttendance,
  getDepartmentAttendanceReport,
  updateAttendance,
  getWorkSchedule,
  updateWorkSchedule,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};