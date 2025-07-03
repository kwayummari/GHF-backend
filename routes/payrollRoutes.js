const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateJoi } = require('../middlewares/validateRequest');
const { 
  payrollSchema,
  payrollUpdateSchema,
  payrollProcessingSchema,
  payrollApprovalSchema,
  payrollRejectionSchema,
  salaryComponentSchema,
  payrollStatisticsSchema,
  payrollQuerySchema
} = require('../validators/payrollValidator');

/**
 * Payroll Management Routes
 * Handles all payroll-related operations including salary calculations,
 * payroll generation, and payroll history management
 */

// ==================== PAYROLL RECORDS MANAGEMENT ====================

/**
 * @route   GET /api/v1/payroll
 * @desc    Get all payroll records with filtering and pagination
 * @access  Private (HR, Finance, Admin)
 */
router.get('/', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollQuerySchema, 'query'),
  payrollController.getAllPayrolls
);

/**
 * @route   GET /api/v1/payroll/:id
 * @desc    Get payroll record by ID
 * @access  Private (HR, Finance, Admin, Employee - own payroll)
 */
router.get('/:id', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager', 'user']),
  payrollController.getPayrollById
);

/**
 * @route   POST /api/v1/payroll
 * @desc    Create a new payroll record
 * @access  Private (HR, Finance, Admin)
 */
router.post('/', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollSchema, 'body'),
  payrollController.createPayroll
);

/**
 * @route   PUT /api/v1/payroll/:id
 * @desc    Update payroll record
 * @access  Private (HR, Finance, Admin)
 */
router.put('/:id', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollUpdateSchema, 'body'),
  payrollController.updatePayroll
);

/**
 * @route   DELETE /api/v1/payroll/:id
 * @desc    Delete payroll record
 * @access  Private (HR, Finance, Admin)
 */
router.delete('/:id', 
  authenticate, 
  authorize(['admin', 'finance_manager']),
  payrollController.deletePayroll
);

// ==================== PAYROLL PROCESSING ====================

/**
 * @route   POST /api/v1/payroll/process
 * @desc    Process payroll for multiple employees
 * @access  Private (HR, Finance, Admin)
 */
router.post('/process', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollProcessingSchema, 'body'),
  payrollController.processPayroll
);

/**
 * @route   POST /api/v1/payroll/:id/reprocess
 * @desc    Reprocess specific payroll record
 * @access  Private (HR, Finance, Admin)
 */
router.post('/:id/reprocess', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.reprocessPayroll
);

// ==================== PAYROLL APPROVAL WORKFLOW ====================

/**
 * @route   PUT /api/v1/payroll/:id/approve
 * @desc    Approve payroll record
 * @access  Private (HR, Finance, Admin)
 */
router.put('/:id/approve', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollApprovalSchema, 'body'),
  payrollController.approvePayroll
);

/**
 * @route   PUT /api/v1/payroll/:id/reject
 * @desc    Reject payroll record
 * @access  Private (HR, Finance, Admin)
 */
router.put('/:id/reject', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollRejectionSchema, 'body'),
  payrollController.rejectPayroll
);

/**
 * @route   POST /api/v1/payroll/bulk-approve
 * @desc    Bulk approve payroll records
 * @access  Private (HR, Finance, Admin)
 */
router.post('/bulk-approve', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.bulkApprovePayroll
);

// ==================== EMPLOYEE PAYROLL ====================

/**
 * @route   GET /api/v1/payroll/employee/:employeeId
 * @desc    Get payroll records for specific employee
 * @access  Private (HR, Finance, Admin, Employee - own records)
 */
router.get('/employee/:employeeId', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager', 'user']),
  payrollController.getEmployeePayrollHistory
);

/**
 * @route   GET /api/v1/payroll/period/:year/:month
 * @desc    Get payroll records for specific period
 * @access  Private (HR, Finance, Admin)
 */
router.get('/period/:year/:month', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.getPayrollByPeriod
);

// ==================== SALARY COMPONENTS ====================

/**
 * @route   GET /api/v1/payroll/salary-components
 * @desc    Get all salary components
 * @access  Private (HR, Finance, Admin)
 */
router.get('/salary-components', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.getAllSalaryComponents
);

/**
 * @route   GET /api/v1/payroll/salary-components/user/:userId
 * @desc    Get salary components for specific user
 * @access  Private (HR, Finance, Admin, User - own components)
 */
