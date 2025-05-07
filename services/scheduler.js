const schedule = require('node-schedule');
const logger = require('../utils/logger');

// Store all scheduled jobs
const jobs = {};

/**
 * Schedule a new job
 * @param {string} name - Unique job name
 * @param {string|Object|Date} rule - Scheduling rule
 * @param {Function} callback - Function to execute
 * @returns {Object} - Scheduled job
 */
const scheduleJob = (name, rule, callback) => {
  try {
    // Cancel existing job with the same name if exists
    if (jobs[name]) {
      cancelJob(name);
    }
    
    // Create new job
    const job = schedule.scheduleJob(name, rule, async () => {
      try {
        logger.info(`Running scheduled job: ${name}`);
        await callback();
        logger.info(`Completed scheduled job: ${name}`);
      } catch (error) {
        logger.error(`Error in scheduled job ${name}:`, error);
      }
    });
    
    jobs[name] = job;
    logger.info(`Scheduled job: ${name} with rule: ${rule}`);
    
    return job;
  } catch (error) {
    logger.error(`Error scheduling job ${name}:`, error);
    throw error;
  }
};

/**
 * Cancel a scheduled job
 * @param {string} name - Job name
 * @returns {boolean} - Whether job was cancelled
 */
const cancelJob = (name) => {
  if (jobs[name]) {
    const result = jobs[name].cancel();
    delete jobs[name];
    logger.info(`Cancelled scheduled job: ${name}`);
    return result;
  }
  
  logger.warn(`Attempted to cancel non-existent job: ${name}`);
  return false;
};

/**
 * List all scheduled jobs
 * @returns {Object} - Object with job names and their next invocation dates
 */
const listJobs = () => {
  const jobList = {};
  
  Object.keys(jobs).forEach((name) => {
    jobList[name] = {
      nextInvocation: jobs[name].nextInvocation(),
    };
  });
  
  return jobList;
};

/**
 * Initialize common scheduled jobs
 */
const initScheduledJobs = () => {
  // Examples of common scheduled jobs
  
  // Daily database backup at 1 AM
  scheduleJob('dailyBackup', '0 1 * * *', async () => {
    // Implement backup logic here
    logger.info('Daily database backup completed');
  });
  
  // Clean temporary files weekly on Sunday at 2 AM
  scheduleJob('cleanTempFiles', '0 2 * * 0', async () => {
    // Implement file cleanup logic here
    logger.info('Temporary files cleaned');
  });
  
  // Send monthly reports on the 1st of each month at 6 AM
  scheduleJob('monthlyReports', '0 6 1 * *', async () => {
    // Implement report generation and sending logic here
    logger.info('Monthly reports sent');
  });
};

module.exports = {
  scheduleJob,
  cancelJob,
  listJobs,
  initScheduledJobs,
};