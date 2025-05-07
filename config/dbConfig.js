```

## config/dbConfig.js
```javascript
const { Sequelize } = require('sequelize');
const config = require('./config');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: config.DB.DIALECT,
    pool: config.DB.POOL,
    logging: config.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    timezone: '+00:00',
  }
);

module.exports = sequelize;
```

## config/swaggerConfig.js
```javascript
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Documentation',
      version: '1.0.0',
      description: 'API documentation for Express backend',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/${config.API_VERSION}`,
        description: 'Development server',
      },
      {
        url: `https://yourproductiondomain.com/api/${config.API_VERSION}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js'),
  ],
};

// Generate Swagger specification
const swaggerSpec = swaggerJsDoc(swaggerOptions);

// Export function to configure Swagger UI
const swaggerConfig = (app) => {
  // Serve Swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve Swagger specification as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  // Write Swagger spec to file for other tools
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(docsDir, 'api-docs.json'),
    JSON.stringify(swaggerSpec, null, 2)
  );
};

module.exports = swaggerConfig;
```

## services/mailer.js
```javascript
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.EMAIL.SMTP_HOST,
  port: config.EMAIL.SMTP_PORT,
  secure: config.EMAIL.SMTP_PORT === 465,
  auth: {
    user: config.EMAIL.SMTP_USER,
    pass: config.EMAIL.SMTP_PASS,
  },
});

// Template directory
const templateDir = path.join(process.cwd(), 'templates/emails');

/**
 * Load an email template and replace placeholders
 * @param {string} templateName - Template file name
 * @param {Object} data - Data to replace placeholders
 * @returns {string} - HTML content
 */
const getEmailTemplate = (templateName, data = {}) => {
  try {
    const templatePath = path.join(templateDir, `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key]);
    });
    
    return template;
  } catch (error) {
    logger.error(`Error loading email template: ${error}`);
    // Fallback to simple template
    return `
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            ${data.message || 'No content provided.'}
          </div>
        </body>
      </html>
    `;
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Nodemailer response
 */
const sendEmail = async (options) => {
  const {
    to,
    subject,
    template,
    templateData = {},
    text,
    html,
    attachments = [],
  } = options;
  
  try {
    let emailHtml = html;
    
    // Use template if provided
    if (template) {
      emailHtml = getEmailTemplate(template, templateData);
    }
    
    // Send email
    const mailOptions = {
      from: options.from || config.EMAIL.FROM,
      to,
      subject,
      text: text || 'Please view this email in an HTML-compatible email client.',
      html: emailHtml,
      attachments,
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
```

## services/pdfGenerator.js
```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create upload directory if it doesn't exist
const pdfDir = path.join(process.cwd(), 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

/**
 * Generate a PDF file
 * @param {Object} options - PDF options
 * @returns {Promise<string>} - Path to the generated PDF
 */
const generatePDF = (options) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        filename = `${crypto.randomBytes(8).toString('hex')}.pdf`,
        title,
        author = 'Express App',
        content,
        metadata = {},
      } = options;
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: title || 'Generated Document',
          Author: author,
          ...metadata,
        },
      });
      
      // Set output path
      const outputPath = path.join(pdfDir, filename);
      const stream = fs.createWriteStream(outputPath);
      
      // Handle stream events
      stream.on('error', (err) => {
        logger.error(`Error writing PDF: ${err}`);
        reject(err);
      });
      
      stream.on('finish', () => {
        logger.info(`PDF generated: ${outputPath}`);
        resolve(outputPath);
      });
      
      // Pipe PDF document to file
      doc.pipe(stream);
      
      // Add content
      if (typeof content === 'function') {
        content(doc);
      } else {
        // Default content if not provided as function
        doc.fontSize(25).text(title || 'Generated Document', { align: 'center' });
        doc.moveDown();
        
        if (content) {
          if (typeof content === 'string') {
            doc.fontSize(12).text(content, { align: 'justify' });
          } else if (Array.isArray(content)) {
            content.forEach((item) => {
              doc.fontSize(12).text(item, { align: 'justify' });
              doc.moveDown();
            });
          }
        }
      }
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      logger.error(`Error generating PDF: ${error}`);
      reject(error);
    }
  });
};

/**
 * Generate an invoice PDF
 * @param {Object} invoice - Invoice data
 * @returns {Promise<string>} - Path to the generated PDF
 */
const generateInvoicePDF = async (invoice) => {
  const filename = `invoice-${invoice.number}.pdf`;
  
  return generatePDF({
    filename,
    title: `Invoice #${invoice.number}`,
    author: invoice.company.name,
    content: (doc) => {
      // Header
      doc.fontSize(25).text(`Invoice #${invoice.number}`, { align: 'right' });
      doc.fontSize(12).text(`Date: ${invoice.date}`, { align: 'right' });
      doc.moveDown();
      
      // Company info
      doc.fontSize(15).text('From:');
      doc.fontSize(12).text(invoice.company.name);
      doc.text(invoice.company.address);
      doc.text(invoice.company.email);
      doc.moveDown();
      
      // Client info
      doc.fontSize(15).text('To:');
      doc.fontSize(12).text(invoice.client.name);
      doc.text(invoice.client.address);
      doc.text(invoice.client.email);
      doc.moveDown(2);
      
      // Items table
      const tableTop = doc.y;
      const itemX = 50;
      const descriptionX = 150;
      const quantityX = 320;
      const priceX = 400;
      const amountX = 470;
      
      // Table headers
      doc.fontSize(12).text('Item', itemX, tableTop);
      doc.text('Description', descriptionX, tableTop);
      doc.text('Qty', quantityX, tableTop);
      doc.text('Price', priceX, tableTop);
      doc.text('Amount', amountX, tableTop);
      
      // Draw header line
      doc.moveTo(50, tableTop + 20)
         .lineTo(550, tableTop + 20)
         .stroke();
      
      // Table rows
      let y = tableTop + 30;
      invoice.items.forEach((item) => {
        doc.fontSize(10).text(item.id, itemX, y);
        doc.text(item.description, descriptionX, y);
        doc.text(item.quantity.toString(), quantityX, y);
        doc.text(`$${item.price.toFixed(2)}`, priceX, y);
        doc.text(`$${(item.quantity * item.price).toFixed(2)}`, amountX, y);
        y += 20;
      });
      
      // Draw bottom line
      doc.moveTo(50, y)
         .lineTo(550, y)
         .stroke();
      
      // Total
      doc.fontSize(12).text('Subtotal:', 400, y + 20);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, amountX, y + 20);
      
      doc.text('Tax:', 400, y + 40);
      doc.text(`$${invoice.tax.toFixed(2)}`, amountX, y + 40);
      
      doc.fontSize(14).text('Total:', 400, y + 70);
      doc.text(`$${invoice.total.toFixed(2)}`, amountX, y + 70);
      
      // Footer
      doc.fontSize(10).text(
        'Thank you for your business!',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    },
  });
};

