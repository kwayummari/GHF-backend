const logger = require('./logger');

/**
 * Payroll Utility Functions
 * Handles payroll calculations, validations, and common operations
 */

/**
 * Calculate gross salary from basic salary and allowances
 * @param {number} basicSalary - Basic salary amount
 * @param {Array} allowances - Array of allowance objects
 * @returns {number} Gross salary
 */
const calculateGrossSalary = (basicSalary, allowances = []) => {
  try {
    const totalAllowances = allowances.reduce((sum, allowance) => {
      return sum + parseFloat(allowance.amount || 0);
    }, 0);
    
    return parseFloat(basicSalary) + totalAllowances;
  } catch (error) {
    logger.error('Error calculating gross salary:', error);
    return parseFloat(basicSalary);
  }
};

/**
 * Calculate net salary from gross salary and deductions
 * @param {number} grossSalary - Gross salary amount
 * @param {Array} deductions - Array of deduction objects
 * @returns {number} Net salary
 */
const calculateNetSalary = (grossSalary, deductions = []) => {
  try {
    const totalDeductions = deductions.reduce((sum, deduction) => {
      return sum + parseFloat(deduction.amount || 0);
    }, 0);
    
    const netSalary = parseFloat(grossSalary) - totalDeductions;
    return Math.max(0, netSalary); // Ensure net salary is not negative
  } catch (error) {
    logger.error('Error calculating net salary:', error);
    return parseFloat(grossSalary);
  }
};

/**
 * Calculate PAYE tax based on gross salary
 * @param {number} grossSalary - Gross salary amount
 * @returns {number} PAYE tax amount
 */
const calculatePAYETax = (grossSalary) => {
  try {
    const salary = parseFloat(grossSalary);
    
    // Simplified Tanzanian PAYE calculation
    // This should be updated with actual tax brackets
    if (salary <= 270000) {
      return 0;
    } else if (salary <= 520000) {
      return (salary - 270000) * 0.08;
    } else if (salary <= 760000) {
      return 20000 + (salary - 520000) * 0.20;
    } else if (salary <= 1000000) {
      return 68000 + (salary - 760000) * 0.25;
    } else {
      return 128000 + (salary - 1000000) * 0.30;
    }
  } catch (error) {
    logger.error('Error calculating PAYE tax:', error);
    return 0;
  }
};

/**
 * Calculate NSSF contribution
 * @param {number} grossSalary - Gross salary amount
 * @returns {number} NSSF contribution amount
 */
const calculateNSSF = (grossSalary) => {
  try {
    const salary = parseFloat(grossSalary);
    const nssfRate = 0.10; // 10% NSSF rate
    const maxNSSF = 20000; // Maximum NSSF contribution
    
    const nssfAmount = salary * nssfRate;
    return Math.min(nssfAmount, maxNSSF);
  } catch (error) {
    logger.error('Error calculating NSSF:', error);
    return 0;
  }
};

/**
 * Calculate NHIF contribution
 * @param {number} grossSalary - Gross salary amount
 * @returns {number} NHIF contribution amount
 */
const calculateNHIF = (grossSalary) => {
  try {
    const salary = parseFloat(grossSalary);
    const nhifRate = 0.03; // 3% NHIF rate
    const maxNHIF = 30000; // Maximum NHIF contribution
    
    const nhifAmount = salary * nhifRate;
    return Math.min(nhifAmount, maxNHIF);
  } catch (error) {
    logger.error('Error calculating NHIF:', error);
    return 0;
  }
};

/**
 * Calculate overtime pay
 * @param {number} basicSalary - Basic salary amount
 * @param {number} overtimeHours - Number of overtime hours
 * @param {number} overtimeRate - Overtime rate multiplier
 * @returns {number} Overtime pay amount
 */
const calculateOvertimePay = (basicSalary, overtimeHours, overtimeRate = 1.5) => {
  try {
    const monthlyHours = 176; // Standard monthly working hours (22 days * 8 hours)
    const hourlyRate = parseFloat(basicSalary) / monthlyHours;
    const overtimePay = hourlyRate * overtimeHours * overtimeRate;
    
    return Math.max(0, overtimePay);
  } catch (error) {
    logger.error('Error calculating overtime pay:', error);
    return 0;
  }
};

/**
 * Validate payroll data
 * @param {Object} payrollData - Payroll data to validate
 * @returns {Object} Validation result
 */
