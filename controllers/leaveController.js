// controllers/leaveController.js - Complete Enhanced Leave Controller

const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const {
  LeaveApplication,
  LeaveType,
  User,
  BasicEmployeeData,
  Document
} = require('../models');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Get all leave applications with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllLeaveApplications = async (req, res, next) => {
  try {
    const {
      status,
      type_id,
      user_id,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    // Build where conditions
    const whereConditions = {};

    // Filter by status
    if (status) {
      if (status.includes(',')) {
        whereConditions.approval_status = { [Op.in]: status.split(',') };
      } else {
        whereConditions.approval_status = status;
      }
    }

    // Filter by leave type
    if (type_id) {
      whereConditions.type_id = type_id;
    }

    // Filter by user (for managers)
    if (user_id) {
      whereConditions.user_id = user_id;
    }

    // Filter by date range
    if (start_date && end_date) {
      whereConditions[Op.or] = [
        {
          starting_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        {
          end_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        {
          [Op.and]: [
            { starting_date: { [Op.lte]: start_date } },
            { end_date: { [Op.gte]: end_date } }
          ]
        }
      ];
    }

    // Role-based filtering
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isDepartmentHead = req.user.roles && req.user.roles.includes('Department Head');

    // If not admin or HR, only show own applications and those they can approve
    if (!isAdmin && !isHR) {
      if (isDepartmentHead) {
        // Department heads can see their team's applications
        // This would need department/team logic - for now, show own applications
        whereConditions.user_id = req.user.id;
      } else {
        // Regular employees can only see their own applications
        whereConditions.user_id = req.user.id;
      }
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch leave applications
    const { count, rows: leaveApplications } = await LeaveApplication.findAndCountAll({
      where: whereConditions,
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
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave applications retrieved successfully',
      {
        applications: leaveApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
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

    // Check access permission
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
 * Find the appropriate supervisor for a user
 * @param {number} userId - User ID
 * @returns {Object} - Supervisor information
 */
const findUserSupervisor = async (userId) => {
  try {
    // Get user with department information
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Department,
          as: 'department',
          include: [
            {
              model: User,
              as: 'head', // Department head
              attributes: ['id', 'first_name', 'sur_name', 'email'],
              include: [
                {
                  model: Role,
                  as: 'roles',
                  attributes: ['name']
                }
              ]
            }
          ]
        },
        {
          model: BasicEmployeeData,
          as: 'basicEmployeeData',
          include: [
            {
              model: User,
              as: 'supervisor',
              attributes: ['id', 'first_name', 'sur_name', 'email']
            }
          ]
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['name']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check user's role to determine approval hierarchy
    const userRoles = user.roles.map(role => role.name);

    // If user is Admin, no supervisor needed (can't apply for leave to themselves)
    if (userRoles.includes('Admin')) {
      return {
        supervisor: null,
        reason: 'Admin users require HR Manager approval'
      };
    }

    // If user is HR Manager, Admin should approve
    if (userRoles.includes('HR Manager')) {
      const admin = await User.findOne({
        include: [
          {
            model: Role,
            as: 'roles',
            where: { name: 'Admin' }
          }
        ]
      });
      return {
        supervisor: admin,
        reason: 'HR Manager requires Admin approval'
      };
    }

    // If user is Department Head, HR Manager should approve
    if (userRoles.includes('Department Head')) {
      const hrManager = await User.findOne({
        include: [
          {
            model: Role,
            as: 'roles',
            where: { name: 'HR Manager' }
          }
        ]
      });
      return {
        supervisor: hrManager,
        reason: 'Department Head requires HR Manager approval'
      };
    }

    // For regular employees, check department head first
    if (user.department && user.department.head) {
      return {
        supervisor: user.department.head,
        reason: 'Department head approval'
      };
    }

    // Fallback: Check manually assigned supervisor in BasicEmployeeData
    if (user.basicEmployeeData && user.basicEmployeeData.supervisor) {
      return {
        supervisor: user.basicEmployeeData.supervisor,
        reason: 'Manually assigned supervisor'
      };
    }

    // Final fallback: Find HR Manager
    const hrManager = await User.findOne({
      include: [
        {
          model: Role,
          as: 'roles',
          where: { name: 'HR Manager' }
        }
      ]
    });

    return {
      supervisor: hrManager,
      reason: 'No department head found, defaulting to HR Manager'
    };

  } catch (error) {
    logger.error('Find supervisor error:', error);
    throw new Error('Could not determine supervisor');
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
      save_as_draft = false,
      submit = true
    } = req.body;

    // Validate leave type
    const leaveType = await LeaveType.findByPk(type_id);
    if (!leaveType) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Invalid leave type',
        [{ field: 'type_id', message: 'Leave type not found' }]
      );
    }

    // Validate date range
    const startDate = new Date(starting_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'starting_date', message: 'Start date cannot be in the past' }]
      );
    }

    if (endDate < startDate) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'end_date', message: 'End date must be after start date' }]
      );
    }

    // Calculate leave days
    const diffTime = Math.abs(endDate - startDate);
    const leaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Validate leave duration
    if (leaveDays < leaveType.minimum_days) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'duration', message: `Minimum ${leaveType.minimum_days} day(s) required for ${leaveType.name}` }]
      );
    }

    if (leaveDays > leaveType.maximum_days) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'duration', message: `Maximum ${leaveType.maximum_days} day(s) allowed for ${leaveType.name}` }]
      );
    }

    // Check for sick leave attachment requirement
    if (leaveType.name.toLowerCase().includes('sick') && !attachment_id) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'attachment', message: 'Supporting document is required for sick leave' }]
      );
    }

    // Check for overlapping leave applications
    const overlappingLeave = await LeaveApplication.findOne({
      where: {
        user_id: req.user.id,
        approval_status: {
          [Op.notIn]: ['rejected', 'cancelled', 'draft']
        },
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
        ]
      }
    });

    if (overlappingLeave) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'Overlapping leave application exists',
        [{ field: 'date_range', message: 'You already have a leave application for this period' }]
      );
    }

    // Determine approval status and supervisor
    let approvalStatus = 'draft';
    let approverId = null;

    if (submit && !save_as_draft) {
      // Find appropriate supervisor
      const supervisorInfo = await findUserSupervisor(req.user.id);

      if (supervisorInfo.supervisor) {
        approverId = supervisorInfo.supervisor.id;
        approvalStatus = 'pending';

        logger.info(`Auto-assigned supervisor for user ${req.user.id}: ${supervisorInfo.supervisor.id} (${supervisorInfo.reason})`);
      } else {
        logger.warn(`No supervisor found for user ${req.user.id}: ${supervisorInfo.reason}`);
        approvalStatus = 'pending'; // Will be handled by admin manually
      }
    }

    // Create leave application
    const leaveApplication = await LeaveApplication.create({
      user_id: req.user.id,
      type_id: parseInt(type_id),
      starting_date,
      end_date,
      comment: comment || null,
      attachment_id: attachment_id || null,
      approval_status: approvalStatus,
      approver_id: approverId, // Auto-assigned supervisor
      days_requested: leaveDays
    });

    // Fetch the created leave with all relations
    const createdLeave = await LeaveApplication.findOne({
      where: { id: leaveApplication.id },
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
          attributes: ['id', 'first_name', 'sur_name', 'email']
        },
        {
          model: Document,
          as: 'attachment',
          attributes: ['id', 'name', 'file_path', 'file_type']
        }
      ]
    });

    logger.info(`Leave application created by user ${req.user.id}: ${leaveApplication.id}${approverId ? ` (assigned to supervisor ${approverId})` : ''}`);

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
 * Create a new leave type
 */
