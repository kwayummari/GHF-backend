const { Quarter } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class QuarterController {
  // Get all quarters
  static async getAllQuarters(req, res) {
    try {
      const quarters = await Quarter.findAll({
        order: [['year', 'DESC'], ['quarter_number', 'DESC']]
      });
      return res.json(quarters);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get current quarter
  static async getCurrentQuarter(req, res) {
    try {
      const now = new Date();
      const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
      
      const quarter = await Quarter.findOne({
        where: {
          year: now.getFullYear(),
          quarter_number: currentQuarter
        }
      });

      return res.json(quarter || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create new quarter
  static async createQuarter(req, res) {
    try {
      const { year, quarter_number, start_date, end_date } = req.body;

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      const quarter = await Quarter.create({
        year,
        quarter_number,
        start_date,
        end_date,
        status: 'active'
      });

      return res.json(quarter);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update quarter status
  static async updateQuarterStatus(req, res) {
    try {
      const { quarterId } = req.params;
      const { status } = req.body;

      const quarter = await Quarter.findByPk(quarterId);
      if (!quarter) {
        return res.status(404).json({ error: 'Quarter not found' });
      }

      await quarter.update({
        status
      });

      return res.json(quarter);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get quarters by year
  static async getQuartersByYear(req, res) {
    try {
      const { year } = req.params;
      const quarters = await Quarter.findAll({
        where: {
          year: parseInt(year)
        },
        order: [['quarter_number', 'ASC']]
      });
      return res.json(quarters);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = QuarterController;
