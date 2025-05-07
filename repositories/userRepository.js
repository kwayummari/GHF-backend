const { Op } = require('sequelize');
const User = require('../models/User');

/**
 * Find a user by ID
 * @param {number} id - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - User object
 */
const findById = async (id, options = {}) => {
  const { includePassword = false } = options;
  
  const attributes = includePassword ? undefined : { exclude: ['password'] };
  
  return User.findByPk(id, { attributes });
};

/**
 * Find a user by email
 * @param {string} email - User email
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - User object
 */
const findByEmail = async (email, options = {}) => {
  const { includePassword = false } = options;
  
  const attributes = includePassword ? undefined : { exclude: ['password'] };
  
  return User.findOne({
    where: { email },
    attributes,
  });
};

/**
 * Find a user by username
 * @param {string} username - Username
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - User object
 */
const findByUsername = async (username, options = {}) => {
  const { includePassword = false } = options;
  
  const attributes = includePassword ? undefined : { exclude: ['password'] };
  
  return User.findOne({
    where: { username },
    attributes,
  });
};

/**
 * Find users by role
 * @param {string} role - User role
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of user objects
 */
const findByRole = async (role, options = {}) => {
  const { limit = 10, offset = 0 } = options;
  
  return User.findAndCountAll({
    where: { role },
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Search users
 * @param {Object} filters - Search filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Search results
 */
const search = async (filters = {}, options = {}) => {
  const {
    keyword,
    role,
    isActive,
    createdBefore,
    createdAfter,
  } = filters;
  
  const { limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
  
  const where = {};
  
  // Apply filters
  if (keyword) {
    where[Op.or] = [
      { username: { [Op.like]: `%${keyword}%` } },
      { email: { [Op.like]: `%${keyword}%` } },
      { firstName: { [Op.like]: `%${keyword}%` } },
      { lastName: { [Op.like]: `%${keyword}%` } },
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  if (createdBefore) {
    where.createdAt = { ...where.createdAt, [Op.lt]: createdBefore };
  }
  
  if (createdAfter) {
    where.createdAt = { ...where.createdAt, [Op.gt]: createdAfter };
  }
  
  // Execute query
  const result = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [[sortBy, sortOrder]],
  });
  
  // Calculate pagination info
  const totalItems = result.count;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  
  return {
    users: result.rows,
    pagination: {
      page: currentPage,
      limit,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
const create = async (userData) => {
  return User.create(userData);
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user
 */
const update = async (id, userData) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    return null;
  }
  
  await user.update(userData);
  
  // Return updated user without password
  return user.toJSON();
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - Whether the user was deleted
 */
const remove = async (id) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    return false;
  }
  
  await user.destroy();
  return true;
};

module.exports = {
  findById,
  findByEmail,
  findByUsername,
  findByRole,
  search,
  create,
  update,
  remove,
};