const createLeaveType = async (req, res, next) => {
  try {
    const { name, minimum_days, maximum_days, description } = req.body;

    const leaveType = await LeaveType.create({
      name,
      minimum_days: minimum_days || 1,
      maximum_days,
      description
    });

    return successResponse(
      res,
      StatusCodes.CREATED,
      'Leave type created successfully',
      leaveType
    );
  } catch (error) {
    logger.error('Create leave type error:', error);
    next(error);
  }
};

/**
 * Get leave applications for approval (only for assigned approvers)
 */
const getLeaveApplicationsForApproval = async (req, res, next) => {
  try {
    const {
      status = 'pending,approved by supervisor',
      type_id,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    // Build where conditions for applications pending approval
    const whereConditions = {
      approval_status: {
        [Op.in]: status.split(',')
      }
    };

    // Filter by leave type
    if (type_id) {
      whereConditions.type_id = type_id;
    }

    // Filter by date range
    if (start_date && end_date) {
      whereConditions.starting_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Role-based filtering for approvals
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('Admin');
    const isHR = userRoles.includes('HR Manager');
    const isDepartmentHead = userRoles.includes('Department Head');

    // Filter applications based on user's approval authority
    if (isAdmin) {
      // Admin can see all applications
      // No additional filtering needed
    } else if (isHR) {
      // HR can see applications from department heads and escalated cases
      whereConditions[Op.or] = [
        { approver_id: req.user.id }, // Directly assigned to HR
        { approval_status: 'approved by supervisor' }, // Escalated from department heads
      ];
    } else if (isDepartmentHead) {
      // Department heads only see applications assigned to them
      whereConditions.approver_id = req.user.id;
    } else {
      // Regular employees cannot approve leaves
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to view leave approvals'
      );
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch leave applications for approval
    const { count, rows: leaveApplications } = await LeaveApplication.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name']
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
      ],
      order: [['created_at', 'ASC']], // Oldest first for approval queue
      limit: parseInt(limit),
      offset: offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave applications for approval retrieved successfully',
      {
        applications: leaveApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    );
  } catch (error) {
    logger.error('Get leave applications for approval error:', error);
    next(error);
  }
};

/**
 * Update leave application (for draft applications)
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
    if (type_id && parseInt(type_id) !== leaveApplication.type_id) {
      leaveType = await LeaveType.findByPk(type_id);
      if (!leaveType) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Invalid leave type',
          [{ field: 'type_id', message: 'Leave type not found' }]
        );
      }
    }

    // Validate dates if provided
    let startDate = new Date(leaveApplication.starting_date);
    let endDate = new Date(leaveApplication.end_date);

    if (starting_date) {
      startDate = new Date(starting_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Validation Error',
          [{ field: 'starting_date', message: 'Start date cannot be in the past' }]
        );
      }
    }

    if (end_date) {
      endDate = new Date(end_date);
    }

    if (endDate < startDate) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'end_date', message: 'End date must be after start date' }]
      );
    }

    // Calculate leave days
    const diffTime = Math.abs(endDate - startDate);
    const leaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Validate leave duration against leave type limits
    if (leaveDays < leaveType.minimum_days) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'duration', message: `Minimum ${leaveType.minimum_days} day(s) required for ${leaveType.name}` }]
      );
    }

    if (leaveDays > leaveType.maximum_days) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'duration', message: `Maximum ${leaveType.maximum_days} day(s) allowed for ${leaveType.name}` }]
      );
    }

    // Check for sick leave attachment requirement
    const finalAttachmentId = attachment_id !== undefined ? attachment_id : leaveApplication.attachment_id;
    if (leaveType.name.toLowerCase().includes('sick') && !finalAttachmentId) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Validation Error',
        [{ field: 'attachment', message: 'Supporting document is required for sick leave' }]
      );
    }

    // Check for overlapping leave applications (excluding current one)
    const overlappingLeave = await LeaveApplication.findOne({
      where: {
        id: { [Op.ne]: id },
        user_id: req.user.id,
        approval_status: {
          [Op.notIn]: ['rejected', 'cancelled', 'draft']
        },
        [Op.or]: [
          {
            starting_date: {
              [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            }
          },
          {
            end_date: {
              [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            }
          },
          {
            [Op.and]: [
              { starting_date: { [Op.lte]: startDate.toISOString().split('T')[0] } },
              { end_date: { [Op.gte]: endDate.toISOString().split('T')[0] } }
            ]
          }
        ]
      }
    });

    if (overlappingLeave) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'Overlapping leave application exists',
        [{ field: 'date_range', message: 'You already have a leave application for this period' }]
      );
    }

    // Prepare update data
    const updateData = {
      days_requested: leaveDays
    };

    if (type_id !== undefined) updateData.type_id = parseInt(type_id);
    if (starting_date !== undefined) updateData.starting_date = starting_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (comment !== undefined) updateData.comment = comment;
    if (attachment_id !== undefined) updateData.attachment_id = attachment_id;

    // Update approval status if submitting
    if (submit) {
      updateData.approval_status = 'pending';
    }

    // Update leave application
    await leaveApplication.update(updateData);

    // Fetch the updated leave with all relations
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

    logger.info(`Leave application ${id} updated by user ${req.user.id}`);

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
 * Delete a leave application (only for draft status)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteLeaveApplication = async (req, res, next) => {
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
        },
        {
          model: Document,
          as: 'attachment',
          attributes: ['id', 'name', 'file_path']
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

    // Check if it's the user's own application or user is admin/HR
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');

    if (leaveApplication.user_id !== req.user.id && !isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You can only delete your own leave applications'
      );
    }

    // Only allow deletion of draft applications
    if (leaveApplication.approval_status !== 'draft') {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Only draft applications can be deleted. Use cancel for submitted applications.'
      );
    }

    // Start a transaction
    const transaction = await LeaveApplication.sequelize.transaction();

    try {
      // If there's an attachment, optionally delete it
      if (leaveApplication.attachment) {
        // Delete document record (keep file for audit purposes)
        await Document.destroy({
          where: { id: leaveApplication.attachment.id },
          transaction
        });
      }

      // Delete the leave application
      await leaveApplication.destroy({ transaction });

      // Commit transaction
      await transaction.commit();

      logger.info(`Leave application ${id} deleted by user ${req.user.id}`);

      return successResponse(
        res,
        StatusCodes.OK,
        'Leave application deleted successfully',
        {
          id: parseInt(id),
          deleted_at: new Date().toISOString()
        }
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Delete leave application error:', error);
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
    const { comment } = req.body;

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

    // Check permissions
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');

    if (leaveApplication.user_id !== req.user.id && !isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You can only cancel your own leave applications'
      );
    }

    // Check if the application can be cancelled
    const cancellableStatuses = ['pending', 'approved by supervisor', 'approved by hr'];
    if (!cancellableStatuses.includes(leaveApplication.approval_status)) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Cannot cancel a leave application with status: ${leaveApplication.approval_status}`
      );
    }

    // Start a transaction
    const transaction = await LeaveApplication.sequelize.transaction();

    try {
      // Update leave application status to 'rejected' instead of 'cancelled'
      // Use 'rejected' since it's likely already in your ENUM
      await leaveApplication.update({
        approval_status: 'rejected', // Use existing status instead of 'cancelled'
        approver_id: req.user.id,
        comment: comment || `Cancelled by ${req.user.id === leaveApplication.user_id ? 'employee' : 'management'}`
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      logger.info(`Leave application ${id} cancelled by user ${req.user.id}`);

      // Fetch the updated leave with all relations
      const finalLeave = await LeaveApplication.findOne({
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
        'Leave application cancelled successfully',
        finalLeave
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
              model: Department,
              as: 'department'
            },
            {
              model: Role,
              as: 'roles'
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

    // User cannot approve their own leave
    if (leaveApplication.user_id === currentUserId) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You cannot approve your own leave application'
      );
    }

    // Check if application is in a state that can be updated
    const updatableStatuses = ['pending', 'approved by supervisor', 'approved by hr'];
    if (!updatableStatuses.includes(leaveApplication.approval_status)) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        `Cannot update leave application with status: ${leaveApplication.approval_status}`
      );
    }

    // Role-based approval logic
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('Admin');
    const isHR = userRoles.includes('HR Manager');
    const isDepartmentHead = userRoles.includes('Department Head');

    // Determine if user can approve this application
    let canApprove = false;
    let nextStatus = status;
    let nextApproverId = null;

    if (isAdmin) {
      // Admin can approve anything
      canApprove = true;
      nextStatus = status === 'rejected' ? 'rejected' : 'approved';
    } else if (isHR) {
      // HR can approve department head applications or escalated ones
      if (leaveApplication.approval_status === 'approved by supervisor' ||
        leaveApplication.approver_id === currentUserId) {
        canApprove = true;
        if (status === 'rejected') {
          nextStatus = 'rejected';
        } else {
          // For certain leave types, HR approval might be final
          nextStatus = 'approved';
        }
      }
    } else if (isDepartmentHead) {
      // Department head can approve if they are the assigned approver
      if (leaveApplication.approver_id === currentUserId) {
        canApprove = true;
        if (status === 'rejected') {
          nextStatus = 'rejected';
        } else {
          // Check if this needs HR approval next
          const applicantRoles = leaveApplication.user.roles.map(r => r.name);
          if (applicantRoles.includes('Department Head') ||
            leaveApplication.leaveType.name.toLowerCase().includes('maternity') ||
            leaveApplication.leaveType.name.toLowerCase().includes('paternity')) {
            // Escalate to HR
            nextStatus = 'approved by supervisor';
            const hrManager = await User.findOne({
              include: [{ model: Role, as: 'roles', where: { name: 'HR Manager' } }]
            });
            nextApproverId = hrManager ? hrManager.id : null;
          } else {
            nextStatus = 'approved';
          }
        }
      }
    }

    if (!canApprove) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to approve this leave application'
      );
    }

    // Start transaction
    const transaction = await LeaveApplication.sequelize.transaction();

    try {
      // Update leave application
      await leaveApplication.update({
        approval_status: nextStatus,
        approver_id: nextApproverId || currentUserId,
        comment: comment || `${nextStatus} by ${req.user.first_name} ${req.user.sur_name}`
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      logger.info(`Leave application ${id} status updated to ${nextStatus} by user ${currentUserId}`);

      // Fetch updated leave with all relations
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
        `Leave application ${nextStatus}`,
        updatedLeave
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update leave status error:', error);
    next(error);
  }
};


/**
 * Get all leave types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.findAll({
      where: {
        // Add any filters here if needed, e.g., active status
        // is_active: true
      },
      order: [['name', 'ASC']]
    });

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave types retrieved successfully',
      leaveTypes
    );
  } catch (error) {
    logger.error('Get leave types error:', error);
    next(error);
  }
};

/**
 * Get leave balance for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeaveBalance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    // Check permission to view balance
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isOwnBalance = targetUserId == req.user.id;

    if (!isAdmin && !isHR && !isOwnBalance) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You can only view your own leave balance'
      );
    }

    // Get leave types
    const leaveTypes = await LeaveType.findAll();

    // Calculate balance for each leave type
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const balancePromises = leaveTypes.map(async (leaveType) => {
      // Get approved leaves for this type in current year
      const approvedLeaves = await LeaveApplication.findAll({
        where: {
          user_id: targetUserId,
          type_id: leaveType.id,
          approval_status: 'approved',
          starting_date: {
            [Op.between]: [yearStart, yearEnd]
          }
        }
      });

      // Calculate total days used
      const usedDays = approvedLeaves.reduce((total, leave) => {
        return total + (leave.days_requested || 0);
      }, 0);

      // Calculate remaining days (assuming annual allocation equals maximum_days)
      const allocatedDays = leaveType.maximum_days;
      const remainingDays = Math.max(0, allocatedDays - usedDays);

      return {
        leaveType: leaveType.name,
        allocated: allocatedDays,
        used: usedDays,
        remaining: remainingDays
      };
    });

    const balances = await Promise.all(balancePromises);

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave balance retrieved successfully',
      {
        year: currentYear,
        balances
      }
    );
  } catch (error) {
    logger.error('Get leave balance error:', error);
    next(error);
  }
};

/**
 * Get leave statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeaveStatistics = async (req, res, next) => {
  try {
    // Check permission
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');

    if (!isAdmin && !isHR) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'You do not have permission to view leave statistics'
      );
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get total applications
    const totalApplications = await LeaveApplication.count({
      where: {
        created_at: {
          [Op.between]: [yearStart, yearEnd]
        }
      }
    });

    // Get applications by status
    const statusStats = await LeaveApplication.findAll({
      attributes: [
        'approval_status',
        [LeaveApplication.sequelize.fn('COUNT', LeaveApplication.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.between]: [yearStart, yearEnd]
        }
      },
      group: ['approval_status']
    });

    // Get applications by leave type
    const typeStats = await LeaveApplication.findAll({
      attributes: [
        [LeaveApplication.sequelize.fn('COUNT', LeaveApplication.sequelize.col('LeaveApplication.id')), 'count']
      ],
      include: [
        {
          model: LeaveType,
          as: 'leaveType',
          attributes: ['name']
        }
      ],
      where: {
        created_at: {
          [Op.between]: [yearStart, yearEnd]
        }
      },
      group: ['leaveType.id', 'leaveType.name']
    });

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave statistics retrieved successfully',
      {
        year: currentYear,
        totalApplications,
        byStatus: statusStats.map(stat => ({
          status: stat.approval_status,
          count: parseInt(stat.dataValues.count)
        })),
        byType: typeStats.map(stat => ({
          type: stat.leaveType.name,
          count: parseInt(stat.dataValues.count)
        }))
      }
    );
  } catch (error) {
    logger.error('Get leave statistics error:', error);
    next(error);
  }
};

// Add these functions to your existing leaveController.js

/**
 * Calculate leave balance for a user and leave type
 */
const calculateLeaveBalance = async (userId, leaveTypeId, year = new Date().getFullYear()) => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  // Get leave type allocation
  const leaveType = await LeaveType.findByPk(leaveTypeId);
  if (!leaveType) {
    throw new Error('Leave type not found');
  }

  const annualAllocation = leaveType.maximum_days;

  // Calculate used days (including pending applications)
  const usedDays = await LeaveApplication.sum('days_requested', {
    where: {
      user_id: userId,
      type_id: leaveTypeId,
      approval_status: {
        [Op.in]: ['approved', 'pending', 'approved by supervisor', 'approved by hr']
      },
      starting_date: { [Op.between]: [yearStart, yearEnd] }
    }
  }) || 0;

  return {
    leaveTypeId: leaveTypeId,
    leaveTypeName: leaveType.name,
    year: year,
    allocated: annualAllocation,
    used: usedDays,
    remaining: Math.max(0, annualAllocation - usedDays)
  };
};

