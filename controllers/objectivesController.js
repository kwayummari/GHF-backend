const { Objective } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class ObjectivesController {
  // Get all objectives
  static async getAllObjectives(req, res) {
    try {
      const { userId, departmentId, status } = req.query;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (departmentId) {
        where.department_id = departmentId;
      }

      if (status) {
        where.status = status;
      }

      const objectives = await Objective.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user'
          },
          {
            model: Department,
            as: 'department'
          }
        ],
        order: [['start_date', 'DESC']]
      });

      return res.json(objectives);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create objective
  static async createObjective(req, res) {
    try {
      const { userId } = req.user;
      const objective = await Objective.create({
        user_id: userId,
        ...req.body
      });
      return res.json(objective);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update objective
  static async updateObjective(req, res) {
    try {
      const { objectiveId } = req.params;
      const objective = await Objective.findByPk(objectiveId);
      if (!objective) {
        return res.status(404).json({ error: 'Objective not found' });
      }

      await objective.update(req.body);
      return res.json(objective);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update objective status
  static async updateObjectiveStatus(req, res) {
    try {
      const { objectiveId } = req.params;
      const { status, progress } = req.body;

      const objective = await Objective.findByPk(objectiveId);
      if (!objective) {
        return res.status(404).json({ error: 'Objective not found' });
      }

      await objective.update({
        status,
        progress
      });

      return res.json(objective);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get objective statistics
  static async getObjectivesStats(req, res) {
    try {
      const { userId, departmentId } = req.query;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (departmentId) {
        where.department_id = departmentId;
      }

      const [totalObjectives, completedObjectives] = await Promise.all([
        Objective.count({ where }),
        Objective.count({
          where: {
            ...where,
            status: 'completed'
          }
        })
      ]);

      return res.json({
        totalObjectives,
        completedObjectives,
        completionRate: totalObjectives > 0 
          ? (completedObjectives / totalObjectives * 100).toFixed(2)
          : 0
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ObjectivesController;
