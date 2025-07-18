const { StatusCodes } = require('http-status-codes');
const { Op, Sequelize } = require('sequelize');

const Attendance = require('../models/Attendance');
const User = require('../models/User');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const Department = require('../models/Department');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Get monthly timesheet (aggregated attendance data)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getTimesheet = async (req, res, next) => {
    try {
        const { year, month, user_id } = req.query;
        const requestingUserId = req.user.id;
        const userRoles = req.user.roles || [];

        // Build where conditions
        const whereConditions = {};

        // Determine which user's timesheet to fetch
        let targetUserId;
        if (user_id) {
            // Check permissions to view other user's timesheet
            const isAdmin = userRoles.includes('Admin');
            const isHR = userRoles.includes('HR Manager');
            const isDepartmentHead = userRoles.includes('Department Head');

            if (!isAdmin && !isHR && !isDepartmentHead && parseInt(user_id) !== requestingUserId) {
                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    'You do not have permission to view this timesheet'
                );
            }
            targetUserId = parseInt(user_id);
        } else {
            targetUserId = requestingUserId;
        }

        whereConditions.user_id = targetUserId;

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

        // Get attendance records (these ARE the timesheet entries)
        const attendanceRecords = await Attendance.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    as: 'user', // Adjust based on your model associations
                    attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
                }
            ],
            order: [['date', 'ASC']]
        });

        if (attendanceRecords.length === 0) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'No timesheet data found for the specified period'
            );
        }

        // Calculate summary statistics
        const summary = {
            total_entries: attendanceRecords.length,
            present_days: attendanceRecords.filter(record => record.status === 'present').length,
            half_days: attendanceRecords.filter(record => record.status === 'half day').length,
            absent_days: attendanceRecords.filter(record => record.status === 'absent').length,
            leave_days: attendanceRecords.filter(record => record.status === 'on leave').length,
            working_days: attendanceRecords.filter(record =>
                record.scheduler_status === 'working day' ||
                record.scheduler_status === 'holiday in working day'
            ).length,
            // Calculate total working hours
            total_hours: attendanceRecords.reduce((total, record) => {
                if (record.arrival_time && record.departure_time) {
                    const arrival = new Date(record.arrival_time);
                    const departure = new Date(record.departure_time);
                    const hours = (departure - arrival) / (1000 * 60 * 60);
                    return total + Math.max(0, hours);
                }
                return total;
            }, 0).toFixed(2)
        };

        // Determine timesheet status based on attendance approval status
        let timesheetStatus = 'draft';
        const allApproved = attendanceRecords.every(record => record.approval_status === 'approved');
        const anyRejected = attendanceRecords.some(record => record.approval_status === 'rejected');

        if (allApproved && attendanceRecords.length > 0) {
            timesheetStatus = 'approved';
        } else if (anyRejected) {
            timesheetStatus = 'rejected';
        } else if (attendanceRecords.some(record => record.approval_status === 'approved')) {
            timesheetStatus = 'submitted'; // Partially approved
        }

        return successResponse(
            res,
            StatusCodes.OK,
            'Timesheet retrieved successfully',
            {
                month: month ? parseInt(month) : null,
                year: year ? parseInt(year) : null,
                user_id: targetUserId,
                status: timesheetStatus,
                summary,
                entries: attendanceRecords
            }
        );
    } catch (error) {
        logger.error('Get timesheet error:', error);
        next(error);
    }
};

