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