/**
 * Get leave balance for user (all leave types)
 * GET /api/v1/leaves/balance/:userId?
 */
const getLeaveBalances = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Check permission to view balance
    const isAdmin = req.user.roles && req.user.roles.includes('Admin');
    const isHR = req.user.roles && req.user.roles.includes('HR Manager');
    const isOwnBalance = targetUserId == req.user.id;

    if (!isAdmin && !isHR && !isOwnBalance) {
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

    // Calculate balance for each leave type
    const balancePromises = leaveTypes.map(leaveType =>
      calculateLeaveBalance(targetUserId, leaveType.id, targetYear)
    );

    const balances = await Promise.all(balancePromises);

    // Get user info
    const user = await User.findByPk(targetUserId, {
      attributes: ['id', 'first_name', 'sur_name', 'email']
    });

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave balance retrieved successfully',
      {
        user: user,
        year: targetYear,
        balances: balances,
        totalAllocated: balances.reduce((sum, b) => sum + b.allocated, 0),
        totalUsed: balances.reduce((sum, b) => sum + b.used, 0),
        totalRemaining: balances.reduce((sum, b) => sum + b.remaining, 0)
      }
    );
  } catch (error) {
    logger.error('Get leave balance error:', error);
    next(error);
  }
};

/**
 * Check leave balance before application
 * POST /api/v1/leaves/check-balance
 */
