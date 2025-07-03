const { AutomatedTask } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class AutomatedTaskController {
  // Get all automated tasks
  static async getAllTasks(req, res) {
    try {
      const { status, type } = req.query;
      const where = {};

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      const tasks = await AutomatedTask.findAll({
        where,
        order: [['lastRun', 'DESC']]
      });
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new automated task
  static async createTask(req, res) {
    try {
      const { name, type, description, schedule, active } = req.body;

      const task = await AutomatedTask.create({
        name,
        type,
        description,
        schedule,
        active: active || true,
        lastRun: null,
        status: 'pending'
      });

      return res.json(task);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update task status
  static async updateTaskStatus(req, res) {
    try {
      const { taskId } = req.params;
      const { status } = req.body;

      const task = await AutomatedTask.findByPk(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await task.update({
        status,
        lastRun: status === 'completed' ? new Date() : task.lastRun
      });

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Run a task manually
  static async runTask(req, res) {
    try {
      const { taskId } = req.params;
      const task = await AutomatedTask.findByPk(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Update status to running
      await task.update({
        status: 'running',
        lastRun: new Date()
      });

      // TODO: Implement actual task execution logic
      // This would typically be handled by a background job
      // For now, we'll simulate success
      
      await task.update({
        status: 'completed'
      });

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get task execution history
  static async getTaskHistory(req, res) {
    try {
      const { taskId } = req.params;
      const task = await AutomatedTask.findByPk(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // In a real implementation, this would query a separate execution history table
      return res.json({
        task,
        lastExecution: task.lastRun,
        status: task.status
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AutomatedTaskController;
