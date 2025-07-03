const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { 
  PurchaseRequest, 
  RequisitionItem, 
  RequisitionAttachment, 
  RequisitionWorkflow,
  User, 
  Department, 
  Budget 
} = require('../models');
const logger = require('../utils/logger');
const { generateRequisitionNumber } = require('../utils/requisitionUtils');

// ==================== CORE CRUD OPERATIONS ====================

/**
 * Get all purchase requests with filtering and pagination
 */
exports.getAllPurchaseRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      department_id,
      budget_id,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (department_id) whereClause.department_id = department_id;
    if (budget_id) whereClause.budget_id = budget_id;

    // Date range filter
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { requisition_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await PurchaseRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        },
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: RequisitionItem,
          as: 'items',
          attributes: ['id', 'item_name', 'quantity', 'unit_price', 'total_price']
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    // Transform data to match API documentation format
    const requisitions = rows.map(req => ({
      id: req.id,
      requisition_number: req.requisition_number,
      title: req.title,
      description: req.description,
      department_id: req.department_id,
      department_name: req.department?.department_name,
      requested_by: req.requested_by,
      requester_name: req.requester ? `${req.requester.firstName} ${req.requester.lastName}` : '',
      priority: req.priority,
      required_date: req.required_date,
      created_date: req.created_at,
      estimated_cost: req.estimated_cost,
      actual_cost: req.actual_cost,
      status: req.status,
      approval_stage: req.approval_stage,
      total_stages: req.total_stages,
      budget_id: req.budget_id,
      budget_code: req.budget?.activity_name,
      justification: req.justification,
      notes: req.notes,
      approved_by: req.approved_by,
      approver_name: req.approved_by_user ? `${req.approved_by_user.firstName} ${req.approved_by_user.lastName}` : '',
      approved_date: req.approved_date,
      items_count: req.items?.length || 0
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        requisitions,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error in getAllPurchaseRequests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve purchase requests',
      error: error.message
    });
  }
};

/**
 * Get purchase request by ID
 */
exports.getPurchaseRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseRequest = await PurchaseRequest.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Budget,
          as: 'budget',
          attributes: ['id', 'activity_name', 'amount']
        },
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'rejected_by_user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: RequisitionItem,
          as: 'items',
          attributes: ['id', 'item_name', 'description', 'quantity', 'unit_price', 'total_price', 'specifications', 'category', 'supplier_preference', 'brand', 'model', 'unit_of_measure']
        },
        {
          model: RequisitionAttachment,
          as: 'attachments',
          attributes: ['id', 'filename', 'file_path', 'file_size', 'mime_type', 'description', 'category', 'upload_date']
        }
      ]
    });

    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Purchase request not found'
      });
    }

    // Transform data to match API documentation format
    const requisition = {
      id: purchaseRequest.id,
      requisition_number: purchaseRequest.requisition_number,
      title: purchaseRequest.title,
      description: purchaseRequest.description,
      department_id: purchaseRequest.department_id,
      department_name: purchaseRequest.department?.department_name,
      requested_by: purchaseRequest.requested_by,
      requester_name: purchaseRequest.requester ? `${purchaseRequest.requester.firstName} ${purchaseRequest.requester.lastName}` : '',
      priority: purchaseRequest.priority,
      required_date: purchaseRequest.required_date,
      created_date: purchaseRequest.created_at,
      estimated_cost: purchaseRequest.estimated_cost,
      actual_cost: purchaseRequest.actual_cost,
      status: purchaseRequest.status,
      approval_stage: purchaseRequest.approval_stage,
      total_stages: purchaseRequest.total_stages,
      budget_id: purchaseRequest.budget_id,
      budget_code: purchaseRequest.budget?.activity_name,
      justification: purchaseRequest.justification,
      notes: purchaseRequest.notes,
      approved_by: purchaseRequest.approved_by,
      approver_name: purchaseRequest.approved_by_user ? `${purchaseRequest.approved_by_user.firstName} ${purchaseRequest.approved_by_user.lastName}` : '',
      approved_date: purchaseRequest.approved_date,
      rejected_by: purchaseRequest.rejected_by,
      rejector_name: purchaseRequest.rejected_by_user ? `${purchaseRequest.rejected_by_user.firstName} ${purchaseRequest.rejected_by_user.lastName}` : '',
      rejected_date: purchaseRequest.rejected_date,
      rejection_reason: purchaseRequest.rejection_reason,
      items: purchaseRequest.items || [],
      attachments: purchaseRequest.attachments || []
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: requisition
    });
  } catch (error) {
    logger.error('Error in getPurchaseRequestById:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve purchase request',
      error: error.message
    });
  }
};

