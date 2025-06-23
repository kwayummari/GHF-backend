const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.EMAIL.SMTP_HOST,
  port: config.EMAIL.SMTP_PORT,
  secure: Number(config.EMAIL.SMTP_PORT) === 465,
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