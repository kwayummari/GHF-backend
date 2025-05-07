/**
 * Format a date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatISODate = (date) => {
  return date instanceof Date ? date.toISOString() : null;
};

/**
 * Format a date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date to locale string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale (default: 'en-US')
 * @param {Object} options - Format options
 * @returns {string} - Formatted date string
 */
const formatLocaleDate = (date, locale = 'en-US', options = {}) => {
  if (!(date instanceof Date)) {
    return null;
  }
  
  return date.toLocaleDateString(locale, options);
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is today
 */
const isToday = (date) => {
  if (!(date instanceof Date)) {
    return false;
  }
  
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Add days to a date
 * @param {Date} date - Start date
 * @param {number} days - Number of days to add
 * @returns {Date} - Resulting date
 */
const addDays = (date, days) => {
  if (!(date instanceof Date)) {
    return null;
  }
  
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} - Number of days difference
 */
const dayDiff = (date1, date2) => {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    return null;
  }
  
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is in the past
 */
const isPast = (date) => {
  if (!(date instanceof Date)) {
    return false;
  }
  
  return date < new Date();
};

/**
 * Check if a date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is in the future
 */
const isFuture = (date) => {
  if (!(date instanceof Date)) {
    return false;
  }
  
  return date > new Date();
};

module.exports = {
  formatISODate,
  formatDate,
  formatLocaleDate,
  isToday,
  addDays,
  dayDiff,
  isPast,
  isFuture,
};