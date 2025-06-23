const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveType = require('../models/LeaveType');
const User = require('../models/User');
const Document = require('../models/Document');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const Attendance = require('../models/Attendance');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const { sendEmail } = require('../services/mailer');
const logger = require('../utils/logger');
const { formatDate } = require('../utils/dateUtils');

/**
 * Get all leave types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.findAll({
      order: [['name', 'ASC']]
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Leave types retrieved successfully',
      leaveTypes
    );
  } catch (error) {
    logger.error('Get all leave types error:', error);
    next(error);
  }
};

/**
 * Create a new leave application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createLeaveApplication = async (req, res, next) => {
  try {
    const { 
      type_id,
      starting_date,
      end_date,
      comment,
      attachment_id,
      save_as_draft = false
    } = req.body;
    
    const userId = req.user.id;
    
    // Validate leave type
    const leaveType = await LeaveType.findByPk(type_id);
    
    if (!leaveType) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Leave type not found'
      );
    }
    
    // Calculate number of days
    const start = new Date(starting_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
    
    // Validate against minimum and maximum days
    if (diffDays < leaveType.minimum_days) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Minimum days for ${leaveType.name} is ${leaveType.minimum_days}`,
        [{ field: 'starting_date', message: `Minimum days required: ${leaveType.minimum_days}` }]
      );
    }
    
    if (diffDays > leaveType.maximum_days) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Maximum days for ${leaveType.name} is ${leaveType.maximum_days}`,
        [{ field: 'end_date', message: `Maximum days allowed: ${leaveType.maximum_days}` }]
      );
    }
    
    // Check for overlapping leave applications
    const overlappingLeave = await LeaveApplication.findOne({
      where: {
        user_id: userId,
        [Op.or]: [
          {
            starting_date: {
              [Op.between]: [starting_date, end_date]
            }
          },
          {
            end_date: {
              [Op.between]: [starting_date, end_date]
            }
          },
          {
            [Op.and]: [
              { starting_date: { [Op.lte]: starting_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ],
        approval_status: {
          [Op.notIn]: ['rejected', 'draft']
        }
      }
    });
    
    if (overlappingLeave) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'You already have a leave application for this period',
        [{ field: 'starting_date', message: 'Overlapping leave application exists' }]
      );
    }
    
    // Get employee data to find supervisor
    const employeeData = await BasicEmployeeData.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'email', 'first_name', 'sur_name']
        }
      ]
    });
    
    // Create leave application
    const leaveApplication = await LeaveApplication.create({
      user_id: userId,
      type_id,
      starting_date,
      end_date,
      approval_status: save_as_draft ? 'draft' : 'pending',
      comment,
      attachment_id,
      validity_check: `${diffDays} days`
    });
    
    // If not saved as draft and there's a supervisor, send notification
    if (!save_as_draft && employeeData && employeeData.supervisor) {
      const applicant = await User.findByPk(userId);
      
      // Send email to supervisor
      await sendEmail({
        to: employeeData.supervisor.email,
        subject: 'Leave Application Requires Approval',
        template: 'leave-request',
        templateData: {
          supervisorName: employeeData.supervisor.first_name,
          employeeName: `${applicant.first_name} ${applicant.sur_name}`,
          leaveType: leaveType.name,
          startDate: formatDate(start),
          endDate: formatDate(end),
          days: diffDays,
          applicationId: leaveApplication.id
        }
      });
    }
    
    // Return created leave application
    const createdLeave = await LeaveApplication.findOne({
      where: { id: leaveApplication.id },
      include: [
        {
          model: LeaveType,
          as: 'leaveType'
        },
        {
          model: Document,
          as: 'attachment',
          attributes: ['id', 'name', 'file_path', 'file_type']
        }
      ]
    });
    
    return successResponse(
      res,
      StatusCodes.CREATED,
      save_as_draft ? 'Leave application saved as draft' : 'Leave application submitted successfully',
      createdLeave
    );
  } catch (error) {
    logger.error('Create leave application error:', error);
    next(error);
  }
};

/**
 * Get all leave applications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllLeaveApplications = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      type_id = '', 
      employee_id = '',
      from_date = '',
      to_date = '',
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where conditions
    const whereConditions = {};
    
    if (status) {
      whereConditions.approval_status = status;
    }
    
    if (type_id) {
      whereConditions.type_id = type_id;
    }
    
    if (employee_id) {
      whereConditions.user_id = employee_id;
    }
    
    if (from_date) {
      whereConditions.starting_date = {
        ...whereConditions.starting_date,
        [Op.gte]: from_date
      };
    }
    
    if (to_date) {
      whereConditions.end_date = {
        ...whereConditions.end_date,
        [Op.lte]: to_date
      };
    }
    
    // Check user roles for access control
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    
    // If not admin or HR, limit to user's own applications or as a supervisor
    if (!isAdmin && !isHR) {
      // Get users where current user is supervisor
      const supervisedUsers = await BasicEmployeeData.findAll({
        where: { supervisor_id: req.user.id },
        attributes: ['user_id']
      });
      
      const supervisedUserIds = supervisedUsers.map(user => user.user_id);
      
      // Include own applications and those the user supervises
      whereConditions[Op.or] = [
        { user_id: req.user.id },
        {
          user_id: { [Op.in]: supervisedUserIds },
          approval_status: { [Op.in]: ['pending', 'approved by supervisor'] }
        }
      ];
    }
    
    // Execute query
    const { count, rows } = await LeaveApplication.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
        },
        {
          model: LeaveType,
          as: 'leaveType'
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'sur_name']
        },
        {
          model: Document,
          as: 'attachment',
          attributes: ['id', 'name', 'file_path', 'file_type']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);
    
    return paginatedResponse(
      res,
      StatusCodes.OK,
      'Leave applications retrieved successfully',
      rows,
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    );
  } catch (error) {
    logger.error('Get all leave applications error:', error);
    next(error);
  }
};

/**
 * Get leave application by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeaveApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const leaveApplication = await LeaveApplication.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
          include: [
            {
              model: BasicEmployeeData,
              as: 'basicEmployeeData',
              include: [
                {
                  model: User,
                  as: 'supervisor',
                  attributes: ['id', 'first_name', 'sur_name']
                }
              ]
            }
          ]
        },
        {
          model: LeaveType,
          as: 'leaveType'
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'first_name', 'sur_name']
        },
        {
          model: Document,
          as: 'attachment',
          attributes: ['id', 'name', 'file_path', 'file_type']
        }
      ]
    });
    
    if (!leaveApplication) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Leave application not found'
      );
    }
    
    // Check access permission - only allow if it's the user's own application, 
    // they're the supervisor, or they're admin/HR
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isOwnApplication = leaveApplication.user_id === req.user.id;
    const isSupervisor = leaveApplication.user.basicEmployeeData && 
                         leaveApplication.user.basicEmployeeData.supervisor &&
                         leaveApplication.user.basicEmployeeData.supervisor.id === req.user.id;
    
    if (!isAdmin && !isHR && !isOwnApplication && !isSupervisor) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to view this leave application'
      );
    }
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Leave application retrieved successfully',
      leaveApplication
    );
  } catch (error) {
    logger.error('Get leave application by ID error:', error);
    next(error);
  }
};

/**
 * Update leave application status (approve/reject)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const currentUserId = req.user.id;
    
    // Validate status value
    const validStatuses = ['approved by supervisor', 'approved by hr', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Invalid status value',
        [{ field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}` }]
      );
    }
    
    // Get leave application with user data
    const leaveApplication = await LeaveApplication.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email'],
          include: [
            {
              model: BasicEmployeeData,
              as: 'basicEmployeeData',
              include: [
                {
                  model: User,
                  as: 'supervisor',
                  attributes: ['id', 'first_name', 'sur_name']
                }
              ]
            }
          ]
        },
        {
          model: LeaveType,
          as: 'leaveType'
        }
      ]
    });
    
    if (!leaveApplication) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Leave application not found'
      );
    }
    
    // Check permission based on roles and status
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isSupervisor = leaveApplication.user.basicEmployeeData && 
                         leaveApplication.user.basicEmployeeData.supervisor &&
                         leaveApplication.user.basicEmployeeData.supervisor.id === currentUserId;
    
    // Different statuses can only be set by certain roles
    if (status === 'approved by supervisor' && !isAdmin && !isSupervisor) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'Only supervisors can approve at this level'
      );
    }
    
    if ((status === 'approved by hr' || status === 'approved') && !isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'Only HR can approve at this level'
      );
    }
    
    // Check current status to ensure proper flow
    const currentStatus = leaveApplication.approval_status;
    
    if (currentStatus === 'draft') {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Cannot approve/reject a draft application'
      );
    }
    
    if (currentStatus === 'approved' || currentStatus === 'rejected') {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Leave application is already ${currentStatus}`
      );
    }
    
    if (status === 'approved by hr' && currentStatus !== 'approved by supervisor' && !isAdmin) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Application must be approved by supervisor first'
      );
    }
    
    // Start a transaction
    const transaction = await LeaveApplication.sequelize.transaction();
    
    try {
      // Update leave application status
      await leaveApplication.update({
        approval_status: status,
        approver_id: currentUserId,
        comment: comment || leaveApplication.comment
      }, { transaction });
      
      // If approved, update attendance records
      if (status === 'approved') {
        const startDate = new Date(leaveApplication.starting_date);
        const endDate = new Date(leaveApplication.end_date);
        
        // Loop through all days in the leave period
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0];
          
          // Create or update attendance record
          await Attendance.upsert({
            user_id: leaveApplication.user_id,
            date: dateStr,
            status: 'on leave',
            description: `On ${leaveApplication.leaveType.name}`,
            scheduler_status: 'working day', // This should be dynamic based on a work scheduler check
            approval_status: 'approved'
          }, { transaction });
        }
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Send notification email to the employee
      let emailTemplate, emailSubject;
      
      if (status === 'approved') {
        emailTemplate = 'leave-approved';
        emailSubject = 'Leave Application Approved';
      } else if (status === 'rejected') {
        emailTemplate = 'leave-rejected';
        emailSubject = 'Leave Application Rejected';
      } else if (status === 'approved by supervisor') {
        emailTemplate = 'leave-supervisor-approved';
        emailSubject = 'Leave Application Approved by Supervisor';
      } else if (status === 'approved by hr') {
        emailTemplate = 'leave-hr-approved';
        emailSubject = 'Leave Application Approved by HR';
      }
      
      if (emailTemplate) {
        await sendEmail({
          to: leaveApplication.user.email,
          subject: emailSubject,
          template: emailTemplate,
          templateData: {
            employeeName: leaveApplication.user.first_name,
            leaveType: leaveApplication.leaveType.name,
            startDate: formatDate(new Date(leaveApplication.starting_date)),
            endDate: formatDate(new Date(leaveApplication.end_date)),
            approverName: `${req.user.first_name} ${req.user.sur_name}`,
            comment: comment || 'No comments provided'
          }
        });
      }
      
      // Get updated leave application
      const updatedLeave = await LeaveApplication.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
          },
          {
            model: LeaveType,
            as: 'leaveType'
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'first_name', 'sur_name']
          },
          {
            model: Document,
            as: 'attachment',
            attributes: ['id', 'name', 'file_path', 'file_type']
          }
        ]
      });
      
      return successResponse(
        res,
        StatusCodes.OK,
        `Leave application ${status}`,
        updatedLeave
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update leave status error:', error);
    next(error);
  }
};

/**
 * Update leave application details (for draft applications)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      type_id,
      starting_date,
      end_date,
      comment,
      attachment_id,
      submit = false
    } = req.body;
    
    // Find leave application
    const leaveApplication = await LeaveApplication.findOne({
      where: { id },
      include: [
        {
          model: LeaveType,
          as: 'leaveType'
        }
      ]
    });
    
    if (!leaveApplication) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Leave application not found'
      );
    }
    
    // Check if it's the user's own application
    if (leaveApplication.user_id !== req.user.id) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You can only update your own leave applications'
      );
    }
    
    // Check if application is in draft status
    if (leaveApplication.approval_status !== 'draft') {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Can only update draft applications'
      );
    }
    
    // Validate leave type if changed
    let leaveType = leaveApplication.leaveType;
    
    if (type_id && type_id !== leaveApplication.type_id) {
      leaveType = await LeaveType.findByPk(type_id);
      
      if (!leaveType) {
        return errorResponse(
          res,
          StatusCodes.NOT_FOUND,
          'Leave type not found'
        );
      }
    }
    
    // Calculate number of days if dates changed
    let diffDays = null;
    
    if (starting_date && end_date) {
      const start = new Date(starting_date);
      const end = new Date(end_date);
      const diffTime = Math.abs(end - start);
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
      
      // Validate against minimum and maximum days
      if (diffDays < leaveType.minimum_days) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Minimum days for ${leaveType.name} is ${leaveType.minimum_days}`,
          [{ field: 'starting_date', message: `Minimum days required: ${leaveType.minimum_days}` }]
        );
      }
      
      if (diffDays > leaveType.maximum_days) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          `Maximum days for ${leaveType.name} is ${leaveType.maximum_days}`,
          [{ field: 'end_date', message: `Maximum days allowed: ${leaveType.maximum_days}` }]
        );
      }
      
      // Check for overlapping leave applications if dates changed
      const overlappingLeave = await LeaveApplication.findOne({
        where: {
          user_id: req.user.id,
          id: { [Op.ne]: id }, // Exclude current application
          [Op.or]: [
            {
              starting_date: {
                [Op.between]: [starting_date, end_date]
              }
            },
            {
              end_date: {
                [Op.between]: [starting_date, end_date]
              }
            },
            {
              [Op.and]: [
                { starting_date: { [Op.lte]: starting_date } },
                { end_date: { [Op.gte]: end_date } }
              ]
            }
          ],
          approval_status: {
            [Op.notIn]: ['rejected', 'draft']
          }
        }
      });
      
      if (overlappingLeave) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'You already have a leave application for this period',
          [{ field: 'starting_date', message: 'Overlapping leave application exists' }]
        );
      }
    }
    
    // Prepare update object
    const updateData = {};
    
    if (type_id) updateData.type_id = type_id;
    if (starting_date) updateData.starting_date = starting_date;
    if (end_date) updateData.end_date = end_date;
    if (comment !== undefined) updateData.comment = comment;
    if (attachment_id) updateData.attachment_id = attachment_id;
    if (diffDays) updateData.validity_check = `${diffDays} days`;
    if (submit) updateData.approval_status = 'pending';
    
    // Update leave application
    await leaveApplication.update(updateData);
    
    // If submitting the application, send notification to supervisor
    if (submit) {
      // Get employee data to find supervisor
      const employeeData = await BasicEmployeeData.findOne({
        where: { user_id: req.user.id },
        include: [
          {
            model: User,
            as: 'supervisor',
            attributes: ['id', 'email', 'first_name', 'sur_name']
          }
        ]
      });
      
      if (employeeData && employeeData.supervisor) {
        // Send email to supervisor
        await sendEmail({
          to: employeeData.supervisor.email,
          subject: 'Leave Application Requires Approval',
          template: 'leave-request',
          templateData: {
            supervisorName: employeeData.supervisor.first_name,
            employeeName: `${req.user.first_name} ${req.user.sur_name}`,
            leaveType: leaveType.name,
            startDate: formatDate(new Date(starting_date || leaveApplication.starting_date)),
            endDate: formatDate(new Date(end_date || leaveApplication.end_date)),
            days: diffDays || leaveApplication.validity_check.split(' ')[0],
            applicationId: leaveApplication.id
          }
        });
      }
    }
    
    // Get updated leave application
    const updatedLeave = await LeaveApplication.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
        },
        {
          model: LeaveType,
          as: 'leaveType'
        },
        {
          model: Document,
          as: 'attachment',
          attributes: ['id', 'name', 'file_path', 'file_type']
        }
      ]
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      submit ? 'Leave application submitted successfully' : 'Leave application updated successfully',
      updatedLeave
    );
  } catch (error) {
    logger.error('Update leave application error:', error);
    next(error);
  }
};

/**
 * Cancel a leave application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const cancelLeaveApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find leave application
    const leaveApplication = await LeaveApplication.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: LeaveType,
          as: 'leaveType'
        }
      ]
    });
    
    if (!leaveApplication) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Leave application not found'
      );
    }
    
    // Check if it's the user's own application or user is admin
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    
    if (leaveApplication.user_id !== req.user.id && !isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You can only cancel your own leave applications'
      );
    }
      if (leaveApplication.approval_status === 'approved') {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Cannot cancel an approved leave application that has already started'
      );
    }
    
    // Start a transaction
    const transaction = await LeaveApplication.sequelize.transaction();
    
    try {
      // Update leave application status to 'rejected'
      await leaveApplication.update({
        approval_status: 'rejected',
        comment: `Cancelled by ${req.user.id === leaveApplication.user_id ? 'applicant' : 'admin/HR'}: ${req.body.comment || 'No reason provided'}`
      }, { transaction });
      
      // If the leave was already approved, remove attendance records
      if (leaveApplication.approval_status === 'approved') {
        await Attendance.destroy({
          where: {
            user_id: leaveApplication.user_id,
            date: {
              [Op.between]: [leaveApplication.starting_date, leaveApplication.end_date]
            },
            status: 'on leave'
          },
          transaction
        });
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Send notification email to the employee if cancelled by admin/HR
      if (req.user.id !== leaveApplication.user_id) {
        await sendEmail({
          to: leaveApplication.user.email,
          subject: 'Leave Application Cancelled',
          template: 'leave-cancelled',
          templateData: {
            employeeName: leaveApplication.user.first_name,
            leaveType: leaveApplication.leaveType.name,
            startDate: formatDate(new Date(leaveApplication.starting_date)),
            endDate: formatDate(new Date(leaveApplication.end_date)),
            cancelledBy: `${req.user.first_name} ${req.user.sur_name}`,
            reason: req.body.comment || 'No reason provided'
          }
        });
      }
      
      return successResponse(
        res,
        StatusCodes.OK,
        'Leave application cancelled successfully'
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Cancel leave application error:', error);
    next(error);
  }
};

/**
 * Get leave balance for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeaveBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    // Check permission - users can only see their own balance unless admin/HR
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');

    if (targetUserId != req.user.id && !isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You can only view your own leave balance'
      );
    }

    // Get all leave types
    const leaveTypes = await LeaveType.findAll({
      order: [['name', 'ASC']]
    });

    // Calculate used days for each leave type in current year
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    const leaveBalance = {};

    for (const leaveType of leaveTypes) {
      // Get approved leaves for this type in current year
      const usedLeaves = await LeaveApplication.findAll({
        where: {
          user_id: targetUserId,
          type_id: leaveType.id,
          approval_status: 'approved',
          starting_date: {
            [Op.between]: [yearStart, yearEnd]
          }
        }
      });

      // Calculate total used days
      let usedDays = 0;
      usedLeaves.forEach(leave => {
        const validityCheck = leave.validity_check || '0 days';
        const days = parseInt(validityCheck.split(' ')[0]) || 0;
        usedDays += days;
      });

      leaveBalance[leaveType.id] = {
        leave_type: leaveType.name,
        total_allocated: leaveType.maximum_days,
        used: usedDays,
        available: Math.max(0, leaveType.maximum_days - usedDays),
        pending: 0 // You can calculate pending applications if needed
      };
    }

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave balance retrieved successfully',
      leaveBalance
    );
  } catch (error) {
    logger.error('Get leave balance error:', error);
    next(error);
  }
};

module.exports = {
  getAllLeaveTypes,
  createLeaveApplication,
  getAllLeaveApplications,
  getLeaveApplicationById,
  updateLeaveStatus,
  updateLeaveApplication,
  cancelLeaveApplication,
  getLeaveBalance
};