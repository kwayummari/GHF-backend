/**
 * Meeting Controller
 * Handles meeting-related operations
 */
const { StatusCodes } = require('http-status-codes');
const { Op, Sequelize } = require('sequelize');
const Meeting = require('../models/Meeting');
const MeetingAttendee = require('../models/MeetingAtendee');
const MeetingTask = require('../models/MeetingTask');
const MeetingDocument = require('../models/MeetingDocument');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/mailer');

/**
 * Get all meetings with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllMeetings = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            meeting_type,
            date,
            date_from,
            date_to,
            chairperson,
            search,
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // Apply filters
        if (status) {
            where.status = status;
        }

        if (meeting_type) {
            where.meeting_type = meeting_type;
        }

        if (date) {
            where.meeting_date = date;
        }

        if (date_from && date_to) {
            where.meeting_date = {
                [Op.between]: [date_from, date_to],
            };
        } else if (date_from) {
            where.meeting_date = {
                [Op.gte]: date_from,
            };
        } else if (date_to) {
            where.meeting_date = {
                [Op.lte]: date_to,
            };
        }

        if (chairperson) {
            where.chairperson = {
                [Op.iLike]: `%${chairperson}%`,
            };
        }

        if (search) {
            where[Op.or] = [
                { meeting_title: { [Op.iLike]: `%${search}%` } },
                { chairperson: { [Op.iLike]: `%${search}%` } },
                { organizer: { [Op.iLike]: `%${search}%` } },
                { location: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Meeting.findAndCountAll({
            where,
            include: [
                {
                    model: MeetingAttendee,
                    as: 'attendees',
                    attributes: ['id', 'name', 'email', 'attendance_status'],
                },
                {
                    model: MeetingTask,
                    as: 'tasks',
                    attributes: ['id', 'status'],
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['meeting_date', 'ASC'], ['start_time', 'ASC']],
        });

        // Add computed fields
        const meetings = rows.map(meeting => {
            const meetingData = meeting.toJSON();
            meetingData.tasks_count = meetingData.tasks?.length || 0;
            meetingData.attendees_count = meetingData.attendees?.length || 0;
            return meetingData;
        });

        return successResponse(res, StatusCodes.OK, 'Meetings retrieved successfully', {
            meetings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        logger.error('Get all meetings error:', error);
        next(error);
    }
};

/**
 * Get meeting by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMeetingById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const meeting = await Meeting.findByPk(id, {
            include: [
                {
                    model: MeetingAttendee,
                    as: 'attendees',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'first_name', 'sur_name', 'email'],
                        },
                    ],
                },
                {
                    model: MeetingTask,
                    as: 'tasks',
                    include: [
                        {
                            model: User,
                            as: 'assignedUser',
                            attributes: ['id', 'first_name', 'sur_name', 'email'],
                        },
                    ],
                },
                {
                    model: MeetingDocument,
                    as: 'documents',
                    include: [
                        {
                            model: User,
                            as: 'uploader',
                            attributes: ['id', 'first_name', 'sur_name'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
            ],
        });

        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        return successResponse(res, StatusCodes.OK, 'Meeting retrieved successfully', meeting);
    } catch (error) {
        logger.error('Get meeting by ID error:', error);
        next(error);
    }
};

/**
 * Create new meeting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createMeeting = async (req, res, next) => {
    try {
        const {
            meeting_title,
            meeting_type,
            meeting_date,
            start_time,
            end_time,
            location,
            is_virtual,
            meeting_link,
            chairperson,
            organizer,
            agenda_items,
            attendees,
        } = req.body;

        const meetingData = {
            meeting_title,
            meeting_type,
            meeting_date,
            start_time,
            end_time,
            location,
            is_virtual,
            meeting_link,
            chairperson,
            organizer,
            agenda_items,
            created_by: req.user.id,
        };

        const meeting = await Meeting.create(meetingData);

        // Add attendees if provided
        if (attendees && attendees.length > 0) {
            const attendeeData = attendees.map(attendee => ({
                meeting_id: meeting.id,
                ...attendee,
            }));
            await MeetingAttendee.bulkCreate(attendeeData);
        }

        // Send meeting invitations
        if (attendees && attendees.length > 0) {
            await sendMeetingInvitations(meeting, attendees);
        }

        // Fetch created meeting with associations
        const createdMeeting = await Meeting.findByPk(meeting.id, {
            include: [
                {
                    model: MeetingAttendee,
                    as: 'attendees',
                },
            ],
        });

        logger.info(`Meeting created: ${meeting.id} by user: ${req.user.id}`);

        return successResponse(
            res,
            StatusCodes.CREATED,
            'Meeting created successfully',
            createdMeeting
        );
    } catch (error) {
        logger.error('Create meeting error:', error);
        next(error);
    }
};

/**
 * Update meeting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const meeting = await Meeting.findByPk(id);

        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        // Check if user has permission to update
        if (meeting.created_by !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                'You do not have permission to update this meeting'
            );
        }

        await meeting.update(updateData);

        const updatedMeeting = await Meeting.findByPk(id, {
            include: [
                {
                    model: MeetingAttendee,
                    as: 'attendees',
                },
                {
                    model: MeetingTask,
                    as: 'tasks',
                },
            ],
        });

        logger.info(`Meeting updated: ${id} by user: ${req.user.id}`);

        return successResponse(
            res,
            StatusCodes.OK,
            'Meeting updated successfully',
            updatedMeeting
        );
    } catch (error) {
        logger.error('Update meeting error:', error);
        next(error);
    }
};

/**
 * Delete meeting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;

        const meeting = await Meeting.findByPk(id);

        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        // Check if user has permission to delete
        if (meeting.created_by !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                'You do not have permission to delete this meeting'
            );
        }

        await meeting.destroy();

        logger.info(`Meeting deleted: ${id} by user: ${req.user.id}`);

        return successResponse(res, StatusCodes.OK, 'Meeting deleted successfully');
    } catch (error) {
        logger.error('Delete meeting error:', error);
        next(error);
    }
};

/**
 * Update meeting status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateMeetingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const meeting = await Meeting.findByPk(id);

        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        await meeting.update({ status });

        // Send status update notifications
        const attendees = await MeetingAttendee.findAll({
            where: { meeting_id: id },
        });

        if (attendees.length > 0) {
            await sendMeetingStatusUpdate(meeting, attendees, status);
        }

        logger.info(`Meeting status updated: ${id} to ${status} by user: ${req.user.id}`);

        return successResponse(res, StatusCodes.OK, 'Meeting status updated successfully', meeting);
    } catch (error) {
        logger.error('Update meeting status error:', error);
        next(error);
    }
};

/**
 * Get meeting attendees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMeetingAttendees = async (req, res, next) => {
    try {
        const { meetingId } = req.params;

        const attendees = await MeetingAttendee.findAll({
            where: { meeting_id: meetingId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
            ],
            order: [['name', 'ASC']],
        });

        return successResponse(res, StatusCodes.OK, 'Attendees retrieved successfully', attendees);
    } catch (error) {
        logger.error('Get meeting attendees error:', error);
        next(error);
    }
};

/**
 * Add meeting attendee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const addMeetingAttendee = async (req, res, next) => {
    try {
        const { meetingId } = req.params;
        const attendeeData = {
            meeting_id: meetingId,
            ...req.body,
        };

        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        // Check for duplicate attendee
        const existingAttendee = await MeetingAttendee.findOne({
            where: {
                meeting_id: meetingId,
                email: attendeeData.email,
            },
        });

        if (existingAttendee) {
            return errorResponse(res, StatusCodes.CONFLICT, 'Attendee already exists for this meeting');
        }

        const attendee = await MeetingAttendee.create(attendeeData);

        // Send invitation
        await sendMeetingInvitations(meeting, [attendeeData]);

        return successResponse(res, StatusCodes.CREATED, 'Attendee added successfully', attendee);
    } catch (error) {
        logger.error('Add meeting attendee error:', error);
        next(error);
    }
};

/**
 * Update attendee status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateAttendeeStatus = async (req, res, next) => {
    try {
        const { meetingId, attendeeId } = req.params;
        const { attendance_status } = req.body;

        const attendee = await MeetingAttendee.findOne({
            where: {
                id: attendeeId,
                meeting_id: meetingId,
            },
        });

        if (!attendee) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Attendee not found');
        }

        await attendee.update({ attendance_status });

        return successResponse(res, StatusCodes.OK, 'Attendee status updated successfully', attendee);
    } catch (error) {
        logger.error('Update attendee status error:', error);
        next(error);
    }
};

/**
 * Get meeting tasks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMeetingTasks = async (req, res, next) => {
    try {
        const { meetingId } = req.params;
        const { status, assigned_user_id } = req.query;

        const where = { meeting_id: meetingId };

        if (status) {
            where.status = status;
        }

        if (assigned_user_id) {
            where.assigned_user_id = assigned_user_id;
        }

        const tasks = await MeetingTask.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
                {
                    model: Meeting,
                    as: 'meeting',
                    attributes: ['id', 'meeting_title', 'meeting_date'],
                },
            ],
            order: [['due_date', 'ASC']],
        });

        return successResponse(res, StatusCodes.OK, 'Meeting tasks retrieved successfully', tasks);
    } catch (error) {
        logger.error('Get meeting tasks error:', error);
        next(error);
    }
};

/**
 * Get all meeting tasks (across all meetings)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllMeetingTasks = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            assigned_user_id,
            due_date_from,
            due_date_to,
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (priority) {
            where.priority = priority;
        }

        if (assigned_user_id) {
            where.assigned_user_id = assigned_user_id;
        }

        if (due_date_from && due_date_to) {
            where.due_date = {
                [Op.between]: [due_date_from, due_date_to],
            };
        }

        const { count, rows } = await MeetingTask.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
                {
                    model: Meeting,
                    as: 'meeting',
                    attributes: ['id', 'meeting_title', 'meeting_date'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['due_date', 'ASC']],
        });

        return successResponse(res, StatusCodes.OK, 'All meeting tasks retrieved successfully', {
            tasks: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        logger.error('Get all meeting tasks error:', error);
        next(error);
    }
};

/**
 * Create meeting task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createMeetingTask = async (req, res, next) => {
    try {
        const { meetingId } = req.params;
        const taskData = {
            meeting_id: meetingId,
            created_by: req.user.id,
            ...req.body,
        };

        const meeting = await Meeting.findByPk(meetingId);
        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        const task = await MeetingTask.create(taskData);

        const createdTask = await MeetingTask.findByPk(task.id, {
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
                {
                    model: Meeting,
                    as: 'meeting',
                    attributes: ['id', 'meeting_title'],
                },
            ],
        });

        // Send task assignment notification
        if (createdTask.assignedUser) {
            await sendTaskAssignmentNotification(createdTask);
        }

        logger.info(`Meeting task created: ${task.id} for meeting: ${meetingId} by user: ${req.user.id}`);

        return successResponse(res, StatusCodes.CREATED, 'Meeting task created successfully', createdTask);
    } catch (error) {
        logger.error('Create meeting task error:', error);
        next(error);
    }
};

/**
 * Update meeting task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateMeetingTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const updateData = req.body;

        const task = await MeetingTask.findByPk(taskId);

        if (!task) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Task not found');
        }

        await task.update(updateData);

        const updatedTask = await MeetingTask.findByPk(taskId, {
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'first_name', 'sur_name', 'email'],
                },
                {
                    model: Meeting,
                    as: 'meeting',
                    attributes: ['id', 'meeting_title'],
                },
            ],
        });

        return successResponse(res, StatusCodes.OK, 'Meeting task updated successfully', updatedTask);
    } catch (error) {
        logger.error('Update meeting task error:', error);
        next(error);
    }
};

/**
 * Update task progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateTaskProgress = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { progress, status } = req.body;

        const task = await MeetingTask.findByPk(taskId);

        if (!task) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Task not found');
        }

        const updateData = {};
        if (progress !== undefined) updateData.progress = progress;
        if (status !== undefined) updateData.status = status;

        await task.update(updateData);

        return successResponse(res, StatusCodes.OK, 'Task progress updated successfully', task);
    } catch (error) {
        logger.error('Update task progress error:', error);
        next(error);
    }
};

/**
 * Delete meeting task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteMeetingTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await MeetingTask.findByPk(taskId);

        if (!task) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Task not found');
        }

        await task.destroy();

        return successResponse(res, StatusCodes.OK, 'Meeting task deleted successfully');
    } catch (error) {
        logger.error('Delete meeting task error:', error);
        next(error);
    }
};

/**
 * Get user's meetings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserMeetings = async (req, res, next) => {
    try {
        const { type = 'all', limit = 10 } = req.query;
        const userId = req.user.id;
        const userEmail = req.user.email;

        let dateFilter = {};
        const today = new Date();

        switch (type) {
            case 'today':
                dateFilter = {
                    meeting_date: today.toISOString().split('T')[0],
                };
                break;
            case 'upcoming':
                dateFilter = {
                    meeting_date: {
                        [Op.gte]: today.toISOString().split('T')[0],
                    },
                };
                break;
            case 'past':
                dateFilter = {
                    meeting_date: {
                        [Op.lt]: today.toISOString().split('T')[0],
                    },
                };
                break;
        }

        // Get meetings where user is creator or attendee
        const meetings = await Meeting.findAll({
            where: {
                [Op.and]: [
                    dateFilter,
                    {
                        [Op.or]: [
                            { created_by: userId },
                            {
                                '$attendees.email$': userEmail,
                            },
                        ],
                    },
                ],
            },
            include: [
                {
                    model: MeetingAttendee,
                    as: 'attendees',
                    required: false,
                },
            ],
            limit: parseInt(limit),
            order: [['meeting_date', 'ASC'], ['start_time', 'ASC']],
        });

        return successResponse(res, StatusCodes.OK, 'User meetings retrieved successfully', meetings);
    } catch (error) {
        logger.error('Get user meetings error:', error);
        next(error);
    }
};

/**
 * Get meeting statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getMeetingStatistics = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [
            totalMeetings,
            todaysMeetings,
            pendingTasks,
            meetingsWithMinutes,
        ] = await Promise.all([
            Meeting.count(),
            Meeting.count({
                where: { meeting_date: today },
            }),
            MeetingTask.count({
                where: {
                    status: {
                        [Op.in]: ['not_started', 'in_progress'],
                    },
                },
            }),
            Meeting.count({
                where: {
                    minutes_document_id: {
                        [Op.not]: null,
                    },
                },
            }),
        ]);

        const statistics = {
            total_meetings: totalMeetings,
            todays_meetings: todaysMeetings,
            pending_tasks: pendingTasks,
            meetings_with_minutes: meetingsWithMinutes,
        };

        return successResponse(res, StatusCodes.OK, 'Meeting statistics retrieved successfully', statistics);
    } catch (error) {
        logger.error('Get meeting statistics error:', error);
        next(error);
    }
};

/**
 * Send meeting notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sendMeetingNotifications = async (req, res, next) => {
    try {
        const { meetingId } = req.params;
        const { type, message } = req.body;

        const meeting = await Meeting.findByPk(meetingId, {
            include: [
                {
                    model: MeetingAttendee,
                    as: 'attendees',
                },
            ],
        });

        if (!meeting) {
            return errorResponse(res, StatusCodes.NOT_FOUND, 'Meeting not found');
        }

        // Send notifications based on type
        await sendMeetingNotification(meeting, meeting.attendees, type, message);

        return successResponse(res, StatusCodes.OK, 'Notifications sent successfully');
    } catch (error) {
        logger.error('Send meeting notifications error:', error);
        next(error);
    }
};

// Helper functions

/**
 * Send meeting invitations
 */
