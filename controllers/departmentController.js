const { StatusCodes } = require('http-status-codes');
const Department = require('../models/Department');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../utils/logger');

/**
 * Get all departments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'department_name', 'description', 'head_id', 'budget', 'location', 'is_active', 'created_at', 'updated_at'],
      order: [['department_name', 'ASC']]
    });

    return successResponse(
      res,
      StatusCodes.OK,
      'Departments retrieved successfully',
      departments
    );
  } catch (error) {
    logger.error('Get all departments error:', error);
    next(error);
  }
};

/**
 * Create a new department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createDepartment = async (req, res, next) => {
  try {
    const { department_name } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({
      where: { department_name }
    });
    
    if (existingDepartment) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'Department already exists',
        [{ field: 'department_name', message: 'Department name already in use' }]
      );
    }
    
    // Create department
    const newDepartment = await Department.create({ department_name });
    
    return successResponse(
      res,
      StatusCodes.CREATED,
      'Department created successfully',
      newDepartment
    );
  } catch (error) {
    logger.error('Create department error:', error);
    next(error);
  }
};

/**
 * Get department by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findByPk(id);
    
    if (!department) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Department not found'
      );
    }
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Department retrieved successfully',
      department
    );
  } catch (error) {
    logger.error('Get department by ID error:', error);
    next(error);
  }
};

/**
 * Update department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department_name } = req.body;
    
    const department = await Department.findByPk(id);
    
    if (!department) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Department not found'
      );
    }
    
    // Check if new name conflicts with another department
    if (department_name && department_name !== department.department_name) {
      const existingDepartment = await Department.findOne({
        where: { department_name }
      });
      
      if (existingDepartment) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'Department name already in use',
          [{ field: 'department_name', message: 'Department name already in use' }]
        );
      }
    }
    
    // Update department
    await department.update({ department_name });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Department updated successfully',
      department
    );
  } catch (error) {
    logger.error('Update department error:', error);
    next(error);
  }
};

/**
 * Delete department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findByPk(id);
    
    if (!department) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Department not found'
      );
    }
    
    // Check if any employees are assigned to this department
    const employeesCount = await BasicEmployeeData.count({
      where: { department_id: id }
    });
    
    if (employeesCount > 0) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Cannot delete department with assigned employees',
        [{ field: 'department_id', message: `${employeesCount} employees are assigned to this department` }]
      );
    }
    
    // Delete department
    await department.destroy();
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Department deleted successfully'
    );
  } catch (error) {
    logger.error('Delete department error:', error);
    next(error);
  }
};

/**
 * Get all employees in a department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getDepartmentEmployees = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if department exists
    const department = await Department.findByPk(id);
    
    if (!department) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Department not found'
      );
    }
    
    // Get all employees in department
    const employees = await User.findAll({
      include: [
        {
          model: BasicEmployeeData,
          as: 'basicEmployeeData',
          where: { department_id: id },
          include: [
            {
              model: User,
              as: 'supervisor',
              attributes: ['id', 'first_name', 'middle_name', 'sur_name']
            }
          ]
        }
      ],
      order: [['first_name', 'ASC'], ['sur_name', 'ASC']]
    });
    
    // Format employee data
    const formattedEmployees = employees.map(employee => {
      const employeeData = employee.toJSON();
      
      return {
        id: employeeData.id,
        first_name: employeeData.first_name,
        middle_name: employeeData.middle_name,
        sur_name: employeeData.sur_name,
        email: employeeData.email,
        phone_number: employeeData.phone_number,
        gender: employeeData.gender,
        status: employeeData.status,
        designation: employeeData.basicEmployeeData.designation,
        employment_type: employeeData.basicEmployeeData.employment_type,
        date_joined: employeeData.basicEmployeeData.date_joined,
        supervisor: employeeData.basicEmployeeData.supervisor ? {
          id: employeeData.basicEmployeeData.supervisor.id,
          name: `${employeeData.basicEmployeeData.supervisor.first_name} ${employeeData.basicEmployeeData.supervisor.sur_name}`
        } : null
      };
    });
    
    return successResponse(
      res,
      StatusCodes.OK,
      'Department employees retrieved successfully',
      {
        department: department.department_name,
        employees: formattedEmployees,
        count: formattedEmployees.length
      }
    );
  } catch (error) {
    logger.error('Get department employees error:', error);
    next(error);
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentEmployees
};