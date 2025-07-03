const { BonusRecord } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class BonusRecordController {
  // Get all bonus records
  static async getAllBonuses(req, res) {
    try {
      const { userId, status, startDate, endDate } = req.query;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const bonuses = await BonusRecord.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.json(bonuses);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new bonus record
  static async createBonus(req, res) {
    try {
      const { userId, amount, reason, status } = req.body;

      const bonus = await BonusRecord.create({
        user_id: userId,
        amount,
        reason,
        status: status || 'pending',
        approved_by: req.user.id
      });

      return res.json(bonus);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update bonus status
  static async updateBonusStatus(req, res) {
    try {
      const { bonusId } = req.params;
      const { status } = req.body;

      const bonus = await BonusRecord.findByPk(bonusId);
      if (!bonus) {
        return res.status(404).json({ error: 'Bonus record not found' });
      }

      await bonus.update({
        status,
        approved_by: req.user.id,
        approved_date: new Date()
      });

      return res.json(bonus);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get bonus statistics
  static async getBonusStatistics(req, res) {
    try {
      const { userId, startDate, endDate } = req.query;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const [totalAmount, totalRecords] = await Promise.all([
        BonusRecord.sum('amount', { where }),
        BonusRecord.count({ where })
      ]);

      return res.json({
        totalAmount: totalAmount || 0,
        totalRecords: totalRecords || 0
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BonusRecordController;