const sendMeetingInvitations = async (meeting, attendees) => {
    try {
        const invitationPromises = attendees.map(attendee =>
            sendEmail({
                to: attendee.email,
                subject: `Meeting Invitation: ${meeting.meeting_title}`,
                template: 'meeting-invitation',
                templateData: {
                    meetingTitle: meeting.meeting_title,
                    meetingDate: meeting.meeting_date,
                    startTime: meeting.start_time,
                    endTime: meeting.end_time,
                    location: meeting.location,
                    isVirtual: meeting.is_virtual,
                    meetingLink: meeting.meeting_link,
                    chairperson: meeting.chairperson,
                    agendaItems: meeting.agenda_items,
                    attendeeName: attendee.name,
                },
            })
        );

        await Promise.all(invitationPromises);
        logger.info(`Meeting invitations sent for meeting: ${meeting.id}`);
    } catch (error) {
        logger.error('Send meeting invitations error:', error);
    }
};

/**
 * Send meeting status update
 */
const sendMeetingStatusUpdate = async (meeting, attendees, status) => {
    try {
        const updatePromises = attendees.map(attendee =>
            sendEmail({
                to: attendee.email,
                subject: `Meeting ${status}: ${meeting.meeting_title}`,
                template: 'meeting-status-update',
                templateData: {
                    meetingTitle: meeting.meeting_title,
                    status,
                    meetingDate: meeting.meeting_date,
                    attendeeName: attendee.name,
                },
            })
        );

        await Promise.all(updatePromises);
        logger.info(`Meeting status update notifications sent for meeting: ${meeting.id}`);
    } catch (error) {
        logger.error('Send meeting status update error:', error);
    }
};