/**
 * Create purchase request
 */
exports.createPurchaseRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      department_id,
      priority,
      required_date,
      budget_id,
      estimated_cost,
      justification,
      notes,
      items
    } = req.body;

    // Validate required fields
    if (!title || !department_id || !required_date || !estimated_cost) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: [
            { field: 'title', message: 'Title is required' },
            { field: 'department_id', message: 'Department is required' },
            { field: 'required_date', message: 'Required date is required' },
            { field: 'estimated_cost', message: 'Estimated cost is required' }
          ]
        }
      });
    }

    // Check if department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Department not found'
        }
      });
    }

    // Check if budget exists (if provided)
    if (budget_id) {
      const budget = await Budget.findByPk(budget_id);
      if (!budget) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Budget not found'
          }
        });
      }
    }

    // Generate requisition number
    const requisitionNumber = await generateRequisitionNumber();

    // Create purchase request
    const purchaseRequest = await PurchaseRequest.create({
      requisition_number: requisitionNumber,
      title,
      description,
      department_id,
      requested_by: req.user.id,
      priority: priority || 'medium',
      required_date,
      budget_id,
      estimated_cost,
      justification,
      notes,
      status: 'draft',
      approval_stage: 0,
      total_stages: 1
    });

    // Create requisition items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      const requisitionItems = items.map(item => ({
        purchase_request_id: purchaseRequest.id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        specifications: item.specifications,
        category: item.category,
        supplier_preference: item.supplier_preference,
        brand: item.brand,
        model: item.model,
        unit_of_measure: item.unit_of_measure || 'piece'
      }));

      await RequisitionItem.bulkCreate(requisitionItems);
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Purchase request created successfully',
      data: {
        id: purchaseRequest.id,
        requisition_number: purchaseRequest.requisition_number,
        status: purchaseRequest.status,
        created_date: purchaseRequest.created_at
      }
    });
  } catch (error) {
    logger.error('Error in createPurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create purchase request',
      error: error.message
    });
  }
};

/**
 * Update purchase request
 */
exports.updatePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      department_id,
      priority,
      required_date,
      budget_id,
      estimated_cost,
      justification,
      notes,
      items
    } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase request not found'
        }
      });
    }

    // Check if purchase request can be updated (only draft status can be updated)
    if (purchaseRequest.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WORKFLOW_ERROR',
          message: 'Only draft purchase requests can be updated'
        }
      });
    }

    // Check if user owns the purchase request or is admin
    if (purchaseRequest.requested_by !== req.user.id && !['admin', 'finance_manager'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own purchase requests'
        }
      });
    }

    // Update purchase request
    await purchaseRequest.update({
      title,
      description,
      department_id,
      priority,
      required_date,
      budget_id,
      estimated_cost,
      justification,
      notes
    });

    // Update requisition items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await RequisitionItem.destroy({
        where: { purchase_request_id: id }
      });

      // Create new items
      if (items.length > 0) {
        const requisitionItems = items.map(item => ({
          purchase_request_id: id,
          item_name: item.item_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          specifications: item.specifications,
          category: item.category,
          supplier_preference: item.supplier_preference,
          brand: item.brand,
          model: item.model,
          unit_of_measure: item.unit_of_measure || 'piece'
        }));

        await RequisitionItem.bulkCreate(requisitionItems);
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request updated successfully',
      data: {
        id: purchaseRequest.id,
        requisition_number: purchaseRequest.requisition_number,
        status: purchaseRequest.status,
        updated_date: purchaseRequest.updated_at
      }
    });
  } catch (error) {
    logger.error('Error in updatePurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update purchase request',
      error: error.message
    });
  }
};

/**
 * Delete purchase request
 */
exports.deletePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase request not found'
        }
      });
    }

    // Check if purchase request can be deleted (only draft status can be deleted)
    if (purchaseRequest.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WORKFLOW_ERROR',
          message: 'Only draft purchase requests can be deleted'
        }
      });
    }

    // Check if user owns the purchase request or is admin
    if (purchaseRequest.requested_by !== req.user.id && !['admin', 'finance_manager'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own purchase requests'
        }
      });
    }

    await purchaseRequest.destroy();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deletePurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete purchase request',
      error: error.message
    });
  }
};

