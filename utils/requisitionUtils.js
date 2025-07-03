const { PurchaseRequest } = require('../models');
const logger = require('./logger');

/**
 * Generate unique requisition number
 * Format: REQ-YYYY-XXX (e.g., REQ-2024-001)
 */
const generateRequisitionNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `REQ-${currentYear}-`;
    
    // Find the last requisition number for this year
    const lastRequisition = await PurchaseRequest.findOne({
      where: {
        requisition_number: {
          [require('sequelize').Op.like]: `${yearPrefix}%`
        }
      },
      order: [['requisition_number', 'DESC']]
    });

    let sequence = 1;
    if (lastRequisition) {
      const lastNumber = lastRequisition.requisition_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    // Format with leading zeros
    const formattedSequence = sequence.toString().padStart(3, '0');
    return `${yearPrefix}${formattedSequence}`;
  } catch (error) {
    logger.error('Error generating requisition number:', error);
    // Fallback to timestamp-based number
    const timestamp = Date.now();
    return `REQ-${new Date().getFullYear()}-${timestamp.toString().slice(-3)}`;
  }
};

/**
 * Validate requisition data
 */
const validateRequisitionData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!data.department_id) {
    errors.push({ field: 'department_id', message: 'Department is required' });
  }

  if (!data.required_date) {
    errors.push({ field: 'required_date', message: 'Required date is required' });
  } else {
    const requiredDate = new Date(data.required_date);
    const today = new Date();
    if (requiredDate < today) {
      errors.push({ field: 'required_date', message: 'Required date cannot be in the past' });
    }
  }

  if (!data.estimated_cost || data.estimated_cost <= 0) {
    errors.push({ field: 'estimated_cost', message: 'Estimated cost must be greater than 0' });
  }

  if (data.items && Array.isArray(data.items)) {
    data.items.forEach((item, index) => {
      if (!item.item_name || item.item_name.trim().length === 0) {
        errors.push({ field: `items[${index}].item_name`, message: 'Item name is required' });
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be greater than 0' });
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors.push({ field: `items[${index}].unit_price`, message: 'Unit price must be greater than 0' });
      }
    });
  }

  return errors;
};

/**
 * Calculate total cost from items
 */
const calculateTotalCost = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const quantity = parseInt(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return total + (quantity * unitPrice);
  }, 0);
};

/**
 * Check if user can approve requisition
 */
const canApproveRequisition = (user, requisition) => {
  // Admin and finance managers can approve any requisition
  if (['admin', 'finance_manager'].includes(user.role)) {
    return true;
  }

  // Department heads can approve requisitions from their department
  if (user.role === 'department_head' && user.department_id === requisition.department_id) {
    return true;
  }

  return false;
};

/**
 * Get next approver for requisition
 */
const getNextApprover = async (requisition, currentStage) => {
  // This is a simplified implementation
  // In a real system, this would be based on organizational hierarchy and approval matrix
  
  const totalStages = requisition.total_stages;
  
  if (currentStage >= totalStages) {
    return null; // No more approvals needed
  }

  // For now, return the finance manager as the next approver
  // This should be replaced with actual business logic
  return {
    id: 1, // This should be the actual user ID
    role: 'finance_manager',
    name: 'Finance Manager'
  };
};

module.exports = {
  generateRequisitionNumber,
  validateRequisitionData,
  calculateTotalCost,
  canApproveRequisition,
  getNextApprover
}; 