/**
 * Send task assignment notification
 */
const sendTaskAssignmentNotification = async (task) => {
    try {
        if (task.assignedUser) {
            await sendEmail({
                to: task.assignedUser.email,
                subject: `New Task Assigned: ${task.meeting.meeting_title}`,
                template: 'task-assignment',
                templateData: {
                    taskDescription: task.task_description,
                    meetingTitle: task.meeting.meeting_title,
                    dueDate: task.due_date,
                    priority: task.priority,
                    assigneeName: `${task.assignedUser.first_name} ${task.assignedUser.sur_name}`,
                },
            });
        }
    } catch (error) {
        logger.error('Send task assignment notification error:', error);
    }
};

/**
 * Send meeting notification
 */
const sendMeetingNotification = async (meeting, attendees, type, customMessage) => {
    try {
        const notificationPromises = attendees.map(attendee =>
            sendEmail({
                to: attendee.email,
                subject: `Meeting ${type}: ${meeting.meeting_title}`,
                template: 'meeting-notification',
                templateData: {
                    meetingTitle: meeting.meeting_title,
                    type,
                    customMessage,
                    meetingDate: meeting.meeting_date,
                    attendeeName: attendee.name,
                },
            })
        );

        await Promise.all(notificationPromises);
        logger.info(`Meeting notifications sent for meeting: ${meeting.id}`);
    } catch (error) {
        logger.error('Send meeting notification error:', error);
    }
};

module.exports = {
    getAllMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus,
    getMeetingAttendees,
    addMeetingAttendee,
    updateAttendeeStatus,
    getMeetingTasks,
    getAllMeetingTasks,
    createMeetingTask,
    updateMeetingTask,
    updateTaskProgress,
    deleteMeetingTask,
    getUserMeetings,
    getMeetingStatistics,
    sendMeetingNotifications,
};