const checkLeaveBalance = async (req, res, next) => {
  try {
    const { type_id, starting_date, end_date, exclude_application_id } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!type_id || !starting_date || !end_date) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Missing required fields',
        [{ field: 'type_id, starting_date, end_date', message: 'All fields are required' }]
      );
    }

    // Calculate requested days
    const startDate = new Date(starting_date);
    const endDate = new Date(end_date);
    const requestedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Get current balance
    const currentYear = startDate.getFullYear();
    const balance = await calculateLeaveBalance(userId, type_id, currentYear);

    // If excluding an application (for updates), subtract its days from used
    let adjustedUsed = balance.used;
    if (exclude_application_id) {
      const existingApp = await LeaveApplication.findOne({
        where: {
          id: exclude_application_id,
          user_id: userId
        }
      });
      if (existingApp) {
        adjustedUsed = Math.max(0, balance.used - (existingApp.days_requested || 0));
      }
    }

    const adjustedRemaining = balance.allocated - adjustedUsed;
    const isValid = requestedDays <= adjustedRemaining;

    return successResponse(
      res,
      StatusCodes.OK,
      isValid ? 'Leave balance check passed' : 'Insufficient leave balance',
      {
        isValid: isValid,
        requestedDays: requestedDays,
        balance: {
          ...balance,
          used: adjustedUsed,
          remaining: adjustedRemaining
        },
        message: isValid
          ? `You can apply for ${requestedDays} days`
          : `You only have ${adjustedRemaining} days remaining for ${balance.leaveTypeName}`
      }
    );
  } catch (error) {
    logger.error('Check leave balance error:', error);
    next(error);
  }
};