// ==================== WORKFLOW & APPROVAL OPERATIONS ====================

/**
 * Submit for approval
 */
exports.submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase request not found'
        }
      });
    }

    // Check if purchase request can be submitted (only draft status can be submitted)
    if (purchaseRequest.status !== 'draft') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WORKFLOW_ERROR',
          message: 'Only draft purchase requests can be submitted'
        }
      });
    }

    // Check if user owns the purchase request
    if (purchaseRequest.requested_by !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only submit your own purchase requests'
        }
      });
    }

    // Update status to pending
    await purchaseRequest.update({
      status: 'pending',
      approval_stage: 1,
      submitted_at: new Date()
    });

    // Create workflow record
    await RequisitionWorkflow.create({
      purchase_request_id: id,
      stage: 1,
      stage_name: 'Department Head Approval',
      approver_role: 'Department Head',
      approver_id: req.user.id, // This should be the department head
      action: 'forwarded',
      comments: comments || 'Ready for department head approval',
      completed_date: new Date()
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request submitted for approval',
      data: {
        id: purchaseRequest.id,
        status: purchaseRequest.status,
        approval_stage: purchaseRequest.approval_stage,
        submitted_date: purchaseRequest.submitted_at
      }
    });
  } catch (error) {
    logger.error('Error in submitForApproval:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to submit purchase request',
      error: error.message
    });
  }
};

/**
 * Approve purchase request
 */
exports.approvePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, next_approver_id, conditions } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase request not found'
        }
      });
    }

    // Check if purchase request can be approved (only pending status can be approved)
    if (purchaseRequest.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WORKFLOW_ERROR',
          message: 'Only pending purchase requests can be approved'
        }
      });
    }

    // Check if user has approval permissions
    if (!['admin', 'finance_manager', 'department_head'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to approve purchase requests'
        }
      });
    }

    const currentStage = purchaseRequest.approval_stage;
    const totalStages = purchaseRequest.total_stages;

    // Determine if this is the final approval
    const isFinalApproval = currentStage >= totalStages;

    // Update purchase request
    if (isFinalApproval) {
      await purchaseRequest.update({
        status: 'approved',
        approved_by: req.user.id,
        approved_date: new Date()
      });
    } else {
      await purchaseRequest.update({
        approval_stage: currentStage + 1
      });
    }

    // Create workflow record
    await RequisitionWorkflow.create({
      purchase_request_id: id,
      stage: currentStage,
      stage_name: `Stage ${currentStage} Approval`,
      approver_role: req.user.role,
      approver_id: req.user.id,
      action: isFinalApproval ? 'approved' : 'forwarded',
      comments,
      conditions,
      next_approver_id: isFinalApproval ? null : next_approver_id,
      completed_date: new Date()
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: isFinalApproval ? 'Purchase request approved' : 'Purchase request forwarded to next stage',
      data: {
        id: purchaseRequest.id,
        status: purchaseRequest.status,
        approval_stage: purchaseRequest.approval_stage,
        approved_date: purchaseRequest.approved_date,
        approved_by: purchaseRequest.approved_by
      }
    });
  } catch (error) {
    logger.error('Error in approvePurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to approve purchase request',
      error: error.message
    });
  }
};

/**
 * Reject purchase request
 */
exports.rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comments, suggestions } = req.body;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase request not found'
        }
      });
    }

    // Check if purchase request can be rejected (only pending status can be rejected)
    if (purchaseRequest.status !== 'pending') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'WORKFLOW_ERROR',
          message: 'Only pending purchase requests can be rejected'
        }
      });
    }

    // Check if user has rejection permissions
    if (!['admin', 'finance_manager', 'department_head'].includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to reject purchase requests'
        }
      });
    }

    // Update purchase request
    await purchaseRequest.update({
      status: 'rejected',
      rejected_by: req.user.id,
      rejected_date: new Date(),
      rejection_reason: reason
    });

    // Create workflow record
    await RequisitionWorkflow.create({
      purchase_request_id: id,
      stage: purchaseRequest.approval_stage,
      stage_name: `Stage ${purchaseRequest.approval_stage} Rejection`,
      approver_role: req.user.role,
      approver_id: req.user.id,
      action: 'rejected',
      comments: `${comments || ''} ${suggestions ? `Suggestions: ${suggestions}` : ''}`.trim(),
      completed_date: new Date()
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Purchase request rejected',
      data: {
        id: purchaseRequest.id,
        status: purchaseRequest.status,
        rejected_date: purchaseRequest.rejected_date,
        rejected_by: purchaseRequest.rejected_by
      }
    });
  } catch (error) {
    logger.error('Error in rejectPurchaseRequest:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to reject purchase request',
      error: error.message
    });
  }
};

