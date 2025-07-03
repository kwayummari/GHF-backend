-- =====================================================
-- GHF Backend - Payroll Tables SQL Script
-- Comprehensive payroll management system tables
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ghf_backend;
USE ghf_backend;

-- =====================================================
-- CORE PAYROLL TABLES
-- =====================================================

-- Departments table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `manager_id` INT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_departments_manager_id` (`manager_id`),
  INDEX `idx_departments_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Basic Employee Data table
CREATE TABLE IF NOT EXISTS `basic_employee_data` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL UNIQUE,
  `employee_id` VARCHAR(50) NOT NULL UNIQUE,
  `basic_salary` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `position` VARCHAR(255) NULL,
  `hire_date` DATE NULL,
  `employment_type` ENUM('full_time', 'part_time', 'contract', 'temporary') DEFAULT 'full_time',
  `tax_id` VARCHAR(50) NULL,
  `bank_account` VARCHAR(50) NULL,
  `bank_name` VARCHAR(255) NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_basic_employee_data_user_id` (`user_id`),
  INDEX `idx_basic_employee_data_employee_id` (`employee_id`),
  INDEX `idx_basic_employee_data_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salary Components table
CREATE TABLE IF NOT EXISTS `salary_components` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('allowance', 'deduction') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `percentage` DECIMAL(5,2) NULL COMMENT 'Percentage of basic salary (if applicable)',
  `is_percentage` BOOLEAN DEFAULT FALSE,
  `description` TEXT NULL,
  `effective_date` DATE NOT NULL DEFAULT CURRENT_DATE,
  `end_date` DATE NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_salary_components_user_id` (`user_id`),
  INDEX `idx_salary_components_type` (`type`),
  INDEX `idx_salary_components_active` (`is_active`),
  INDEX `idx_salary_components_effective_date` (`effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payrolls table
CREATE TABLE IF NOT EXISTS `payrolls` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `basic_salary` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `allowances` TEXT NULL COMMENT 'JSON string of allowances array',
  `deductions` TEXT NULL COMMENT 'JSON string of deductions array',
  `gross_salary` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `net_salary` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `payment_date` DATE NULL,
  `status` ENUM('pending', 'processed', 'approved', 'rejected', 'paid') DEFAULT 'pending',
  `approval_stage` INT DEFAULT 0,
  `total_stages` INT DEFAULT 1,
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `rejected_by` INT NULL,
  `rejected_date` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `notes` TEXT NULL,
  `created_by` INT NOT NULL,
  `updated_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `unique_employee_month_year` (`employee_id`, `month`, `year`),
  INDEX `idx_payrolls_status` (`status`),
  INDEX `idx_payrolls_period` (`month`, `year`),
  INDEX `idx_payrolls_created_by` (`created_by`),
  INDEX `idx_payrolls_approved_by` (`approved_by`),
  INDEX `idx_payrolls_payment_date` (`payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ADDITIONAL ENHANCEMENT TABLES
-- =====================================================