module.exports = {
  generatePDF,
  generateInvoicePDF,
};
```

## services/scheduler.js
```javascript
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
```

## models/index.js
```javascript
const Sequelize = require('sequelize');
const config = require('../config/config');
const sequelize = require('../config/dbConfig');
const logger = require('../utils/logger');

// Import models
const User = require('./User');
// Import other models here

// Initialize models
const models = {
  User,
  // Add other models here
};

// Associate models
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  ...models,
  testConnection,
};
```

## models/User.js
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const { hashPassword } = require('../utils/hashUtils');

/**
 * User model
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Date and time of last login
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was last updated
 */
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      is: /^[a-zA-Z0-9_]+$/,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 100],
    },
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  // Hash password before saving
  hooks: {
    beforeCreate: async (user) => {
      user.password = await hashPassword(user.password);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await hashPassword(user.password);
      }
    },
  },
});

// Instance methods
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Model associations
User.associate = (models) => {
  // Define associations here
  // Example: User.hasMany(models.Post);
};

module.exports = User;
```

## controllers/authController.js
```javascript
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { comparePassword } = require('../utils/hashUtils');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendEmail } = require('../services/mailer');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [{ email }, { username }],
      },
    });
    
    if (existingUser) {
      return errorResponse(
        res,
        StatusCodes.CONFLICT,
        'User already exists',
        [{ field: existingUser.email === email ? 'email' : 'username', message: 'Already in use' }]
      );
    }
    
    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });
    
    // Generate tokens
    const token = generateToken({ id: newUser.id });
    
    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Our Platform',
      template: 'welcome',
      templateData: {
        firstName,
        username,
      },
    });
    
    // Return response
    return successResponse(
      res,
      StatusCodes.CREATED,
      'User registered successfully',
      {
        user: newUser.toJSON(),
        token,
      }
    );
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists
    if (!user) {
      return errorResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        'Invalid credentials'
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return errorResponse(
        res,
        StatusCodes.FORBIDDEN,
        'Account is deactiv