const { BasicEmployeeData } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');

class BasicEmployeeDataController {
  // Get employee data by ID
  static async getEmployeeData(req, res) {
    try {
      const { userId } = req.params;
      const employeeData = await BasicEmployeeData.findByPk(userId, {
        where: {
          user_id: userId
        }
      });
      return res.json(employeeData || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create employee data
  static async createEmployeeData(req, res) {
    try {
      const { userId } = req.user;
      const employeeData = await BasicEmployeeData.create({
        user_id: userId,
        ...req.body
      });
      return res.json(employeeData);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update employee data
  static async updateEmployeeData(req, res) {
    try {
      const { userId } = req.params;
      const employeeData = await BasicEmployeeData.findByPk(userId);
      if (!employeeData) {
        return res.status(404).json({ error: 'Employee data not found' });
      }

      await employeeData.update(req.body);
      return res.json(employeeData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Search employees
  static async searchEmployees(req, res) {
    try {
      const { search, departmentId } = req.query;
      const where = {};

      if (search) {
        where.employee_number = {
          [Op.iLike]: `%${search}%`
        };
      }

      if (departmentId) {
        where.department_id = departmentId;
      }

      const employees = await BasicEmployeeData.findAll({
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
        ]
      });

      return res.json(employees);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BasicEmployeeDataController;