-- Payroll Settings table
CREATE TABLE IF NOT EXISTS `payroll_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payroll_settings_key` (`setting_key`),
  INDEX `idx_payroll_settings_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tax Rates table
CREATE TABLE IF NOT EXISTS `tax_rates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tax_type` ENUM('PAYE', 'NSSF', 'NHIF', 'OTHER') NOT NULL,
  `rate_percentage` DECIMAL(5,2) NOT NULL,
  `min_amount` DECIMAL(15,2) NULL,
  `max_amount` DECIMAL(15,2) NULL,
  `effective_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tax_rates_type` (`tax_type`),
  INDEX `idx_tax_rates_active` (`is_active`),
  INDEX `idx_tax_rates_effective_date` (`effective_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Records table
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `check_in` TIME NULL,
  `check_out` TIME NULL,
  `total_hours` DECIMAL(4,2) NULL,
  `overtime_hours` DECIMAL(4,2) DEFAULT 0.00,
  `status` ENUM('present', 'absent', 'late', 'half_day', 'leave', 'sick') DEFAULT 'present',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_date` (`user_id`, `date`),
  INDEX `idx_attendance_records_user_id` (`user_id`),
  INDEX `idx_attendance_records_date` (`date`),
  INDEX `idx_attendance_records_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave Requests table
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `leave_type` ENUM('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_days` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_leave_requests_user_id` (`user_id`),
  INDEX `idx_leave_requests_status` (`status`),
  INDEX `idx_leave_requests_dates` (`start_date`, `end_date`),
  INDEX `idx_leave_requests_approved_by` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll Processing Logs table
CREATE TABLE IF NOT EXISTS `payroll_processing_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `process_id` VARCHAR(50) NOT NULL UNIQUE,
  `pay_period` VARCHAR(7) NOT NULL COMMENT 'YYYY-MM format',
  `total_employees` INT NOT NULL DEFAULT 0,
  `processed_count` INT NOT NULL DEFAULT 0,
  `failed_count` INT NOT NULL DEFAULT 0,
  `total_gross_pay` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_net_pay` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `processing_time` INT NULL COMMENT 'Processing time in seconds',
  `status` ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
  `error_details` TEXT NULL,
  `processed_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_payroll_processing_logs_process_id` (`process_id`),
  INDEX `idx_payroll_processing_logs_pay_period` (`pay_period`),
  INDEX `idx_payroll_processing_logs_status` (`status`),
  INDEX `idx_payroll_processing_logs_processed_by` (`processed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payslip Templates table
CREATE TABLE IF NOT EXISTS `payslip_templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `template_name` VARCHAR(255) NOT NULL,
  `template_html` LONGTEXT NOT NULL,
  `template_css` TEXT NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_payslip_templates_default` (`is_default`),
  INDEX `idx_payslip_templates_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll Notifications table
CREATE TABLE IF NOT EXISTS `payroll_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `payroll_id` INT NULL,
  `notification_type` ENUM('payslip_generated', 'payslip_sent', 'payroll_approved', 'payroll_rejected', 'payment_processed') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `sent_via` ENUM('email', 'sms', 'system') DEFAULT 'system',
  `sent_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_payroll_notifications_user_id` (`user_id`),
  INDEX `idx_payroll_notifications_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_notifications_type` (`notification_type`),
  INDEX `idx_payroll_notifications_read` (`is_read`),
  INDEX `idx_payroll_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Accounts table
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_type` ENUM('savings', 'current', 'salary') DEFAULT 'salary',
  `branch_code` VARCHAR(20) NULL,
  `swift_code` VARCHAR(20) NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_account` (`user_id`, `account_number`),
  INDEX `idx_bank_accounts_user_id` (`user_id`),
  INDEX `idx_bank_accounts_primary` (`is_primary`),
  INDEX `idx_bank_accounts_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll Approvals table
CREATE TABLE IF NOT EXISTS `payroll_approvals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payroll_id` INT NOT NULL,
  `approver_id` INT NOT NULL,
  `stage` INT NOT NULL,
  `stage_name` VARCHAR(100) NOT NULL,
  `action` ENUM('approved', 'rejected', 'returned') NOT NULL,
  `comments` TEXT NULL,
  `conditions` TEXT NULL,
  `approved_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_payroll_approvals_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_approvals_approver_id` (`approver_id`),
  INDEX `idx_payroll_approvals_stage` (`stage`),
  INDEX `idx_payroll_approvals_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll Deductions table
CREATE TABLE IF NOT EXISTS `payroll_deductions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payroll_id` INT NOT NULL,
  `deduction_name` VARCHAR(255) NOT NULL,
  `deduction_type` ENUM('tax', 'social_security', 'loan', 'insurance', 'other') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `percentage` DECIMAL(5,2) NULL,
  `is_mandatory` BOOLEAN DEFAULT FALSE,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_payroll_deductions_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_deductions_type` (`deduction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payroll Allowances table
CREATE TABLE IF NOT EXISTS `payroll_allowances` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payroll_id` INT NOT NULL,
  `allowance_name` VARCHAR(255) NOT NULL,
  `allowance_type` ENUM('housing', 'transport', 'lunch', 'overtime', 'bonus', 'other') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `percentage` DECIMAL(5,2) NULL,
  `is_taxable` BOOLEAN DEFAULT TRUE,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_payroll_allowances_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_allowances_type` (`allowance_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample departments
INSERT IGNORE INTO `departments` (`id`, `department_name`, `description`) VALUES
(1, 'IT Department', 'Information Technology Department'),
(2, 'Finance Department', 'Finance and Accounting Department'),
(3, 'Human Resources', 'Human Resources Department'),
(4, 'Operations', 'Operations Department'),
(5, 'Marketing', 'Marketing Department'),
(6, 'Sales', 'Sales Department'),
(7, 'Customer Service', 'Customer Service Department'),
(8, 'Research & Development', 'Research and Development Department');

-- Insert sample payroll settings
INSERT IGNORE INTO `payroll_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('paye_rate', '15', 'number', 'PAYE tax rate percentage'),
('nssf_rate', '10', 'number', 'NSSF contribution rate percentage'),
('nssf_max', '20000', 'number', 'Maximum NSSF contribution amount'),
('nhif_rate', '3', 'number', 'NHIF contribution rate percentage'),
('nhif_max', '30000', 'number', 'Maximum NHIF contribution amount'),
('overtime_rate', '1.5', 'number', 'Overtime pay rate multiplier'),
('max_overtime_hours', '40', 'number', 'Maximum overtime hours per month'),
('transport_allowance', '50000', 'number', 'Default transport allowance amount'),
('lunch_allowance_per_day', '5000', 'number', 'Lunch allowance per working day'),
('approval_workflow_stages', '["HR Review", "Finance Approval", "Final Authorization"]', 'json', 'Payroll approval workflow stages'),
('auto_approve', 'false', 'boolean', 'Auto approve payroll records'),
('send_payslip_email', 'true', 'boolean', 'Send payslip via email'),
('send_payslip_sms', 'false', 'boolean', 'Send payslip via SMS'),
('notify_on_approval', 'true', 'boolean', 'Send notification on payroll approval');

-- Insert sample tax rates
INSERT IGNORE INTO `tax_rates` (`tax_type`, `rate_percentage`, `min_amount`, `max_amount`, `effective_date`, `description`) VALUES
('PAYE', 0.00, 0.00, 270000.00, '2024-01-01', 'PAYE tax rate for income up to 270,000'),
('PAYE', 8.00, 270000.00, 520000.00, '2024-01-01', 'PAYE tax rate for income 270,000 - 520,000'),
('PAYE', 20.00, 520000.00, 760000.00, '2024-01-01', 'PAYE tax rate for income 520,000 - 760,000'),
('PAYE', 25.00, 760000.00, 1000000.00, '2024-01-01', 'PAYE tax rate for income 760,000 - 1,000,000'),
('PAYE', 30.00, 1000000.00, NULL, '2024-01-01', 'PAYE tax rate for income above 1,000,000'),
('NSSF', 10.00, 0.00, 20000.00, '2024-01-01', 'NSSF contribution rate'),
('NHIF', 3.00, 0.00, 30000.00, '2024-01-01', 'NHIF contribution rate');

-- Insert sample payslip template
INSERT IGNORE INTO `payslip_templates` (`template_name`, `template_html`, `template_css`, `is_default`, `created_by`) VALUES
('Default Template', 
'<!DOCTYPE html>
<html>
<head>
    <title>Payslip - {{employee_name}}</title>
    <style>{{css}}</style>
</head>
<body>
    <div class="payslip">
        <div class="header">
            <h1>PAYSLIP</h1>
            <div class="company-info">
                <h2>GHF Foundation</h2>
                <p>Pay Period: {{pay_period}}</p>
                <p>Pay Date: {{pay_date}}</p>
            </div>
        </div>
        <div class="employee-info">
            <h3>Employee Information</h3>
            <p><strong>Name:</strong> {{employee_name}}</p>
            <p><strong>Employee ID:</strong> {{employee_number}}</p>
            <p><strong>Department:</strong> {{department}}</p>
            <p><strong>Position:</strong> {{position}}</p>
        </div>
        <div class="salary-breakdown">
            <h3>Salary Breakdown</h3>
            <table>
                <tr><th>Description</th><th>Amount (TZS)</th></tr>
                <tr><td>Basic Salary</td><td>{{basic_salary}}</td></tr>
                {{#each allowances}}
                <tr><td>{{name}}</td><td>{{amount}}</td></tr>
                {{/each}}
                <tr class="total"><td><strong>Gross Pay</strong></td><td><strong>{{gross_pay}}</strong></td></tr>
                {{#each deductions}}
                <tr><td>{{name}}</td><td>-{{amount}}</td></tr>
                {{/each}}
                <tr class="net"><td><strong>Net Pay</strong></td><td><strong>{{net_pay}}</strong></td></tr>
            </table>
        </div>
    </div>
</body>
</html>',
'body { font-family: Arial, sans-serif; margin: 20px; }
.payslip { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
.employee-info { margin-bottom: 20px; }
.salary-breakdown table { width: 100%; border-collapse: collapse; }
.salary-breakdown th, .salary-breakdown td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
.salary-breakdown th { background-color: #f2f2f2; }
.total { background-color: #e6f3ff; }
.net { background-color: #e6ffe6; font-weight: bold; }',
TRUE, 1);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Trigger to automatically calculate gross salary
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `calculate_gross_salary_insert` 
BEFORE INSERT ON `payrolls`
FOR EACH ROW
BEGIN
    DECLARE basic_salary DECIMAL(15,2);
    DECLARE total_allowances DECIMAL(15,2) DEFAULT 0;
    
    SET basic_salary = NEW.basic_salary;
    
    -- Calculate total allowances from JSON
    IF NEW.allowances IS NOT NULL AND NEW.allowances != '' THEN
        SET total_allowances = (
            SELECT SUM(JSON_EXTRACT(value, '$.amount'))
            FROM JSON_TABLE(NEW.allowances, '$[*]' COLUMNS (value JSON PATH '$')) AS jt
        );
    END IF;
    
    SET NEW.gross_salary = basic_salary + COALESCE(total_allowances, 0);
END//

CREATE TRIGGER IF NOT EXISTS `calculate_gross_salary_update` 
BEFORE UPDATE ON `payrolls`
FOR EACH ROW
BEGIN
    DECLARE basic_salary DECIMAL(15,2);
    DECLARE total_allowances DECIMAL(15,2) DEFAULT 0;
    
    SET basic_salary = NEW.basic_salary;
    
    -- Calculate total allowances from JSON
    IF NEW.allowances IS NOT NULL AND NEW.allowances != '' THEN
        SET total_allowances = (
            SELECT SUM(JSON_EXTRACT(value, '$.amount'))
            FROM JSON_TABLE(NEW.allowances, '$[*]' COLUMNS (value JSON PATH '$')) AS jt
        );
    END IF;
    
    SET NEW.gross_salary = basic_salary + COALESCE(total_allowances, 0);
END//

-- Trigger to automatically calculate net salary
CREATE TRIGGER IF NOT EXISTS `calculate_net_salary_insert` 
BEFORE INSERT ON `payrolls`
FOR EACH ROW
BEGIN
    DECLARE total_deductions DECIMAL(15,2) DEFAULT 0;
    
    -- Calculate total deductions from JSON
    IF NEW.deductions IS NOT NULL AND NEW.deductions != '' THEN
        SET total_deductions = (
            SELECT SUM(JSON_EXTRACT(value, '$.amount'))
            FROM JSON_TABLE(NEW.deductions, '$[*]' COLUMNS (value JSON PATH '$')) AS jt
        );
    END IF;
    
    SET NEW.net_salary = NEW.gross_salary - COALESCE(total_deductions, 0);
END//

CREATE TRIGGER IF NOT EXISTS `calculate_net_salary_update` 
BEFORE UPDATE ON `payrolls`
FOR EACH ROW
BEGIN
    DECLARE total_deductions DECIMAL(15,2) DEFAULT 0;
    
    -- Calculate total deductions from JSON
    IF NEW.deductions IS NOT NULL AND NEW.deductions != '' THEN
        SET total_deductions = (
            SELECT SUM(JSON_EXTRACT(value, '$.amount'))
            FROM JSON_TABLE(NEW.deductions, '$[*]' COLUMNS (value JSON PATH '$')) AS jt
        );
    END IF;
    
    SET NEW.net_salary = NEW.gross_salary - COALESCE(total_deductions, 0);
END//

DELIMITER ;

-- =====================================================
-- VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for payroll summary
CREATE OR REPLACE VIEW `payroll_summary` AS
SELECT 
    p.id,
    p.employee_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    bed.employee_id AS employee_number,
    d.department_name,
    bed.position,
    p.month,
    p.year,
    CONCAT(p.year, '-', LPAD(p.month, 2, '0')) AS pay_period,
    p.basic_salary,
    p.gross_salary,
    p.net_salary,
    (p.gross_salary - p.net_salary) AS total_deductions,
    p.status,
    p.payment_date,
    p.created_at
FROM payrolls p
JOIN users u ON p.employee_id = u.id
LEFT JOIN basic_employee_data bed ON u.id = bed.user_id
LEFT JOIN departments d ON u.department_id = d.id;

-- View for salary components summary
CREATE OR REPLACE VIEW `salary_components_summary` AS
SELECT 
    sc.id,
    sc.user_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    bed.employee_id AS employee_number,
    sc.name,
    sc.type,
    sc.amount,
    sc.percentage,
    sc.is_percentage,
    sc.effective_date,
    sc.end_date,
    sc.is_active,
    sc.created_at
FROM salary_components sc
JOIN users u ON sc.user_id = u.id
LEFT JOIN basic_employee_data bed ON u.id = bed.user_id;

-- View for attendance summary
CREATE OR REPLACE VIEW `attendance_summary` AS
SELECT 
    ar.id,
    ar.user_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    ar.date,
    ar.check_in,
    ar.check_out,
    ar.total_hours,
    ar.overtime_hours,
    ar.status,
    d.department_name
FROM attendance_records ar
JOIN users u ON ar.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id;

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Procedure to calculate payroll for an employee
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `CalculateEmployeePayroll`(
    IN p_employee_id INT,
    IN p_month INT,
    IN p_year INT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_basic_salary DECIMAL(15,2);
    DECLARE v_gross_salary DECIMAL(15,2);
    DECLARE v_net_salary DECIMAL(15,2);
    DECLARE v_payroll_id INT;
    
    -- Get basic salary
    SELECT basic_salary INTO v_basic_salary
    FROM basic_employee_data
    WHERE user_id = p_employee_id;
    
    -- Calculate gross salary (basic + allowances)
    SELECT v_basic_salary + COALESCE(SUM(amount), 0) INTO v_gross_salary
    FROM salary_components
    WHERE user_id = p_employee_id AND type = 'allowance' AND is_active = TRUE;
    
    -- Calculate net salary (gross - deductions)
    SELECT v_gross_salary - COALESCE(SUM(amount), 0) INTO v_net_salary
    FROM salary_components
    WHERE user_id = p_employee_id AND type = 'deduction' AND is_active = TRUE;
    
    -- Insert payroll record
    INSERT INTO payrolls (employee_id, month, year, basic_salary, gross_salary, net_salary, created_by)
    VALUES (p_employee_id, p_month, p_year, v_basic_salary, v_gross_salary, v_net_salary, p_created_by);
    
    SET v_payroll_id = LAST_INSERT_ID();
    
    -- Insert allowances
    INSERT INTO payroll_allowances (payroll_id, allowance_name, allowance_type, amount, is_taxable)
    SELECT v_payroll_id, name, 'other', amount, TRUE
    FROM salary_components
    WHERE user_id = p_employee_id AND type = 'allowance' AND is_active = TRUE;
    
    -- Insert deductions
    INSERT INTO payroll_deductions (payroll_id, deduction_name, deduction_type, amount, is_mandatory)
    SELECT v_payroll_id, name, 'other', amount, FALSE
    FROM salary_components
    WHERE user_id = p_employee_id AND type = 'deduction' AND is_active = TRUE;
    
    SELECT v_payroll_id AS payroll_id, v_gross_salary AS gross_salary, v_net_salary AS net_salary;
END//

-- Procedure to get payroll statistics
CREATE PROCEDURE IF NOT EXISTS `GetPayrollStatistics`(
    IN p_month INT,
    IN p_year INT,
    IN p_department_id INT
)
BEGIN
    SELECT 
        COUNT(*) AS total_payrolls,
        SUM(gross_salary) AS total_gross_pay,
        SUM(net_salary) AS total_net_pay,
        SUM(gross_salary - net_salary) AS total_deductions,
        AVG(gross_salary) AS average_gross_pay,
        AVG(net_salary) AS average_net_pay,
        SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) AS processed_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
    FROM payrolls p
    JOIN users u ON p.employee_id = u.id
    WHERE p.month = p_month 
    AND p.year = p_year
    AND (p_department_id IS NULL OR u.department_id = p_department_id);
END//

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_payrolls_employee_status` ON `payrolls` (`employee_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_payrolls_created_at` ON `payrolls` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_salary_components_user_type` ON `salary_components` (`user_id`, `type`);
CREATE INDEX IF NOT EXISTS `idx_attendance_records_user_date` ON `attendance_records` (`user_id`, `date`);
CREATE INDEX IF NOT EXISTS `idx_leave_requests_user_status` ON `leave_requests` (`user_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_payroll_notifications_user_read` ON `payroll_notifications` (`user_id`, `is_read`);

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

-- Add comments to tables
ALTER TABLE `departments` COMMENT = 'Organizational departments for employee grouping';
ALTER TABLE `basic_employee_data` COMMENT = 'Basic employee salary and employment information';
ALTER TABLE `salary_components` COMMENT = 'Salary allowances and deductions for employees';
ALTER TABLE `payrolls` COMMENT = 'Main payroll records with approval workflow';
ALTER TABLE `payroll_settings` COMMENT = 'System-wide payroll configuration settings';
ALTER TABLE `tax_rates` COMMENT = 'Tax rates and brackets for payroll calculations';
ALTER TABLE `attendance_records` COMMENT = 'Employee attendance and time tracking';
ALTER TABLE `leave_requests` COMMENT = 'Employee leave requests and approvals';
ALTER TABLE `payroll_processing_logs` COMMENT = 'Logs for payroll processing operations';
ALTER TABLE `payslip_templates` COMMENT = 'Payslip templates for PDF generation';
ALTER TABLE `payroll_notifications` COMMENT = 'System notifications for payroll events';
ALTER TABLE `bank_accounts` COMMENT = 'Employee bank account information';
ALTER TABLE `payroll_approvals` COMMENT = 'Payroll approval workflow history';
ALTER TABLE `payroll_deductions` COMMENT = 'Detailed payroll deductions breakdown';
ALTER TABLE `payroll_allowances` COMMENT = 'Detailed payroll allowances breakdown';

-- =====================================================
-- FINAL NOTES
-- =====================================================

/*
This SQL script creates a comprehensive payroll management system with the following features:

1. Core Tables:
   - departments: Organizational structure
   - basic_employee_data: Employee salary information
   - salary_components: Allowances and deductions
   - payrolls: Main payroll records

2. Enhancement Tables:
   - payroll_settings: System configuration
   - tax_rates: Tax calculation rules
   - attendance_records: Time tracking
   - leave_requests: Leave management
   - payroll_processing_logs: Processing history
   - payslip_templates: PDF templates
   - payroll_notifications: System notifications
   - bank_accounts: Banking information
   - payroll_approvals: Approval workflow
   - payroll_deductions: Detailed deductions
   - payroll_allowances: Detailed allowances

3. Features:
   - Automatic salary calculations via triggers
   - Comprehensive views for reporting
   - Stored procedures for common operations
   - Sample data for testing
   - Performance-optimized indexes
   - Complete documentation

4. Usage:
   - Run this script to create all payroll tables
   - Tables are designed to work with the existing GHF backend
   - Follows the same patterns as existing tables
   - Includes proper foreign key constraints and indexes
*/ 