router.get('/salary-components/user/:userId', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager', 'user']),
  payrollController.getSalaryComponentsByUser
);

/**
 * @route   POST /api/v1/payroll/salary-components
 * @desc    Create salary component
 * @access  Private (HR, Finance, Admin)
 */
router.post('/salary-components', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(salaryComponentSchema, 'body'),
  payrollController.createSalaryComponent
);

/**
 * @route   PUT /api/v1/payroll/salary-components/:id
 * @desc    Update salary component
 * @access  Private (HR, Finance, Admin)
 */
router.put('/salary-components/:id', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(salaryComponentSchema, 'body'),
  payrollController.updateSalaryComponent
);

/**
 * @route   DELETE /api/v1/payroll/salary-components/:id
 * @desc    Delete salary component
 * @access  Private (HR, Finance, Admin)
 */
router.delete('/salary-components/:id', 
  authenticate, 
  authorize(['admin', 'finance_manager']),
  payrollController.deleteSalaryComponent
);

/**
 * @route   POST /api/v1/payroll/salary-components/assign
 * @desc    Assign salary component to user
 * @access  Private (HR, Finance, Admin)
 */
router.post('/salary-components/assign', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.assignSalaryComponent
);

// ==================== PAYSLIP MANAGEMENT ====================

/**
 * @route   GET /api/v1/payroll/payslips
 * @desc    Get all payslips
 * @access  Private (HR, Finance, Admin)
 */
router.get('/payslips', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.getAllPayslips
);

/**
 * @route   GET /api/v1/payroll/payslips/:id
 * @desc    Get payslip by ID
 * @access  Private (HR, Finance, Admin, Employee - own payslip)
 */
router.get('/payslips/:id', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager', 'user']),
  payrollController.getPayslipById
);

/**
 * @route   GET /api/v1/payroll/payslips/:id/pdf
 * @desc    Generate payslip PDF
 * @access  Private (HR, Finance, Admin, Employee - own payslip)
 */
router.get('/payslips/:id/pdf', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager', 'user']),
  payrollController.generatePayslipPDF
);

/**
 * @route   POST /api/v1/payroll/payslips/:id/send
 * @desc    Send payslip to employee
 * @access  Private (HR, Finance, Admin)
 */
router.post('/payslips/:id/send', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.sendPayslip
);

// ==================== REPORTS & ANALYTICS ====================

/**
 * @route   GET /api/v1/payroll/statistics
 * @desc    Get payroll statistics
 * @access  Private (HR, Finance, Admin)
 */
router.get('/statistics', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  validateJoi(payrollStatisticsSchema, 'query'),
  payrollController.getPayrollStatistics
);

/**
 * @route   GET /api/v1/payroll/reports
 * @desc    Get payroll reports
 * @access  Private (HR, Finance, Admin)
 */
router.get('/reports', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.getPayrollReports
);

/**
 * @route   GET /api/v1/payroll/export
 * @desc    Export payroll data
 * @access  Private (HR, Finance, Admin)
 */
router.get('/export', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.exportPayrollData
);

/**
 * @route   GET /api/v1/payroll/summary
 * @desc    Get payroll summary
 * @access  Private (HR, Finance, Admin)
 */
router.get('/summary', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.getPayrollSummary
);

// ==================== CALCULATIONS & PREVIEW ====================

/**
 * @route   GET /api/v1/payroll/preview
 * @desc    Get calculation preview
 * @access  Private (HR, Finance, Admin)
 */
router.get('/preview', 
  authenticate, 
  authorize(['admin', 'finance_manager', 'hr_manager']),
  payrollController.getCalculationPreview
);

// ==================== SETTINGS ====================

/**
 * @route   GET /api/v1/payroll/settings
 * @desc    Get payroll settings
 * @access  Private (HR, Finance, Admin)
 */
router.get('/settings', 
  authenticate, 
  authorize(['admin', 'finance_manager']),
  payrollController.getPayrollSettings
);

/**
 * @route   PUT /api/v1/payroll/settings
 * @desc    Update payroll settings
 * @access  Private (HR, Finance, Admin)
 */
router.put('/settings', 
  authenticate, 
  authorize(['admin', 'finance_manager']),
  payrollController.updatePayrollSettings
);

module.exports = router; 