// Update the existing createLeaveApplication function to include balance validation
// Add this validation before creating the application:

const validateLeaveBalance = async (userId, typeId, requestedDays, year) => {
  const balance = await calculateLeaveBalance(userId, typeId, year);

  if (requestedDays > balance.remaining) {
    throw new Error(
      `Insufficient leave balance. You have ${balance.remaining} days remaining for ${balance.leaveTypeName}`
    );
  }

  return balance;
};

/**
 * Update leave type
 */
const updateLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, minimum_days, maximum_days, description } = req.body;

    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Leave type not found');
    }

    await leaveType.update({
      name,
      minimum_days,
      maximum_days,
      description
    });

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave type updated successfully',
      leaveType
    );
  } catch (error) {
    logger.error('Update leave type error:', error);
    next(error);
  }
};

/**
* Delete leave type
*/
const deleteLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Leave type not found');
    }

    await leaveType.destroy();

    return successResponse(
      res,
      StatusCodes.OK,
      'Leave type deleted successfully'
    );
  } catch (error) {
    logger.error('Delete leave type error:', error);
    next(error);
  }
};

// Add to createLeaveApplication function (after calculating leaveDays):
/*
// Validate leave balance
try {
  await validateLeaveBalance(req.user.id, type_id, leaveDays, startDate.getFullYear());
} catch (balanceError) {
  return errorResponse(
    res,
    StatusCodes.BAD_REQUEST,
    'Insufficient Leave Balance',
    [{ field: 'balance', message: balanceError.message }]
  );
}
*/