/**
 * Get approval workflow
 */
exports.getApprovalWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseRequest = await PurchaseRequest.findByPk(id);
    if (!purchaseRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase request not found'
        }
      });
    }

    const workflowHistory = await RequisitionWorkflow.findAll({
      where: { purchase_request_id: id },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'next_approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['stage', 'ASC'], ['completed_date', 'ASC']]
    });

    const stages = workflowHistory.map(record => ({
      stage: record.stage,
      name: record.stage_name,
      approver_role: record.approver_role,
      approver_id: record.approver_id,
      approver_name: record.approver ? `${record.approver.firstName} ${record.approver.lastName}` : '',
      status: record.action === 'approved' ? 'completed' : record.action === 'rejected' ? 'rejected' : 'pending',
      completed_date: record.completed_date,
      comments: record.comments
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        workflow_id: 1,
        workflow_name: 'Standard Purchase Request Workflow',
        stages,
        current_stage: purchaseRequest.approval_stage,
        total_stages: purchaseRequest.total_stages
      }
    });
  } catch (error) {
    logger.error('Error in getApprovalWorkflow:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve approval workflow',
      error: error.message
    });
  }
};

// ==================== SEARCH & FILTER OPERATIONS ====================

/**
 * Search purchase requests
 */
exports.searchPurchaseRequests = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      department_id,
      budget_id,
      date_from,
      date_to,
      amount_min,
      amount_max
    } = req.query;

    const whereClause = {};

    // Add filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (department_id) whereClause.department_id = department_id;
    if (budget_id) whereClause.budget_id = budget_id;

    // Date range filter
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    // Amount range filter
    if (amount_min || amount_max) {
      whereClause.estimated_cost = {};
      if (amount_min) whereClause.estimated_cost[Op.gte] = parseFloat(amount_min);
      if (amount_max) whereClause.estimated_cost[Op.lte] = parseFloat(amount_max);
    }

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { requisition_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const purchaseRequests = await PurchaseRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: purchaseRequests
    });
  } catch (error) {
    logger.error('Error in searchPurchaseRequests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to search purchase requests',
      error: error.message
    });
  }
};

// ==================== REPORTING & ANALYTICS ====================

/**
 * Get purchase request statistics
 */
exports.getPurchaseRequestStatistics = async (req, res) => {
  try {
    const { date_from, date_to, department_id } = req.query;

    const whereClause = {};
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }
    if (department_id) whereClause.department_id = department_id;

    const purchaseRequests = await PurchaseRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'department_name']
        }
      ]
    });

    // Calculate statistics
    const totalRequests = purchaseRequests.length;
    const totalAmount = purchaseRequests.reduce((sum, req) => sum + parseFloat(req.estimated_cost || 0), 0);
    
    const byStatus = {
      draft: purchaseRequests.filter(req => req.status === 'draft').length,
      pending: purchaseRequests.filter(req => req.status === 'pending').length,
      approved: purchaseRequests.filter(req => req.status === 'approved').length,
      rejected: purchaseRequests.filter(req => req.status === 'rejected').length,
      cancelled: purchaseRequests.filter(req => req.status === 'cancelled').length
    };

    const byPriority = {
      low: purchaseRequests.filter(req => req.priority === 'low').length,
      medium: purchaseRequests.filter(req => req.priority === 'medium').length,
      high: purchaseRequests.filter(req => req.priority === 'high').length,
      urgent: purchaseRequests.filter(req => req.priority === 'urgent').length
    };

    // Department breakdown
    const departmentBreakdown = {};
    purchaseRequests.forEach(req => {
      const deptName = req.department?.department_name || 'Unknown';
      if (!departmentBreakdown[deptName]) {
        departmentBreakdown[deptName] = {
          department_id: req.department_id,
          department_name: deptName,
          count: 0,
          amount: 0
        };
      }
      departmentBreakdown[deptName].count++;
      departmentBreakdown[deptName].amount += parseFloat(req.estimated_cost || 0);
    });

    const approvedRequests = purchaseRequests.filter(req => req.status === 'approved');
    const approvedAmount = approvedRequests.reduce((sum, req) => sum + parseFloat(req.estimated_cost || 0), 0);
    
    const pendingRequests = purchaseRequests.filter(req => req.status === 'pending');
    const pendingAmount = pendingRequests.reduce((sum, req) => sum + parseFloat(req.estimated_cost || 0), 0);
    
    const rejectedRequests = purchaseRequests.filter(req => req.status === 'rejected');
    const rejectedAmount = rejectedRequests.reduce((sum, req) => sum + parseFloat(req.estimated_cost || 0), 0);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        total_requests: totalRequests,
        total_amount: totalAmount,
        approved_requests: approvedRequests.length,
        approved_amount: approvedAmount,
        pending_requests: pendingRequests.length,
        pending_amount: pendingAmount,
        rejected_requests: rejectedRequests.length,
        rejected_amount: rejectedAmount,
        by_status: byStatus,
        by_priority: byPriority,
        by_department: Object.values(departmentBreakdown)
      }
    });
  } catch (error) {
    logger.error('Error in getPurchaseRequestStatistics:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve purchase request statistics',
      error: error.message
    });
  }
};

