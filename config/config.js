require('dotenv').config();

const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // Database configuration
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 3306,
    NAME: process.env.DB_NAME || 'ghf_db',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  
  // JWT configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Email configuration
  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST || 'smtp0101.titan.email',
    SMTP_PORT: process.env.SMTP_PORT || 465,
    SMTP_USER: process.env.SMTP_USER || 'noreply@ghf.or.tz',
    SMTP_PASS: process.env.SMTP_PASS || 'RO/We8&.e})WR-%',
    FROM: process.env.EMAIL_FROM || 'noreply@ghf.or.tz',
  },
  
  // Upload configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  
  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = config;