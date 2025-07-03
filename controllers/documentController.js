const { Document, DocumentCategory, DocumentVersion } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

class DocumentController {
  // Get all documents
  static async getAllDocuments(req, res) {
    try {
      const { categoryId, status, search } = req.query;
      const where = {};

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.title = {
          [Op.iLike]: `%${search}%`
        };
      }

      const documents = await Document.findAll({
        where,
        include: [
          {
            model: DocumentCategory,
            as: 'category'
          },
          {
            model: User,
            as: 'creator'
          },
          {
            model: User,
            as: 'approver'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.json(documents);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Upload a new document
  static async uploadDocument(req, res) {
    try {
      const { userId } = req.user;
      const { title, description, category_id, version } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Create document
      const document = await Document.create({
        title,
        description,
        category_id,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        version,
        created_by: userId
      });

      // Create first version
      await DocumentVersion.create({
        document_id: document.id,
        version,
        filePath: file.path,
        changes: 'Initial version',
        created_by: userId
      });

      return res.json(document);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get document versions
  static async getDocumentVersions(req, res) {
    try {
      const { documentId } = req.params;
      const versions = await DocumentVersion.findAll({
        where: {
          document_id: documentId
        },
        include: [
          {
            model: User,
            as: 'creator'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json(versions);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update document
  static async updateDocument(req, res) {
    try {
      const { documentId } = req.params;
      const { title, description, category_id, version, changes } = req.body;
      const file = req.file;

      const document = await Document.findByPk(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Update document
      await document.update({
        title,
        description,
        category_id,
        version
      });

      // Create new version if file is uploaded
      if (file) {
        // Create new version
        await DocumentVersion.create({
          document_id: documentId,
          version,
          filePath: file.path,
          changes,
          created_by: req.user.id
        });

        // Delete old file
        await fs.unlink(document.filePath);
        await document.update({ filePath: file.path });
      }

      return res.json(document);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete document
  static async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const document = await Document.findByPk(documentId);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete file
      await fs.unlink(document.filePath);

      // Delete document and its versions
      await DocumentVersion.destroy({
        where: {
          document_id: documentId
        }
      });

      await document.destroy();

      return res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = DocumentController;
