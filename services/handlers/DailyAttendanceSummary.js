const { Op } = require('sequelize');
const AttendanceRecord = require('../../../models/AttendanceRecord');
const User = require('../../../models/User');
const sequelize = require('../../../config/database');

module.exports = {
  async execute(task) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get all attendance records for yesterday
      const records = await AttendanceRecord.findAll({
        where: {
          date: yesterday,
          status: {
            [Op.notIn]: ['absent', 'leave', 'sick']
          }
        },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'department_id']
          }
        ]
      });

      // Calculate statistics
      const stats = {
        totalPresent: records.length,
        totalOvertime: records.reduce((sum, record) => sum + (record.overtime_hours || 0), 0),
        departments: {}
      };

      // Group by department
      records.forEach(record => {
        const deptId = record.user.department_id;
        if (!stats.departments[deptId]) {
          stats.departments[deptId] = {
            present: 0,
            overtime: 0
          };
        }
        stats.departments[deptId].present++;
        stats.departments[deptId].overtime += record.overtime_hours || 0;
      });

      // Save statistics (implement your storage logic here)
      await sequelize.query(`
        INSERT INTO attendance_statistics (date, total_present, total_overtime, data)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_present = VALUES(total_present),
          total_overtime = VALUES(total_overtime),
          data = VALUES(data)
      `, {
        replacements: [
          yesterday,
          stats.totalPresent,
          stats.totalOvertime,
          JSON.stringify(stats)
        ]
      });

      // Generate notifications for late check-ins
      const lateRecords = records.filter(record => {
        const checkInTime = record.check_in;
        return checkInTime && checkInTime > '09:00:00';
      });

      if (lateRecords.length > 0) {
        // Implement notification logic here
        console.log(`Late check-ins found: ${lateRecords.length}`);
      }

      return stats;
    } catch (error) {
      console.error('Error in DailyAttendanceSummary:', error);
      throw error;
    }
  }
};
