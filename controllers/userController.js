const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const BioData = require('../models/BioData');
const PersonalEmployeeData = require('../models/PersonalEmployeeData');
const Department = require('../models/Department');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
// ADD THESE MISSING IMPORTS
const EmergencyContact = require('../models/EmergencyContact');
const NextOfKin = require('../models/NextOfKin');
const crypto = require('crypto'); // Also needed for password generation
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const { formatDate } = require('../utils/dateUtils');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      gender = '',
      department = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { sur_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereConditions.status = status;
    }

    if (gender) {
      whereConditions.gender = gender;
    }

    // Build association options for department filter
    const includeOptions = [
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'role_name']
      }
    ];

    if (department) {
      includeOptions.push({
        model: BasicEmployeeData,
        as: 'basicEmployeeData',
        required: true,
        include: [
          {
            model: Department,
            as: 'department',
            where: { id: department },
            attributes: ['id', 'department_name']
          }
        ]
      });
    } else {
      includeOptions.push({
        model: BasicEmployeeData,
        as: 'basicEmployeeData',
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'department_name']
          }
        ]
      });
    }

    // Execute query
    const { count, rows } = await User.findAndCountAll({
      where: whereConditions,
      include: includeOptions,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    // Format user data
    const users = rows.map(user => {
      const userData = user.toJSON();

      // Format department data
      if (userData.basicEmployeeData && userData.basicEmployeeData.department) {
        userData.department = userData.basicEmployeeData.department.department_name;
        userData.department_id = userData.basicEmployeeData.department.id;
      } else {
        userData.department = null;
        userData.department_id = null;
      }

      // Format roles
      userData.roleNames = userData.roles.map(role => role.role_name);

      // Extract essential fields from basicEmployeeData
      if (userData.basicEmployeeData) {
        userData.designation = userData.basicEmployeeData.designation;
        userData.employment_type = userData.basicEmployeeData.employment_type;
        userData.date_joined = userData.basicEmployeeData.date_joined;
      }

      // Remove nested objects to make response cleaner
      delete userData.basicEmployeeData;

      return userData;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);

    return paginatedResponse(
      res,
      StatusCodes.OK,
      'Users retrieved successfully',
      users,
      {
        page: currentPage,
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    );
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

/**
 * Get user by ID with detailed information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find user with all related information
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: BasicEmployeeData,
          as: 'basicEmployeeData',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'department_name']
            },
            {
              model: User,
              as: 'supervisor',
              attributes: ['id', 'first_name', 'middle_name', 'sur_name']
            }
          ]
        },
        {
          model: BioData,
          as: 'bioData'
        },
        {
          model: PersonalEmployeeData,
          as: 'personalEmployeeData'
        },
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'role_name']
        }
      ]
    });

    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    // Format user data
    const userData = user.toJSON();

    // Format roles
    userData.roles = userData.roles.map(role => ({
      id: role.id,
      name: role.role_name
    }));

    return successResponse(
      res,
      StatusCodes.OK,
      'User retrieved successfully',
      userData
    );
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

/**
 * Update user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      middle_name,
      sur_name,
      email,
      phone_number,
      gender,
      status,
      basicEmployeeData,
      bioData,
      personalEmployeeData,
      roles
    } = req.body;

    // Find the user
    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    // Start a transaction
    const transaction = await User.sequelize.transaction();

    try {
      // Update user base information
      await user.update({
        first_name: first_name || user.first_name,
        middle_name,
        sur_name: sur_name || user.sur_name,
        email: email || user.email,
        phone_number,
        gender: gender || user.gender,
        status: status || user.status
      }, { transaction });

      // Update/create basic employee data if provided
      if (basicEmployeeData) {
        let employeeData = await BasicEmployeeData.findOne({
          where: { user_id: id },
          transaction
        });

        if (employeeData) {
          await employeeData.update(basicEmployeeData, { transaction });
        } else {
          await BasicEmployeeData.create({
            user_id: id,
            ...basicEmployeeData
          }, { transaction });
        }
      }

      // Update/create bio data if provided
      if (bioData) {
        let existingBioData = await BioData.findOne({
          where: { user_id: id },
          transaction
        });

        if (existingBioData) {
          await existingBioData.update(bioData, { transaction });
        } else {
          await BioData.create({
            user_id: id,
            ...bioData
          }, { transaction });
        }
      }

      // Update/create personal employee data if provided
      if (personalEmployeeData) {
        let personalData = await PersonalEmployeeData.findOne({
          where: { user_id: id },
          transaction
        });

        if (personalData) {
          await personalData.update(personalEmployeeData, { transaction });
        } else {
          await PersonalEmployeeData.create({
            user_id: id,
            ...personalEmployeeData
          }, { transaction });
        }
      }

      // Update roles if provided
      if (roles && Array.isArray(roles)) {
        // Delete current roles
        await UserRole.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new roles
        for (const roleId of roles) {
          await UserRole.create({
            user_id: id,
            role_id: roleId
          }, { transaction });
        }
      }

      // Commit transaction
      await transaction.commit();

      // Get updated user with all related information
      const updatedUser = await User.findOne({
        where: { id },
        include: [
          {
            model: BasicEmployeeData,
            as: 'basicEmployeeData',
            include: [
              {
                model: Department,
                as: 'department',
                attributes: ['id', 'department_name']
              }
            ]
          },
          {
            model: BioData,
            as: 'bioData'
          },
          {
            model: PersonalEmployeeData,
            as: 'personalEmployeeData'
          },
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id', 'role_name']
          }
        ]
      });

      return successResponse(
        res,
        StatusCodes.OK,
        'User updated successfully',
        updatedUser
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'User not found'
      );
    }

    // We don't actually delete the user, we just set status to inactive
    await user.update({ status: 'inactive' });

    return successResponse(
      res,
      StatusCodes.OK,
      'User deactivated successfully'
    );
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createUser = async (req, res, next) => {
  try {
    const {
      // Basic user information
      first_name,
      middle_name,
      sur_name,
      email,
      phone_number,
      gender,
      password,
      // Employee data
      basic_employee_data = {},
      bio_data = {},
      personal_employee_data = {},
      emergency_contacts = [],
      next_of_kin = [],
      // Roles
      roles = [],
      // Options
      send_welcome_email = true,
      generate_random_password = false
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          ...(phone_number ? [{ phone_number }] : [])
        ]
      }
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'phone_number';
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'User already exists',
        [{ field: conflictField, message: `${conflictField} already in use` }]
      );
    }

    // Generate random password if requested
    let userPassword = password || first_name + "@2025";
    if (generate_random_password) {
      userPassword = crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    if (!userPassword) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Password is required',
        [{ field: 'password', message: 'Password must be provided or generate_random_password must be true' }]
      );
    }

    // Validate roles if provided
    if (roles.length > 0) {
      const existingRoles = await Role.findAll({
        where: { id: { [Op.in]: roles } }
      });

      if (existingRoles.length !== roles.length) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Some roles do not exist',
          [{ field: 'roles', message: 'One or more role IDs are invalid' }]
        );
      }
    }

    // Validate department if provided in basic_employee_data
    if (basic_employee_data.department_id) {
      const department = await Department.findByPk(basic_employee_data.department_id);
      if (!department) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Department not found',
          [{ field: 'basic_employee_data.department_id', message: 'Department does not exist' }]
        );
      }
    }

    // Validate supervisor if provided in basic_employee_data
    if (basic_employee_data.supervisor_id) {
      const supervisor = await User.findByPk(basic_employee_data.supervisor_id);
      if (!supervisor) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Supervisor not found',
          [{ field: 'basic_employee_data.supervisor_id', message: 'Supervisor does not exist' }]
        );
      }
    }

    // Validate NIDA uniqueness if provided
    if (basic_employee_data.nida) {
      const existingNida = await BasicEmployeeData.findOne({
        where: { nida: basic_employee_data.nida }
      });

      if (existingNida) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'NIDA number already exists',
          [{ field: 'basic_employee_data.nida', message: 'NIDA number must be unique' }]
        );
      }
    }

    // Validate registration number uniqueness if provided
    if (basic_employee_data.registration_number) {
      const existingRegNumber = await BasicEmployeeData.findOne({
        where: { registration_number: basic_employee_data.registration_number }
      });

      if (existingRegNumber) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'Registration number already exists',
          [{ field: 'basic_employee_data.registration_number', message: 'Registration number must be unique' }]
        );
      }
    }

    // Validate national ID uniqueness if provided in bio_data
    if (bio_data.national_id) {
      const existingNationalId = await BioData.findOne({
        where: { national_id: bio_data.national_id }
      });

      if (existingNationalId) {
        return errorResponse(
          res,
          StatusCodes.CONFLICT,
          'National ID already exists',
          [{ field: 'bio_data.national_id', message: 'National ID must be unique' }]
        );
      }
    }

    // Validate next of kin percentages sum to 100% if provided
    if (next_of_kin.length > 0) {
      const totalPercentage = next_of_kin.reduce((sum, kin) => sum + (kin.percentage || 0), 0);
      if (totalPercentage !== 100) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Next of kin percentages must sum to 100%',
          [{ field: 'next_of_kin', message: `Current total is ${totalPercentage}%, must be exactly 100%` }]
        );
      }
    }

    // Start a transaction
    const transaction = await User.sequelize.transaction();

    try {
      // Create the user
      const newUser = await User.create({
        first_name,
        middle_name,
        sur_name,
        email,
        phone_number,
        gender,
        password: userPassword,
        status: 'active'
      }, { transaction });

      // Create basic employee data if provided
      let employeeData = null;
      if (Object.keys(basic_employee_data).length > 0) {
        employeeData = await BasicEmployeeData.create({
          user_id: newUser.id,
          status: basic_employee_data.status || 'active',
          registration_number: basic_employee_data.registration_number,
          date_joined: basic_employee_data.date_joined || new Date(),
          designation: basic_employee_data.designation || 'Employee',
          employment_type: basic_employee_data.employment_type || 'full time',
          department_id: basic_employee_data.department_id,
          salary: basic_employee_data.salary,
          supervisor_id: basic_employee_data.supervisor_id,
          bank_name: basic_employee_data.bank_name,
          account_number: basic_employee_data.account_number,
          nida: basic_employee_data.nida,
          bima: basic_employee_data.bima,
          nssf: basic_employee_data.nssf,
          helsb: basic_employee_data.helsb,
          signature: basic_employee_data.signature
        }, { transaction });
      }

      // Create bio data if provided
      if (Object.keys(bio_data).length > 0) {
        await BioData.create({
          user_id: newUser.id,
          fingerprint_id: bio_data.fingerprint_id,
          signature: bio_data.signature,
          marital_status: bio_data.marital_status || 'single',
          national_id: bio_data.national_id,
          dob: bio_data.dob,
          blood_group: bio_data.blood_group
        }, { transaction });
      }

      // Create personal employee data if provided
      if (Object.keys(personal_employee_data).length > 0) {
        await PersonalEmployeeData.create({
          user_id: newUser.id,
          location: personal_employee_data.location,
          education_level: personal_employee_data.education_level
        }, { transaction });
      }

      // Create emergency contacts if provided
      for (const contact of emergency_contacts) {
        await EmergencyContact.create({
          user_id: newUser.id,
          name: contact.name,
          phone_number: contact.phone_number,
          relationship: contact.relationship
        }, { transaction });
      }

      // Create next of kin if provided
      for (const kin of next_of_kin) {
        await NextOfKin.create({
          user_id: newUser.id,
          name: kin.name,
          phone_number: kin.phone_number,
          percentage: kin.percentage,
          relationship: kin.relationship
        }, { transaction });
      }

      // Assign roles
      if (roles.length > 0) {
        for (const roleId of roles) {
          await UserRole.create({
            user_id: newUser.id,
            role_id: roleId
          }, { transaction });
        }
      } else {
        // Assign default employee role if no roles specified
        const defaultRole = await Role.findOne({
          where: {
            role_name: 'Employee',
            is_default: true
          }
        });

        if (defaultRole) {
          await UserRole.create({
            user_id: newUser.id,
            role_id: defaultRole.id
          }, { transaction });
        }
      }

      // Commit transaction
      await transaction.commit();

      // Send welcome email if requested
      // if (send_welcome_email) {
      //   try {
      //     await sendEmail({
      //       to: email,
      //       subject: 'Welcome to GHF HR System',
      //       template: 'welcome-new-employee',
      //       templateData: {
      //         firstName: first_name,
      //         fullName: `${first_name} ${sur_name}`,
      //         email: email,
      //         password: generate_random_password ? userPassword : '[Your provided password]',
      //         temporaryPassword: generate_random_password,
      //         registrationNumber: employeeData?.registration_number,
      //         department: basic_employee_data.department_id ?
      //           (await Department.findByPk(basic_employee_data.department_id))?.department_name :
      //           'Not assigned',
      //         designation: basic_employee_data.designation || 'Employee'
      //       }
      //     });
      //   } catch (emailError) {
      //     logger.warn('Failed to send welcome email:', emailError);
      //     // Don't fail the user creation if email fails
      //   }
      // }

      // Get created user with all related information
      const createdUser = await User.findOne({
        where: { id: newUser.id },
        include: [
          {
            model: BasicEmployeeData,
            as: 'basicEmployeeData',
            include: [
              {
                model: Department,
                as: 'department',
                attributes: ['id', 'department_name']
              },
              {
                model: User,
                as: 'supervisor',
                attributes: ['id', 'first_name', 'middle_name', 'sur_name']
              }
            ]
          },
          {
            model: BioData,
            as: 'bioData'
          },
          {
            model: PersonalEmployeeData,
            as: 'personalEmployeeData'
          },
          {
            model: EmergencyContact,
            as: 'emergencyContacts'
          },
          {
            model: NextOfKin,
            as: 'nextOfKin'
          },
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id', 'role_name']
          }
        ]
      });

      // Prepare response (exclude sensitive data)
      const responseData = {
        ...createdUser.toJSON(),
        ...(generate_random_password && { temporary_password: userPassword })
      };

      return successResponse(
        res,
        StatusCodes.CREATED,
        'User created successfully',
        responseData
      );
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};