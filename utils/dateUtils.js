/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * Format a date as localized string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale string (e.g., 'en-US')
 * @param {Object} options - Formatter options
 * @returns {string} - Formatted date
 */
const formatLocalDate = (date, locale = 'en-US', options = {}) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  return date.toLocaleDateString(locale, options);
};

/**
 * Calculate the difference in days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Number of days
 */
const dayDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set hours to 0 to ignore time differences
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds
  const diffTime = Math.abs(end - start);
  
  // Convert to days and add 1 to include both start and end days
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Check if a date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is in the past
 */
const isPastDate = (date) => {
  const now = new Date();
  const checkDate = new Date(date);
  
  // Set times to midnight for date comparison only
  now.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < now;
};

/**
 * Check if a date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is in the future
 */
const isFutureDate = (date) => {
  const now = new Date();
  const checkDate = new Date(date);
  
  // Set times to midnight for date comparison only
  now.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate > now;
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} - Whether the date is today
 */
const isToday = (date) => {
  const now = new Date();
  const checkDate = new Date(date);
  
  return (
    checkDate.getDate() === now.getDate() &&
    checkDate.getMonth() === now.getMonth() &&
    checkDate.getFullYear() === now.getFullYear()
  );
};

/**
 * Add days to a date
 * @param {Date} date - Date to modify
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get the name of the day of the week
 * @param {Date} date - Date to check
 * @returns {string} - Day name
 */
const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
};

module.exports = {
  formatDate,
  formatLocalDate,
  dayDifference,
  isPastDate,
  isFutureDate,
  isToday,
  addDays,
  getDayName,
};