/**
 * Update timesheet entries (bulk update attendance records)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateTimesheet = async (req, res, next) => {
    try {
        const { timesheet_entries = [] } = req.body;
        const requestingUserId = req.user.id;
        const userRoles = req.user.roles || [];

        if (timesheet_entries.length === 0) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'No timesheet entries provided'
            );
        }

        const updatePromises = timesheet_entries.map(async (entry) => {
            // Find the attendance record
            const attendanceRecord = await Attendance.findOne({
                where: {
                    user_id: entry.user_id || requestingUserId,
                    date: entry.date
                }
            });

            if (!attendanceRecord) {
                throw new Error(`Attendance record not found for date: ${entry.date}`);
            }

            // Check permissions
            const isAdmin = userRoles.includes('Admin');
            const isHR = userRoles.includes('HR Manager');
            const isOwner = attendanceRecord.user_id === requestingUserId;

            if (!isAdmin && !isHR && !isOwner) {
                throw new Error(`You do not have permission to update attendance for date: ${entry.date}`);
            }

            // Update the attendance record
            const updateData = {};
            if (entry.activity !== undefined) updateData.activity = entry.activity;
            if (entry.description !== undefined) updateData.description = entry.description;
            if (entry.status !== undefined) updateData.status = entry.status;

            await attendanceRecord.update(updateData);
            return attendanceRecord;
        });

        const updatedRecords = await Promise.all(updatePromises);

        return successResponse(
            res,
            StatusCodes.OK,
            'Timesheet updated successfully',
            {
                updated_entries: updatedRecords.length,
                entries: updatedRecords
            }
        );
    } catch (error) {
        logger.error('Update timesheet error:', error);
        if (error.message.includes('not found') || error.message.includes('permission')) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, error.message);
        }
        next(error);
    }
};

/**
 * Submit timesheet for approval (bulk update approval status)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const submitTimesheet = async (req, res, next) => {
    try {
        const { month, year, user_id } = req.body;
        const requestingUserId = req.user.id;
        const targetUserId = user_id || requestingUserId;

        // Check permissions
        if (targetUserId !== requestingUserId) {
            const userRoles = req.user.roles || [];
            const isAdmin = userRoles.includes('Admin');
            const isHR = userRoles.includes('HR Manager');

            if (!isAdmin && !isHR) {
                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    'You can only submit your own timesheets'
                );
            }
        }

        // Build date range
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        // Update all attendance records for the month to 'submitted' status
        const [updatedCount] = await Attendance.update(
            { approval_status: 'approved' }, // Changed from submitted to approved as per your enum
            {
                where: {
                    user_id: targetUserId,
                    date: {
                        [Op.between]: [
                            startDate.toISOString().split('T')[0],
                            endDate.toISOString().split('T')[0]
                        ]
                    },
                    approval_status: 'draft' // Only update draft records
                }
            }
        );

        if (updatedCount === 0) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'No draft attendance records found for the specified month'
            );
        }

        return successResponse(
            res,
            StatusCodes.OK,
            'Timesheet submitted successfully',
            {
                month,
                year,
                user_id: targetUserId,
                updated_records: updatedCount
            }
        );
    } catch (error) {
        logger.error('Submit timesheet error:', error);
        next(error);
    }
};

/**
 * Get team timesheets (for supervisors)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getTeamTimesheets = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            month,
            year,
            department_id,
        } = req.query;

        const requestingUserId = req.user.id;
        const userRoles = req.user.roles || [];
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Check permissions
        const isAdmin = userRoles.includes('Admin');
        const isHR = userRoles.includes('HR Manager');
        const isDepartmentHead = userRoles.includes('Department Head');

        if (!isAdmin && !isHR && !isDepartmentHead) {
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                'You do not have permission to view team timesheets'
            );
        }

        // Build where conditions
        const whereConditions = {};

        if (status) whereConditions.approval_status = status;

        // Filter by month and year if provided
        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0);

            whereConditions.date = {
                [Op.between]: [
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                ]
            };
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year), 11, 31);

            whereConditions.date = {
                [Op.between]: [
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                ]
            };
        }

        let includeConditions = [
            {
                model: User,
                as: 'user', // Adjust based on your associations
                attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email'],
                include: [
                    {
                        model: BasicEmployeeData,
                        as: 'basicEmployeeData',
                        include: [
                            {
                                model: Department,
                                as: 'department',
                                attributes: ['id', 'department_name'],
                            }
                        ]
                    }
                ]
            }
        ];

        // If department head, only show timesheets from their department
        if (isDepartmentHead && !isAdmin && !isHR) {
            const userEmployee = await BasicEmployeeData.findOne({
                where: { user_id: requestingUserId },
            });

            if (userEmployee) {
                includeConditions[0].include[0].where = {
                    department_id: userEmployee.department_id,
                };
            }
        }

        // If department_id is specified and user has permission
        if (department_id && (isAdmin || isHR)) {
            includeConditions[0].include[0].where = {
                department_id: parseInt(department_id),
            };
        }

        // Get attendance records grouped by user and month
        const attendanceRecords = await Attendance.findAll({
            where: whereConditions,
            include: includeConditions,
            order: [['date', 'DESC']],
            limit: parseInt(limit),
            offset,
        });

        // Group by user and month for timesheet view
        const timesheetGroups = {};
        attendanceRecords.forEach(record => {
            const date = new Date(record.date);
            const key = `${record.user_id}-${date.getFullYear()}-${date.getMonth() + 1}`;

            if (!timesheetGroups[key]) {
                timesheetGroups[key] = {
                    user: record.user,
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    entries: [],
                    summary: {
                        total_entries: 0,
                        present_days: 0,
                        approved_entries: 0,
                        draft_entries: 0,
                        rejected_entries: 0
                    }
                };
            }

            timesheetGroups[key].entries.push(record);
            timesheetGroups[key].summary.total_entries++;

            if (record.status === 'present') timesheetGroups[key].summary.present_days++;
            if (record.approval_status === 'approved') timesheetGroups[key].summary.approved_entries++;
            if (record.approval_status === 'draft') timesheetGroups[key].summary.draft_entries++;
            if (record.approval_status === 'rejected') timesheetGroups[key].summary.rejected_entries++;
        });

        const timesheets = Object.values(timesheetGroups);

        return paginatedResponse(
            res,
            StatusCodes.OK,
            'Team timesheets retrieved successfully',
            timesheets,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems: timesheets.length,
                totalPages: Math.ceil(timesheets.length / parseInt(limit)),
                hasNextPage: parseInt(page) < Math.ceil(timesheets.length / parseInt(limit)),
                hasPrevPage: parseInt(page) > 1,
            }
        );
    } catch (error) {
        logger.error('Get team timesheets error:', error);
        next(error);
    }
};

/**
 * Get user's timesheets (monthly summaries)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMyTimesheets = async (req, res, next) => {
    try {
        const { year } = req.query;
        const userId = req.user.id;

        // Build where conditions
        const whereConditions = { user_id: userId };

        if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year), 11, 31);

            whereConditions.date = {
                [Op.between]: [
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                ]
            };
        }

        // Get attendance records and group by month
        const attendanceRecords = await Attendance.findAll({
            where: whereConditions,
            order: [['date', 'DESC']],
        });

        // Group by month
        const monthlyTimesheets = {};
        attendanceRecords.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyTimesheets[monthKey]) {
                monthlyTimesheets[monthKey] = {
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    entries: [],
                    summary: {
                        total_entries: 0,
                        present_days: 0,
                        approved_entries: 0,
                        draft_entries: 0,
                        rejected_entries: 0,
                        total_hours: 0
                    }
                };
            }

            monthlyTimesheets[monthKey].entries.push(record);
            monthlyTimesheets[monthKey].summary.total_entries++;

            if (record.status === 'present') monthlyTimesheets[monthKey].summary.present_days++;
            if (record.approval_status === 'approved') monthlyTimesheets[monthKey].summary.approved_entries++;
            if (record.approval_status === 'draft') monthlyTimesheets[monthKey].summary.draft_entries++;
            if (record.approval_status === 'rejected') monthlyTimesheets[monthKey].summary.rejected_entries++;

            // Calculate working hours
            if (record.arrival_time && record.departure_time) {
                const arrival = new Date(record.arrival_time);
                const departure = new Date(record.departure_time);
                const hours = (departure - arrival) / (1000 * 60 * 60);
                monthlyTimesheets[monthKey].summary.total_hours += Math.max(0, hours);
            }
        });

        // Convert to array and sort by date
        const timesheets = Object.values(monthlyTimesheets)
            .map(timesheet => ({
                ...timesheet,
                summary: {
                    ...timesheet.summary,
                    total_hours: timesheet.summary.total_hours.toFixed(2)
                }
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });

        return successResponse(
            res,
            StatusCodes.OK,
            'My timesheets retrieved successfully',
            timesheets
        );
    } catch (error) {
        logger.error('Get my timesheets error:', error);
        next(error);
    }
};

/**
 * Create a new timesheet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createTimesheet = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            month,
            year,
            user_id,
            status = 'draft',
            timesheet_entries = []
        } = req.body;

        const requestingUserId = req.user.id;
        const userRoles = req.user.roles || [];
        const targetUserId = user_id || requestingUserId;

        // Check permissions
        if (targetUserId !== requestingUserId) {
            const isAdmin = userRoles.includes('Admin');
            const isHR = userRoles.includes('HR Manager');

            if (!isAdmin && !isHR) {
                await transaction.rollback();
                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    'You can only create timesheets for yourself'
                );
            }
        }

        // Validate required fields
        if (!month || !year) {
            await transaction.rollback();
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                'Month and year are required'
            );
        }

        // Check if timesheet already exists for this user/month/year
        const existingTimesheet = await Timesheet.findOne({
            where: {
                user_id: targetUserId,
                month: parseInt(month),
                year: parseInt(year)
            }
        });

        if (existingTimesheet) {
            await transaction.rollback();
            return errorResponse(
                res,
                StatusCodes.CONFLICT,
                'Timesheet already exists for this month and year'
            );
        }

        // Calculate totals from timesheet entries
        let totalHours = 0;
        let totalWorkingDays = 0;

        timesheet_entries.forEach(entry => {
            if (entry.working_hours) {
                totalHours += parseFloat(entry.working_hours);
            }
            if (entry.status === 'present' || entry.status === 'half day') {
                totalWorkingDays++;
            }
        });

        // Create timesheet
        const timesheet = await Timesheet.create({
            user_id: targetUserId,
            month: parseInt(month),
            year: parseInt(year),
            status,
            total_hours: totalHours.toFixed(2),
            total_working_days: totalWorkingDays,
            submitted_at: status === 'submitted' ? new Date() : null,
            created_by: requestingUserId
        }, { transaction });

        // Create timesheet entries
        const entriesWithTimesheetId = timesheet_entries.map(entry => ({
            timesheet_id: timesheet.id,
            attendance_id: entry.attendance_id,
            date: entry.date,
            arrival_time: entry.arrival_time,
            departure_time: entry.departure_time,
            working_hours: parseFloat(entry.working_hours || 0),
            activity: entry.activity || '',
            description: entry.description || '',
            status: entry.status || 'present',
            scheduler_status: entry.scheduler_status || 'working day',
            is_billable: entry.is_billable !== undefined ? entry.is_billable : true,
            project_code: entry.project_code || null,
            task_category: entry.task_category || null,
            created_by: requestingUserId
        }));

        let createdEntries = [];
        if (entriesWithTimesheetId.length > 0) {
            createdEntries = await TimesheetEntry.bulkCreate(entriesWithTimesheetId, { transaction });
        }

        await transaction.commit();

        // Fetch the complete timesheet with entries
        const completeTimesheet = await Timesheet.findByPk(timesheet.id, {
            include: [
                {
                    model: TimesheetEntry,
                    as: 'entries',
                    order: [['date', 'ASC']]
                },
                {
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
                }
            ]
        });

        return successResponse(
            res,
            StatusCodes.CREATED,
            'Timesheet created successfully',
            completeTimesheet
        );

    } catch (error) {
        await transaction.rollback();
        logger.error('Create timesheet error:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return errorResponse(
                res,
                StatusCodes.CONFLICT,
                'Timesheet already exists for this month and year'
            );
        }

        next(error);
    }
};

/**
 * Update timesheet by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateTimesheetById = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            status,
            timesheet_entries = [],
            supervisor_comments
        } = req.body;

        const requestingUserId = req.user.id;
        const userRoles = req.user.roles || [];

        // Find existing timesheet
        const timesheet = await Timesheet.findByPk(id, {
            include: [
                {
                    model: TimesheetEntry,
                    as: 'entries'
                }
            ]
        });

        if (!timesheet) {
            await transaction.rollback();
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Timesheet not found'
            );
        }

        // Check permissions
        const isAdmin = userRoles.includes('Admin');
        const isHR = userRoles.includes('HR Manager');
        const isDepartmentHead = userRoles.includes('Department Head');
        const isOwner = timesheet.user_id === requestingUserId;

        if (!isAdmin && !isHR && !isDepartmentHead && !isOwner) {
            await transaction.rollback();
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                'You do not have permission to update this timesheet'
            );
        }

        // Check if timesheet can be updated based on status
        if (timesheet.status === 'approved' && !isAdmin && !isHR) {
            await transaction.rollback();
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                'Cannot update approved timesheet'
            );
        }

        // Prepare update data
        const updateData = {
            updated_by: requestingUserId
        };

        if (status !== undefined) {
            updateData.status = status;

            // Set timestamp fields based on status
            if (status === 'submitted') {
                updateData.submitted_at = new Date();
            } else if (status === 'approved') {
                updateData.approved_at = new Date();
                updateData.approved_by = requestingUserId;
            } else if (status === 'rejected') {
                updateData.rejected_at = new Date();
                updateData.rejected_by = requestingUserId;
            }
        }

        if (supervisor_comments !== undefined) {
            updateData.supervisor_comments = supervisor_comments;
        }

        // Update timesheet entries if provided
        if (timesheet_entries.length > 0) {
            // Delete existing entries
            await TimesheetEntry.destroy({
                where: { timesheet_id: id },
                transaction
            });

            // Calculate new totals
            let totalHours = 0;
            let totalWorkingDays = 0;

            const newEntries = timesheet_entries.map(entry => {
                if (entry.working_hours) {
                    totalHours += parseFloat(entry.working_hours);
                }
                if (entry.status === 'present' || entry.status === 'half day') {
                    totalWorkingDays++;
                }

                return {
                    timesheet_id: id,
                    attendance_id: entry.attendance_id,
                    date: entry.date,
                    arrival_time: entry.arrival_time,
                    departure_time: entry.departure_time,
                    working_hours: parseFloat(entry.working_hours || 0),
                    activity: entry.activity || '',
                    description: entry.description || '',
                    status: entry.status || 'present',
                    scheduler_status: entry.scheduler_status || 'working day',
                    is_billable: entry.is_billable !== undefined ? entry.is_billable : true,
                    project_code: entry.project_code || null,
                    task_category: entry.task_category || null,
                    created_by: entry.id ? timesheet.entries.find(e => e.id === entry.id)?.created_by || requestingUserId : requestingUserId,
                    updated_by: requestingUserId
                };
            });

            // Create new entries
            await TimesheetEntry.bulkCreate(newEntries, { transaction });

            // Update totals
            updateData.total_hours = totalHours.toFixed(2);
            updateData.total_working_days = totalWorkingDays;
        }

        // Update timesheet
        await timesheet.update(updateData, { transaction });

        await transaction.commit();

        // Fetch updated timesheet with entries
        const updatedTimesheet = await Timesheet.findByPk(id, {
            include: [
                {
                    model: TimesheetEntry,
                    as: 'entries',
                    order: [['date', 'ASC']]
                },
                {
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
                }
            ]
        });

        return successResponse(
            res,
            StatusCodes.OK,
            'Timesheet updated successfully',
            updatedTimesheet
        );

    } catch (error) {
        await transaction.rollback();
        logger.error('Update timesheet error:', error);
        next(error);
    }
};

/**
 * Get timesheet by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getTimesheetById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.id;
        const userRoles = req.user.roles || [];

        // Find timesheet
        const timesheet = await Timesheet.findByPk(id, {
            include: [
                {
                    model: TimesheetEntry,
                    as: 'entries',
                    include: [
                        {
                            model: Attendance,
                            as: 'attendance',
                            attributes: ['id', 'arrival_time', 'departure_time', 'status']
                        }
                    ],
                    order: [['date', 'ASC']]
                },
                {
                    model: User,
                    as: 'employee',
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
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'first_name', 'middle_name', 'sur_name', 'email']
                }
            ]
        });

        if (!timesheet) {
            return errorResponse(
                res,
                StatusCodes.NOT_FOUND,
                'Timesheet not found'
            );
        }

        // Check permissions
        const isAdmin = userRoles.includes('Admin');
        const isHR = userRoles.includes('HR Manager');
        const isDepartmentHead = userRoles.includes('Department Head');
        const isOwner = timesheet.user_id === requestingUserId;

        if (!isAdmin && !isHR && !isDepartmentHead && !isOwner) {
            // For department heads, check if the employee is in their department
            if (isDepartmentHead) {
                const userEmployee = await BasicEmployeeData.findOne({
                    where: { user_id: requestingUserId }
                });

                const timesheetEmployee = await BasicEmployeeData.findOne({
                    where: { user_id: timesheet.user_id }
                });

                if (!userEmployee || !timesheetEmployee ||
                    userEmployee.department_id !== timesheetEmployee.department_id) {
                    return errorResponse(
                        res,
                        StatusCodes.FORBIDDEN,
                        'You do not have permission to view this timesheet'
                    );
                }
            } else {
                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    'You do not have permission to view this timesheet'
                );
            }
        }

        return successResponse(
            res,
            StatusCodes.OK,
            'Timesheet retrieved successfully',
            timesheet
        );

    } catch (error) {
        logger.error('Get timesheet by ID error:', error);
        next(error);
    }
};

module.exports = {
    getTimesheet,
    updateTimesheet,
    submitTimesheet,
    getTeamTimesheets,
    getMyTimesheets,
    createTimesheet,
    updateTimesheetById,
    getTimesheetById
};