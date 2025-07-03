-- =====================================================
-- GHF Backend - Additional Payroll Tables
-- Enhanced payroll management system tables
-- =====================================================

USE ghf_backend;

-- =====================================================
-- PAYROLL SETTINGS TABLE
-- =====================================================

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

-- =====================================================
-- TAX RATES TABLE
-- =====================================================

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

-- =====================================================
-- ATTENDANCE RECORDS TABLE
-- =====================================================

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

-- =====================================================
-- LEAVE REQUESTS TABLE
-- =====================================================

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

-- =====================================================
-- PAYROLL PROCESSING LOGS TABLE
-- =====================================================

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

-- =====================================================
-- PAYSLIP TEMPLATES TABLE
-- =====================================================

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

-- =====================================================
-- PAYROLL NOTIFICATIONS TABLE
-- =====================================================

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

-- =====================================================
-- BANK ACCOUNTS TABLE
-- =====================================================

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

-- =====================================================
-- PAYROLL APPROVALS TABLE
-- =====================================================

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

-- =====================================================
-- PAYROLL DEDUCTIONS TABLE
-- =====================================================

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

-- =====================================================
-- PAYROLL ALLOWANCES TABLE
-- =====================================================

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
-- ADDITIONAL INDEXES FOR PERFORMANCE
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