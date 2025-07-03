const { CronJob } = require('cron');
const AutomatedTask = require('../models/AutomatedTask');
const sequelize = require('../config/database');

const taskHandlers = {
  'dailyAttendanceSummary': require('./handlers/DailyAttendanceSummary'),
  'monthlyAttendanceRollup': require('./handlers/MonthlyAttendanceRollup'),
  'approvalWorkflow': require('./handlers/ApprovalWorkflow'),
  'databaseMaintenance': require('./handlers/DatabaseMaintenance'),
  'notificationService': require('./handlers/NotificationService'),
  'reportGenerator': require('./handlers/ReportGenerator')
};

class AutomatedTaskService {
  constructor() {
    this.jobs = {};
  }

  async initialize() {
    try {
      const tasks = await AutomatedTask.findAll({ where: { active: true } });
      
      for (const task of tasks) {
        this.createJob(task);
      }
    } catch (error) {
      console.error('Error initializing automated tasks:', error);
    }
  }

  createJob(task) {
    const job = new CronJob(task.schedule, async () => {
      try {
        // Update task status
        await sequelize.transaction(async (t) => {
          await task.update({
            last_run_at: new Date(),
            last_run_status: 'pending'
          }, { transaction: t });

          // Execute task handler
          const handler = taskHandlers[task.type];
          if (handler) {
            await handler.execute(task);
            await task.update({
              last_run_status: 'success'
            }, { transaction: t });
          } else {
            console.error(`No handler found for task type: ${task.type}`);
            await task.update({
              last_run_status: 'failed'
            }, { transaction: t });
          }
        });
      } catch (error) {
        console.error(`Error executing task ${task.name}:`, error);
        task.update({
          last_run_status: 'failed'
        });
      }
    });

    job.start();
    this.jobs[task.id] = job;
  }

  async addTask(taskData) {
    const task = await AutomatedTask.create(taskData);
    this.createJob(task);
    return task;
  }

  async updateTask(taskId, updates) {
    const task = await AutomatedTask.findByPk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    await task.update(updates);
    
    // If schedule changed, recreate the job
    if (updates.schedule) {
      this.jobs[task.id].stop();
      this.createJob(task);
    }

    return task;
  }

  async deleteTask(taskId) {
    const task = await AutomatedTask.findByPk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (this.jobs[taskId]) {
      this.jobs[taskId].stop();
      delete this.jobs[taskId];
    }

    await task.destroy();
  }
}

module.exports = new AutomatedTaskService();