// Add to updateLeaveApplication function (after calculating leaveDays):
/*
// Validate leave balance (excluding current application)
try {
  const currentBalance = await calculateLeaveBalance(req.user.id, updateData.type_id || leaveApplication.type_id, startDate.getFullYear());
  const currentAppDays = leaveApplication.days_requested || 0;
  const availableDays = currentBalance.remaining + currentAppDays;
  
  if (leaveDays > availableDays) {
    return errorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'Insufficient Leave Balance',
      [{ field: 'balance', message: `You only have ${availableDays} days available for ${currentBalance.leaveTypeName}` }]
    );
  }
} catch (balanceError) {
  return errorResponse(
    res,
    StatusCodes.BAD_REQUEST,
    'Balance Validation Error',
    [{ field: 'balance', message: balanceError.message }]
  );
}
*/

module.exports = {
  getAllLeaveApplications,
  getLeaveApplicationById,
  createLeaveApplication,
  updateLeaveApplication,
  deleteLeaveApplication,
  cancelLeaveApplication,
  updateLeaveStatus,
  getLeaveTypes,
  getLeaveBalance,
  getLeaveStatistics,
  getLeaveBalances,
  checkLeaveBalance,
  calculateLeaveBalance,
  validateLeaveBalance,
  getLeaveApplicationsForApproval,
  findUserSupervisor,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
};