// ==================== BULK OPERATIONS ====================

/**
 * Bulk approve purchase requests
 */
exports.bulkApprovePurchaseRequests = async (req, res) => {
  try {
    const { request_ids, comments, approver_id } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request IDs array is required'
        }
      });
    }

    const results = {
      approved_count: 0,
      failed_count: 0,
      failed_requests: []
    };

    for (const requestId of request_ids) {
      try {
        const purchaseRequest = await PurchaseRequest.findByPk(requestId);
        
        if (!purchaseRequest) {
          results.failed_count++;
          results.failed_requests.push({
            id: requestId,
            reason: 'Purchase request not found'
          });
          continue;
        }

        if (purchaseRequest.status !== 'pending') {
          results.failed_count++;
          results.failed_requests.push({
            id: requestId,
            reason: 'Only pending requests can be approved'
          });
          continue;
        }

        // Approve the request
        await purchaseRequest.update({
          status: 'approved',
          approved_by: approver_id || req.user.id,
          approved_date: new Date()
        });

        // Create workflow record
        await RequisitionWorkflow.create({
          purchase_request_id: requestId,
          stage: purchaseRequest.approval_stage,
          stage_name: 'Bulk Approval',
          approver_role: req.user.role,
          approver_id: approver_id || req.user.id,
          action: 'approved',
          comments: comments || 'Bulk approval',
          completed_date: new Date()
        });

        results.approved_count++;
      } catch (error) {
        results.failed_count++;
        results.failed_requests.push({
          id: requestId,
          reason: error.message
        });
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${results.approved_count} purchase requests approved successfully`,
      data: results
    });
  } catch (error) {
    logger.error('Error in bulkApprovePurchaseRequests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to bulk approve purchase requests',
      error: error.message
    });
  }
};

/**
 * Bulk delete purchase requests
 */
exports.bulkDeletePurchaseRequests = async (req, res) => {
  try {
    const { request_ids, reason } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request IDs array is required'
        }
      });
    }

    const results = {
      deleted_count: 0,
      failed_count: 0,
      failed_requests: []
    };

    for (const requestId of request_ids) {
      try {
        const purchaseRequest = await PurchaseRequest.findByPk(requestId);
        
        if (!purchaseRequest) {
          results.failed_count++;
          results.failed_requests.push({
            id: requestId,
            reason: 'Purchase request not found'
          });
          continue;
        }

        if (purchaseRequest.status !== 'draft') {
          results.failed_count++;
          results.failed_requests.push({
            id: requestId,
            reason: 'Only draft requests can be deleted'
          });
          continue;
        }

        if (purchaseRequest.requested_by !== req.user.id && !['admin', 'finance_manager'].includes(req.user.role)) {
          results.failed_count++;
          results.failed_requests.push({
            id: requestId,
            reason: 'Insufficient permissions'
          });
          continue;
        }

        await purchaseRequest.destroy();
        results.deleted_count++;
      } catch (error) {
        results.failed_count++;
        results.failed_requests.push({
          id: requestId,
          reason: error.message
        });
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${results.deleted_count} purchase requests deleted successfully`,
      data: results
    });
  } catch (error) {
    logger.error('Error in bulkDeletePurchaseRequests:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to bulk delete purchase requests',
      error: error.message
    });
  }
}; 