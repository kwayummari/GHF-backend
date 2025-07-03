const { Meeting, MeetingAttendee, MeetingAttachment, MeetingTask } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class MeetingController {
  // Get all meetings
  static async getAllMeetings(req, res) {
    try {
      const { status, startDate, endDate } = req.query;
      const where = {};

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.date[Op.lte] = new Date(endDate);
        }
      }

      const meetings = await Meeting.findAll({
        where,
        include: [
          {
            model: User,
            as: 'createdBy'
          },
          {
            model: User,
            as: 'attendees',
            through: { attributes: [] }
          },
          {
            model: MeetingAttachment,
            as: 'attachments'
          },
          {
            model: MeetingTask,
            as: 'tasks'
          }
        ],
        order: [['date', 'DESC']]
      });

      return res.json(meetings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new meeting
  static async createMeeting(req, res) {
    try {
      const { userId } = req.user;
      const { title, description, date, startTime, endTime, attendees, attachments, tasks } = req.body;

      // Create meeting
      const meeting = await Meeting.create({
        title,
        description,
        date,
        startTime,
        endTime,
        status: 'scheduled',
        created_by: userId
      });

      // Add attendees
      if (attendees && attendees.length > 0) {
        await MeetingAttendee.bulkCreate(attendees.map(attendee => ({
          meeting_id: meeting.id,
          user_id: attendee.userId,
          status: attendee.status || 'pending'
        })));
      }

      // Add attachments
      if (attachments && attachments.length > 0) {
        await MeetingAttachment.bulkCreate(attachments.map(attachment => ({
          meeting_id: meeting.id,
          ...attachment
        })));
      }

      // Add tasks
      if (tasks && tasks.length > 0) {
        await MeetingTask.bulkCreate(tasks.map(task => ({
          meeting_id: meeting.id,
          ...task
        })));
      }

      return res.json(meeting);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update meeting status
  static async updateMeetingStatus(req, res) {
    try {
      const { meetingId } = req.params;
      const { status } = req.body;

      const meeting = await Meeting.findByPk(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      await meeting.update({
        status,
        last_updated_by: req.user.id,
        last_updated_at: new Date()
      });

      return res.json(meeting);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get meeting attendance
  static async getMeetingAttendance(req, res) {
    try {
      const { meetingId } = req.params;
      const attendance = await MeetingAttendee.findAll({
        where: {
          meeting_id: meetingId
        },
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      });

      return res.json(attendance);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get meeting tasks
  static async getMeetingTasks(req, res) {
    try {
      const { meetingId } = req.params;
      const tasks = await MeetingTask.findAll({
        where: {
          meeting_id: meetingId
        },
        include: [
          {
            model: User,
            as: 'assignedTo'
          }
        ]
      });

      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MeetingController;