const validatePayrollData = (payrollData) => {
  const errors = [];
  
  try {
    // Validate required fields
    if (!payrollData.employeeId) {
      errors.push('Employee ID is required');
    }
    
    if (!payrollData.month || payrollData.month < 1 || payrollData.month > 12) {
      errors.push('Valid month (1-12) is required');
    }
    
    if (!payrollData.year || payrollData.year < 2020 || payrollData.year > 2030) {
      errors.push('Valid year (2020-2030) is required');
    }
    
    if (!payrollData.basicSalary || payrollData.basicSalary <= 0) {
      errors.push('Valid basic salary is required');
    }
    
    // Validate allowances
    if (payrollData.allowances && Array.isArray(payrollData.allowances)) {
      payrollData.allowances.forEach((allowance, index) => {
        if (!allowance.name) {
          errors.push(`Allowance ${index + 1}: Name is required`);
        }
        if (!allowance.amount || allowance.amount < 0) {
          errors.push(`Allowance ${index + 1}: Valid amount is required`);
        }
      });
    }
    
    // Validate deductions
    if (payrollData.deductions && Array.isArray(payrollData.deductions)) {
      payrollData.deductions.forEach((deduction, index) => {
        if (!deduction.name) {
          errors.push(`Deduction ${index + 1}: Name is required`);
        }
        if (!deduction.amount || deduction.amount < 0) {
          errors.push(`Deduction ${index + 1}: Valid amount is required`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    logger.error('Error validating payroll data:', error);
    return {
      isValid: false,
      errors: ['Validation error occurred']
    };
  }
};

/**
 * Generate payroll number
 * @param {number} employeeId - Employee ID
 * @param {number} month - Month
 * @param {number} year - Year
 * @returns {string} Payroll number
 */
const generatePayrollNumber = (employeeId, month, year) => {
  try {
    const paddedEmployeeId = employeeId.toString().padStart(4, '0');
    const paddedMonth = month.toString().padStart(2, '0');
    const shortYear = year.toString().slice(-2);
    
    return `PAY${paddedEmployeeId}${paddedMonth}${shortYear}`;
  } catch (error) {
    logger.error('Error generating payroll number:', error);
    return `PAY${Date.now()}`;
  }
};

/**
 * Calculate payroll statistics
 * @param {Array} payrolls - Array of payroll records
 * @returns {Object} Statistics object
 */
const calculatePayrollStatistics = (payrolls) => {
  try {
    const stats = {
      totalPayrolls: payrolls.length,
      totalGrossPay: 0,
      totalNetPay: 0,
      totalDeductions: 0,
      averageGrossPay: 0,
      averageNetPay: 0,
      statusBreakdown: {},
      departmentBreakdown: {}
    };
    
    if (payrolls.length === 0) {
      return stats;
    }
    
    payrolls.forEach(payroll => {
      // Calculate totals
      stats.totalGrossPay += parseFloat(payroll.gross_salary || 0);
      stats.totalNetPay += parseFloat(payroll.net_salary || 0);
      
      // Calculate deductions
      const grossPay = parseFloat(payroll.gross_salary || 0);
      const netPay = parseFloat(payroll.net_salary || 0);
      stats.totalDeductions += (grossPay - netPay);
      
      // Status breakdown
      const status = payroll.status || 'unknown';
      stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
      
      // Department breakdown
      const deptName = payroll.employee?.department?.department_name || 'Unknown';
      if (!stats.departmentBreakdown[deptName]) {
        stats.departmentBreakdown[deptName] = {
          count: 0,
          totalGrossPay: 0,
          totalNetPay: 0
        };
      }
      stats.departmentBreakdown[deptName].count++;
      stats.departmentBreakdown[deptName].totalGrossPay += grossPay;
      stats.departmentBreakdown[deptName].totalNetPay += netPay;
    });
    
    // Calculate averages
    stats.averageGrossPay = stats.totalGrossPay / stats.totalPayrolls;
    stats.averageNetPay = stats.totalNetPay / stats.totalPayrolls;
    
    return stats;
  } catch (error) {
    logger.error('Error calculating payroll statistics:', error);
    return {
      totalPayrolls: 0,
      totalGrossPay: 0,
      totalNetPay: 0,
      totalDeductions: 0,
      averageGrossPay: 0,
      averageNetPay: 0,
      statusBreakdown: {},
      departmentBreakdown: {}
    };
  }
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: TZS)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'TZS') => {
  try {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  } catch (error) {
    logger.error('Error formatting currency:', error);
    return `${amount} ${currency}`;
  }
};

/**
 * Check if payroll can be approved
 * @param {Object} payroll - Payroll record
 * @param {Object} user - Current user
 * @returns {Object} Approval check result
 */
const canApprovePayroll = (payroll, user) => {
  try {
    const allowedRoles = ['admin', 'finance_manager', 'hr_manager'];
    
    if (!allowedRoles.includes(user.role)) {
      return {
        canApprove: false,
        reason: 'Insufficient permissions'
      };
    }
    
    if (payroll.status === 'approved') {
      return {
        canApprove: false,
        reason: 'Payroll is already approved'
      };
    }
    
    if (payroll.status === 'rejected') {
      return {
        canApprove: false,
        reason: 'Payroll is rejected and cannot be approved'
      };
    }
    
    if (payroll.status === 'paid') {
      return {
        canApprove: false,
        reason: 'Payroll is already paid'
      };
    }
    
    return {
      canApprove: true,
      reason: null
    };
  } catch (error) {
    logger.error('Error checking payroll approval:', error);
    return {
      canApprove: false,
      reason: 'Error checking approval status'
    };
  }
};

/**
 * Get next approval stage
 * @param {number} currentStage - Current approval stage
 * @param {number} totalStages - Total number of stages
 * @returns {number} Next stage number
 */
const getNextApprovalStage = (currentStage, totalStages) => {
  try {
    const nextStage = currentStage + 1;
    return nextStage <= totalStages ? nextStage : totalStages;
  } catch (error) {
    logger.error('Error getting next approval stage:', error);
    return currentStage;
  }
};

/**
 * Calculate working days in a month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {number} Number of working days
 */
const getWorkingDaysInMonth = (year, month) => {
  try {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // Monday = 1, Tuesday = 2, ..., Friday = 5
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
    }
    
    return workingDays;
  } catch (error) {
    logger.error('Error calculating working days:', error);
    return 22; // Default fallback
  }
};

module.exports = {
  calculateGrossSalary,
  calculateNetSalary,
  calculatePAYETax,
  calculateNSSF,
  calculateNHIF,
  calculateOvertimePay,
  validatePayrollData,
  generatePayrollNumber,
  calculatePayrollStatistics,
  formatCurrency,
  canApprovePayroll,
  getNextApprovalStage,
  getWorkingDaysInMonth
}; 