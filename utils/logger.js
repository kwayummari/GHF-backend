const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Create log directory if it doesn't exist
const logDir = path.join(process.cwd(), config.LOG.DIR);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create file transport for daily rotation
const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, '%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
});

// Create error file transport
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, '%DATE%-error.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
    )
  ),
});

// Create the logger
const logger = winston.createLogger({
  level: config.LOG.LEVEL,
  format: logFormat,
  defaultMeta: { service: 'express-backend' },
  transports: [
    fileTransport,
    errorFileTransport,
    consoleTransport,
  ],
  exitOnError: false,
});

// Stream for Morgan
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;