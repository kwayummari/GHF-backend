const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const BasicEmployeeData = require('../models/BasicEmployeeData');
const BioData = require('../models/BioData');
const PersonalEmployeeData = require('../models/PersonalEmployeeData');
const Department = require('../models/Department');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const { sequelize } = require('../models');
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
        // ADD THESE MISSING INCLUDES
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
          attributes: ['id', 'role_name', 'description']
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

    // FIX: Format roles correctly (use role_name, not name)
    userData.roles = userData.roles.map(role => ({
      id: role.id,
      role_name: role.role_name, // Keep consistent with your frontend
      description: role.description
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
      status = 'active',
      address,
      // Employee data
      basic_employee_data = {},
      basicEmployeeData = {}, // Support both naming conventions
      bio_data = {},
      bioData = {}, // Support both naming conventions
      personal_employee_data = {},
      personalEmployeeData = {}, // Support both naming conventions
      // Multiple contacts support
      emergency_contacts = [],
      next_of_kin = [],
      // Backward compatibility - single contact fields
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      next_of_kin_name,
      next_of_kin_phone,
      next_of_kin_relationship,
      // Roles
      roles = [],
      role_ids = [],
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
      const conflictField = existingUser.email === email ? 'email' : 'phone number';
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        `User with this ${conflictField} already exists`
      );
    }

    // Generate password if needed
    let userPassword = password;
    if (generate_random_password || !password) {
      userPassword = crypto.randomBytes(8).toString('hex');
    }

    // Start transaction
    const transaction = await User.sequelize.transaction();

    try {
      // Create user
      const user = await User.create({
        first_name,
        middle_name,
        sur_name,
        email,
        phone_number,
        gender,
        password: userPassword, // You should hash this in production
        status,
        address
      }, { transaction });

      // Merge employee data from both naming conventions
      const mergedBasicEmployeeData = { ...basic_employee_data, ...basicEmployeeData };
      const mergedBioData = { ...bio_data, ...bioData };
      const mergedPersonalEmployeeData = { ...personal_employee_data, ...personalEmployeeData };

      // Auto-assign supervisor if department is provided
      if (mergedBasicEmployeeData.department_id) {
        try {
          // First, try to find Department Head for the specific department
          const departmentHead = await User.findOne({
            include: [
              {
                model: Role,
                as: 'roles',
                where: {
                  role_name: {
                    [Op.in]: ['Department Head', 'department_head', 'Department Manager']
                  }
                }
              },
              {
                model: BasicEmployeeData,
                as: 'basicEmployeeData',
                where: { department_id: mergedBasicEmployeeData.department_id }
              }
            ]
          });

          if (departmentHead) {
            mergedBasicEmployeeData.supervisor_id = departmentHead.id;
            logger.info(`Auto-assigned supervisor ${departmentHead.id} for user ${user.id}`);
          } else {
            // Fallback: Find any HR Manager as supervisor
            const hrManager = await User.findOne({
              include: [
                {
                  model: Role,
                  as: 'roles',
                  where: {
                    role_name: {
                      [Op.in]: ['HR Manager', 'hr_manager', 'Admin', 'admin']
                    }
                  }
                }
              ]
            });

            if (hrManager) {
              mergedBasicEmployeeData.supervisor_id = hrManager.id;
              logger.info(`Auto-assigned HR Manager ${hrManager.id} as supervisor for user ${user.id}`);
            } else {
              // No supervisor found, set to null
              mergedBasicEmployeeData.supervisor_id = null;
              logger.warn(`No supervisor found for user ${user.id} in department ${mergedBasicEmployeeData.department_id}`);
            }
          }
        } catch (supervisorError) {
          logger.error('Error finding supervisor:', supervisorError);
          // Set supervisor_id to null if error occurs
          mergedBasicEmployeeData.supervisor_id = null;
        }
      } else {
        // No department specified, set supervisor to null
        mergedBasicEmployeeData.supervisor_id = null;
      }

      // Create basic employee data if provided
      if (Object.keys(mergedBasicEmployeeData).length > 0) {
        await BasicEmployeeData.create({
          user_id: user.id,
          ...mergedBasicEmployeeData
        }, { transaction });
      }

      // Create bio data if provided
      if (Object.keys(mergedBioData).length > 0) {
        await BioData.create({
          user_id: user.id,
          ...mergedBioData
        }, { transaction });
      }

      // Create personal employee data if provided
      if (Object.keys(mergedPersonalEmployeeData).length > 0) {
        await PersonalEmployeeData.create({
          user_id: user.id,
          ...mergedPersonalEmployeeData
        }, { transaction });
      }

      // Handle emergency contacts (array format)
      let contactsToCreate = [];
      if (emergency_contacts && Array.isArray(emergency_contacts) && emergency_contacts.length > 0) {
        contactsToCreate = emergency_contacts.filter(contact =>
          contact.name && contact.phone_number
        );
      }
      // Backward compatibility - single contact fields
      else if (emergency_contact_name && emergency_contact_phone) {
        contactsToCreate = [{
          name: emergency_contact_name,
          phone_number: emergency_contact_phone,
          relationship: emergency_contact_relationship || 'Not specified'
        }];
      }

      // Create emergency contacts
      for (const contact of contactsToCreate) {
        await EmergencyContact.create({
          user_id: user.id,
          name: contact.name,
          phone_number: contact.phone_number,
          relationship: contact.relationship || 'Not specified'
        }, { transaction });
      }

      // Handle next of kin (array format)
      let kinToCreate = [];
      if (next_of_kin && Array.isArray(next_of_kin) && next_of_kin.length > 0) {
        kinToCreate = next_of_kin.filter(kin =>
          kin.name && kin.phone_number
        );
      }
      // Backward compatibility - single kin fields
      else if (next_of_kin_name && next_of_kin_phone) {
        kinToCreate = [{
          name: next_of_kin_name,
          phone_number: next_of_kin_phone,
          relationship: next_of_kin_relationship || 'Not specified',
          percentage: 100
        }];
      }

      // Create next of kin
      for (const kin of kinToCreate) {
        await NextOfKin.create({
          user_id: user.id,
          name: kin.name,
          phone_number: kin.phone_number,
          relationship: kin.relationship || 'Not specified',
          percentage: kin.percentage || 0
        }, { transaction });
      }

      // Handle roles (support both roles and role_ids)
      const roleIdsToAssign = roles.length > 0 ? roles : role_ids;
      if (roleIdsToAssign && Array.isArray(roleIdsToAssign) && roleIdsToAssign.length > 0) {
        for (const roleId of roleIdsToAssign) {
          await UserRole.create({
            user_id: user.id,
            role_id: roleId
          }, { transaction });
        }
      } else {
        // Auto-assign default "Employee" role if no roles specified
        try {
          const defaultRole = await Role.findOne({
            where: {
              role_name: {
                [Op.in]: ['Employee', 'employee']
              }
            }
          });

          if (defaultRole) {
            await UserRole.create({
              user_id: user.id,
              role_id: defaultRole.id
            }, { transaction });
            logger.info(`Auto-assigned default Employee role to user ${user.id}`);
          }
        } catch (roleError) {
          logger.error('Error assigning default role:', roleError);
        }
      }

      // Commit transaction
      await transaction.commit();

      // Get created user with all related data
      const createdUser = await User.findOne({
        where: { id: user.id },
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
                attributes: ['id', 'first_name', 'sur_name', 'email']
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

      // Log successful creation with supervisor info
      logger.info(`User created successfully: ${user.id}, Supervisor: ${mergedBasicEmployeeData.supervisor_id || 'None'}`);

      return successResponse(
        res,
        StatusCodes.CREATED,
        'User created successfully',
        {
          ...createdUser.toJSON(),
          auto_assigned_supervisor: mergedBasicEmployeeData.supervisor_id ? true : false,
          supervisor_id: mergedBasicEmployeeData.supervisor_id
        }
      );

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Create user error:', error);
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
      address,
      basicEmployeeData,
      basic_employee_data,
      bioData,
      bio_data,
      personalEmployeeData,
      personal_employee_data,
      // Multiple contacts support
      emergency_contacts,
      next_of_kin,
      // Backward compatibility - single contact fields
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      next_of_kin_name,
      next_of_kin_phone,
      next_of_kin_relationship,
      roles,
      role_ids
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
        status: status || user.status,
        address
      }, { transaction });

      // Merge employee data from both naming conventions
      const mergedBasicEmployeeData = { ...basic_employee_data, ...basicEmployeeData };
      const mergedBioData = { ...bio_data, ...bioData };
      const mergedPersonalEmployeeData = { ...personal_employee_data, ...personalEmployeeData };

      // Update/create basic employee data if provided
      if (Object.keys(mergedBasicEmployeeData).length > 0) {
        await BasicEmployeeData.upsert({
          user_id: id,
          ...mergedBasicEmployeeData
        }, { transaction });
      }

      // Update/create bio data if provided
      if (Object.keys(mergedBioData).length > 0) {
        await BioData.upsert({
          user_id: id,
          ...mergedBioData
        }, { transaction });
      }

      // Update/create personal employee data if provided
      if (Object.keys(mergedPersonalEmployeeData).length > 0) {
        await PersonalEmployeeData.upsert({
          user_id: id,
          ...mergedPersonalEmployeeData
        }, { transaction });
      }

      // Handle emergency contacts update
      let shouldUpdateContacts = false;
      let contactsToCreate = [];

      // Check for array format
      if (emergency_contacts && Array.isArray(emergency_contacts)) {
        shouldUpdateContacts = true;
        contactsToCreate = emergency_contacts.filter(contact =>
          contact.name && contact.phone_number
        );
      }
      // Check for backward compatibility format
      else if (emergency_contact_name !== undefined || emergency_contact_phone !== undefined || emergency_contact_relationship !== undefined) {
        shouldUpdateContacts = true;
        if (emergency_contact_name && emergency_contact_phone) {
          contactsToCreate = [{
            name: emergency_contact_name,
            phone_number: emergency_contact_phone,
            relationship: emergency_contact_relationship || 'Not specified'
          }];
        }
      }

      if (shouldUpdateContacts) {
        // Remove existing emergency contacts
        await EmergencyContact.destroy({
          where: { user_id: id },
          transaction
        });

        // Create new emergency contacts
        for (const contact of contactsToCreate) {
          await EmergencyContact.create({
            user_id: id,
            name: contact.name,
            phone_number: contact.phone_number,
            relationship: contact.relationship || 'Not specified'
          }, { transaction });
        }
      }

      // Handle next of kin update
      let shouldUpdateKin = false;
      let kinToCreate = [];

      // Check for array format
      if (next_of_kin && Array.isArray(next_of_kin)) {
        shouldUpdateKin = true;
        kinToCreate = next_of_kin.filter(kin =>
          kin.name && kin.phone_number
        );
      }
      // Check for backward compatibility format
      else if (next_of_kin_name !== undefined || next_of_kin_phone !== undefined || next_of_kin_relationship !== undefined) {
        shouldUpdateKin = true;
        if (next_of_kin_name && next_of_kin_phone) {
          kinToCreate = [{
            name: next_of_kin_name,
            phone_number: next_of_kin_phone,
            relationship: next_of_kin_relationship || 'Not specified',
            percentage: 100
          }];
        }
      }

      if (shouldUpdateKin) {
        // Remove existing next of kin
        await NextOfKin.destroy({
          where: { user_id: id },
          transaction
        });

        // Create new next of kin
        for (const kin of kinToCreate) {
          await NextOfKin.create({
            user_id: id,
            name: kin.name,
            phone_number: kin.phone_number,
            relationship: kin.relationship || 'Not specified',
            percentage: kin.percentage || 0
          }, { transaction });
        }
      }

      // Update roles if provided (support both roles and role_ids)
      const roleIdsToAssign = roles && roles.length > 0 ? roles : role_ids;
      if (roleIdsToAssign && Array.isArray(roleIdsToAssign)) {
        // Delete current roles
        await UserRole.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new roles
        for (const roleId of roleIdsToAssign) {
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

// Updated updateEmployeePartial controller
const updateEmployeePartial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
      // Update basic user information if provided
      if (updateData.first_name || updateData.middle_name || updateData.sur_name ||
        updateData.email || updateData.phone_number || updateData.gender ||
        updateData.status || updateData.address) {
        await user.update({
          first_name: updateData.first_name || user.first_name,
          middle_name: updateData.middle_name || user.middle_name,
          sur_name: updateData.sur_name || user.sur_name,
          email: updateData.email || user.email,
          phone_number: updateData.phone_number || user.phone_number,
          gender: updateData.gender || user.gender,
          status: updateData.status || user.status,
          address: updateData.address || user.address,
        }, { transaction });
      }

      // Update/create bio data if provided
      if (updateData.bioData) {
        await BioData.upsert({
          user_id: id,
          ...updateData.bioData
        }, { transaction });
      }

      // Update/create personal employee data if provided
      if (updateData.personalEmployeeData) {
        await PersonalEmployeeData.upsert({
          user_id: id,
          ...updateData.personalEmployeeData
        }, { transaction });
      }

      // Update/create basic employee data if provided
      if (updateData.basicEmployeeData) {
        await BasicEmployeeData.upsert({
          user_id: id,
          ...updateData.basicEmployeeData
        }, { transaction });
      }

      // Handle emergency contacts (array format) if provided
      if (updateData.emergency_contacts && Array.isArray(updateData.emergency_contacts)) {
        // Remove existing emergency contacts
        await EmergencyContact.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new emergency contacts
        for (const contact of updateData.emergency_contacts) {
          if (contact.name && contact.phone_number) {
            await EmergencyContact.create({
              user_id: id,
              name: contact.name,
              phone_number: contact.phone_number,
              relationship: contact.relationship || 'Not specified',
            }, { transaction });
          }
        }
      }
      // Handle backward compatibility for single emergency contact
      else if (updateData.emergency_contact_name || updateData.emergency_contact_phone ||
        updateData.emergency_contact_relationship) {
        // Remove existing emergency contacts
        await EmergencyContact.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new emergency contact if data provided
        if (updateData.emergency_contact_name && updateData.emergency_contact_phone) {
          await EmergencyContact.create({
            user_id: id,
            name: updateData.emergency_contact_name,
            phone_number: updateData.emergency_contact_phone,
            relationship: updateData.emergency_contact_relationship || 'Not specified',
          }, { transaction });
        }
      }

      // Handle next of kin (array format) if provided
      if (updateData.next_of_kin && Array.isArray(updateData.next_of_kin)) {
        // Remove existing next of kin
        await NextOfKin.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new next of kin
        for (const kin of updateData.next_of_kin) {
          if (kin.name && kin.phone_number) {
            await NextOfKin.create({
              user_id: id,
              name: kin.name,
              phone_number: kin.phone_number,
              relationship: kin.relationship || 'Not specified',
              percentage: kin.percentage || 0,
            }, { transaction });
          }
        }
      }
      // Handle backward compatibility for single next of kin
      else if (updateData.next_of_kin_name || updateData.next_of_kin_phone ||
        updateData.next_of_kin_relationship) {
        // Remove existing next of kin
        await NextOfKin.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new next of kin if data provided
        if (updateData.next_of_kin_name && updateData.next_of_kin_phone) {
          await NextOfKin.create({
            user_id: id,
            name: updateData.next_of_kin_name,
            phone_number: updateData.next_of_kin_phone,
            relationship: updateData.next_of_kin_relationship || 'Not specified',
            percentage: 100,
          }, { transaction });
        }
      }

      // Update roles if provided
      if (updateData.role_ids && Array.isArray(updateData.role_ids)) {
        // Delete current roles
        await UserRole.destroy({
          where: { user_id: id },
          transaction
        });

        // Add new roles
        for (const roleId of updateData.role_ids) {
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

      return successResponse(
        res,
        StatusCodes.OK,
        'Employee data updated successfully',
        updatedUser
      );

    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Update employee partial error:', error);
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateEmployeePartial
};