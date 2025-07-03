-- =====================================================
-- GHF Backend - Payroll Approvals, Deductions & Bank Accounts
-- Additional tables for enhanced payroll functionality
-- =====================================================

USE ghf_backend;

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
  INDEX `idx_payroll_approvals_action` (`action`),
  INDEX `idx_payroll_approvals_approved_at` (`approved_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PAYROLL DEDUCTIONS TABLE (DETAILED)
-- =====================================================

CREATE TABLE IF NOT EXISTS `payroll_deductions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payroll_id` INT NOT NULL,
  `deduction_name` VARCHAR(255) NOT NULL,
  `deduction_type` ENUM('tax', 'social_security', 'loan', 'insurance', 'pension', 'union_dues', 'advance', 'other') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `percentage` DECIMAL(5,2) NULL,
  `is_mandatory` BOOLEAN DEFAULT FALSE,
  `is_taxable` BOOLEAN DEFAULT TRUE,
  `description` TEXT NULL,
  `reference_number` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_payroll_deductions_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_deductions_type` (`deduction_type`),
  INDEX `idx_payroll_deductions_mandatory` (`is_mandatory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PAYROLL ALLOWANCES TABLE (DETAILED)
-- =====================================================

CREATE TABLE IF NOT EXISTS `payroll_allowances` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payroll_id` INT NOT NULL,
  `allowance_name` VARCHAR(255) NOT NULL,
  `allowance_type` ENUM('housing', 'transport', 'lunch', 'overtime', 'bonus', 'performance', 'hardship', 'danger', 'night_shift', 'weekend', 'holiday', 'other') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `percentage` DECIMAL(5,2) NULL,
  `is_taxable` BOOLEAN DEFAULT TRUE,
  `is_recurring` BOOLEAN DEFAULT TRUE,
  `description` TEXT NULL,
  `reference_number` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_payroll_allowances_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_allowances_type` (`allowance_type`),
  INDEX `idx_payroll_allowances_taxable` (`is_taxable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BANK ACCOUNTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_type` ENUM('savings', 'current', 'salary', 'investment') DEFAULT 'salary',
  `branch_code` VARCHAR(20) NULL,
  `swift_code` VARCHAR(20) NULL,
  `iban` VARCHAR(50) NULL,
  `account_holder_name` VARCHAR(255) NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_account` (`user_id`, `account_number`),
  INDEX `idx_bank_accounts_user_id` (`user_id`),
  INDEX `idx_bank_accounts_primary` (`is_primary`),
  INDEX `idx_bank_accounts_active` (`is_active`),
  INDEX `idx_bank_accounts_bank_name` (`bank_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LOAN RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `loan_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `loan_type` ENUM('salary_advance', 'personal_loan', 'housing_loan', 'vehicle_loan', 'education_loan', 'other') NOT NULL,
  `loan_amount` DECIMAL(15,2) NOT NULL,
  `interest_rate` DECIMAL(5,2) DEFAULT 0.00,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `monthly_installment` DECIMAL(15,2) NOT NULL,
  `total_installments` INT NOT NULL,
  `remaining_installments` INT NOT NULL,
  `remaining_amount` DECIMAL(15,2) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('active', 'completed', 'defaulted', 'cancelled') DEFAULT 'active',
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_loan_records_user_id` (`user_id`),
  INDEX `idx_loan_records_type` (`loan_type`),
  INDEX `idx_loan_records_status` (`status`),
  INDEX `idx_loan_records_approved_by` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LOAN INSTALLMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `loan_installments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `loan_id` INT NOT NULL,
  `payroll_id` INT NULL,
  `installment_number` INT NOT NULL,
  `due_date` DATE NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `interest_amount` DECIMAL(15,2) DEFAULT 0.00,
  `principal_amount` DECIMAL(15,2) NOT NULL,
  `status` ENUM('pending', 'paid', 'overdue', 'waived') DEFAULT 'pending',
  `paid_date` DATE NULL,
  `paid_amount` DECIMAL(15,2) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`loan_id`) REFERENCES `loan_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `unique_loan_installment` (`loan_id`, `installment_number`),
  INDEX `idx_loan_installments_loan_id` (`loan_id`),
  INDEX `idx_loan_installments_payroll_id` (`payroll_id`),
  INDEX `idx_loan_installments_status` (`status`),
  INDEX `idx_loan_installments_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- OVERTIME RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `overtime_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `hours_worked` DECIMAL(4,2) NOT NULL,
  `overtime_hours` DECIMAL(4,2) NOT NULL,
  `overtime_rate` DECIMAL(5,2) DEFAULT 1.50,
  `overtime_amount` DECIMAL(15,2) NOT NULL,
  `reason` TEXT NULL,
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_date_overtime` (`user_id`, `date`),
  INDEX `idx_overtime_records_user_id` (`user_id`),
  INDEX `idx_overtime_records_date` (`date`),
  INDEX `idx_overtime_records_status` (`status`),
  INDEX `idx_overtime_records_approved_by` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- BONUS RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `bonus_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `bonus_type` ENUM('performance', 'annual', 'festival', 'retention', 'referral', 'other') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `percentage` DECIMAL(5,2) NULL,
  `pay_period` VARCHAR(7) NULL COMMENT 'YYYY-MM format',
  `is_taxable` BOOLEAN DEFAULT TRUE,
  `reason` TEXT NULL,
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_bonus_records_user_id` (`user_id`),
  INDEX `idx_bonus_records_type` (`bonus_type`),
  INDEX `idx_bonus_records_status` (`status`),
  INDEX `idx_bonus_records_pay_period` (`pay_period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PAYROLL ADJUSTMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS `payroll_adjustments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payroll_id` INT NOT NULL,
  `adjustment_type` ENUM('addition', 'deduction') NOT NULL,
  `adjustment_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `reason` TEXT NOT NULL,
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_payroll_adjustments_payroll_id` (`payroll_id`),
  INDEX `idx_payroll_adjustments_type` (`adjustment_type`),
  INDEX `idx_payroll_adjustments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample bank accounts
INSERT IGNORE INTO `bank_accounts` (`user_id`, `bank_name`, `account_number`, `account_type`, `branch_code`, `account_holder_name`, `is_primary`, `is_active`) VALUES
(1, 'CRDB Bank', '1234567890', 'salary', '001', 'Admin User', TRUE, TRUE),
(2, 'NMB Bank', '0987654321', 'salary', '002', 'Finance Manager', TRUE, TRUE),
(3, 'NBC Bank', '1122334455', 'salary', '003', 'HR Manager', TRUE, TRUE),
(4, 'CRDB Bank', '5566778899', 'salary', '001', 'Operations Manager', TRUE, TRUE),
(5, 'NMB Bank', '9988776655', 'salary', '002', 'Marketing Manager', TRUE, TRUE);

-- Insert sample loan records
INSERT IGNORE INTO `loan_records` (`user_id`, `loan_type`, `loan_amount`, `interest_rate`, `total_amount`, `monthly_installment`, `total_installments`, `remaining_installments`, `remaining_amount`, `start_date`, `end_date`, `status`, `approved_by`) VALUES
(1, 'personal_loan', 500000.00, 12.00, 560000.00, 46666.67, 12, 8, 373333.36, '2024-01-01', '2024-12-31', 'active', 2),
(3, 'housing_loan', 2000000.00, 8.00, 2160000.00, 180000.00, 12, 10, 1800000.00, '2024-02-01', '2025-01-31', 'active', 2);

-- Insert sample loan installments
INSERT IGNORE INTO `loan_installments` (`loan_id`, `installment_number`, `due_date`, `amount`, `interest_amount`, `principal_amount`, `status`, `paid_date`, `paid_amount`) VALUES
(1, 1, '2024-02-01', 46666.67, 5000.00, 41666.67, 'paid', '2024-02-01', 46666.67),
(1, 2, '2024-03-01', 46666.67, 4583.33, 42083.34, 'paid', '2024-03-01', 46666.67),
(1, 3, '2024-04-01', 46666.67, 4166.67, 42500.00, 'paid', '2024-04-01', 46666.67),
(1, 4, '2024-05-01', 46666.67, 3750.00, 42916.67, 'pending', NULL, NULL),
(2, 1, '2024-03-01', 180000.00, 13333.33, 166666.67, 'paid', '2024-03-01', 180000.00),
(2, 2, '2024-04-01', 180000.00, 12000.00, 168000.00, 'paid', '2024-04-01', 180000.00),
(2, 3, '2024-05-01', 180000.00, 10666.67, 169333.33, 'pending', NULL, NULL);

-- Insert sample overtime records
INSERT IGNORE INTO `overtime_records` (`user_id`, `date`, `hours_worked`, `overtime_hours`, `overtime_rate`, `overtime_amount`, `reason`, `status`) VALUES
(1, '2024-06-15', 10.00, 2.00, 1.50, 30000.00, 'Project deadline', 'approved'),
(2, '2024-06-16', 9.50, 1.50, 1.50, 22500.00, 'Month-end closing', 'approved'),
(3, '2024-06-17', 8.00, 0.00, 1.50, 0.00, 'Regular hours', 'approved'),
(4, '2024-06-18', 11.00, 3.00, 1.50, 45000.00, 'Emergency maintenance', 'pending');

-- Insert sample bonus records
INSERT IGNORE INTO `bonus_records` (`user_id`, `bonus_type`, `amount`, `percentage`, `pay_period`, `is_taxable`, `reason`, `status`) VALUES
(1, 'performance', 200000.00, 8.00, '2024-06', TRUE, 'Outstanding performance Q2', 'approved'),
(2, 'annual', 300000.00, 12.00, '2024-06', TRUE, 'Annual bonus 2024', 'approved'),
(3, 'festival', 100000.00, NULL, '2024-06', TRUE, 'Eid al-Fitr bonus', 'approved'),
(4, 'retention', 150000.00, 6.00, '2024-06', TRUE, '5-year service bonus', 'pending');

-- =====================================================
-- VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for loan summary
CREATE OR REPLACE VIEW `loan_summary` AS
SELECT 
    lr.id,
    lr.user_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    bed.employee_id AS employee_number,
    lr.loan_type,
    lr.loan_amount,
    lr.total_amount,
    lr.monthly_installment,
    lr.total_installments,
    lr.remaining_installments,
    lr.remaining_amount,
    lr.status,
    lr.start_date,
    lr.end_date
FROM loan_records lr
JOIN users u ON lr.user_id = u.id
LEFT JOIN basic_employee_data bed ON u.id = bed.user_id;

-- View for overtime summary
CREATE OR REPLACE VIEW `overtime_summary` AS
SELECT 
    or.id,
    or.user_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    bed.employee_id AS employee_number,
    or.date,
    or.hours_worked,
    or.overtime_hours,
    or.overtime_rate,
    or.overtime_amount,
    or.reason,
    or.status,
    d.department_name
FROM overtime_records or
JOIN users u ON or.user_id = u.id
LEFT JOIN basic_employee_data bed ON u.id = bed.user_id
LEFT JOIN departments d ON u.department_id = d.id;

-- View for bonus summary
CREATE OR REPLACE VIEW `bonus_summary` AS
SELECT 
    br.id,
    br.user_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    bed.employee_id AS employee_number,
    br.bonus_type,
    br.amount,
    br.percentage,
    br.pay_period,
    br.is_taxable,
    br.reason,
    br.status,
    d.department_name
FROM bonus_records br
JOIN users u ON br.user_id = u.id
LEFT JOIN basic_employee_data bed ON u.id = bed.user_id
LEFT JOIN departments d ON u.department_id = d.id;

-- View for bank accounts summary
CREATE OR REPLACE VIEW `bank_accounts_summary` AS
SELECT 
    ba.id,
    ba.user_id,
    CONCAT(u.firstName, ' ', u.lastName) AS employee_name,
    bed.employee_id AS employee_number,
    ba.bank_name,
    ba.account_number,
    ba.account_type,
    ba.branch_code,
    ba.account_holder_name,
    ba.is_primary,
    ba.is_active
FROM bank_accounts ba
JOIN users u ON ba.user_id = u.id
LEFT JOIN basic_employee_data bed ON u.id = bed.user_id;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to calculate loan installment
CREATE PROCEDURE IF NOT EXISTS `CalculateLoanInstallment`(
    IN p_loan_id INT,
    IN p_payroll_id INT
)
BEGIN
    DECLARE v_loan_amount DECIMAL(15,2);
    DECLARE v_interest_rate DECIMAL(5,2);
    DECLARE v_monthly_installment DECIMAL(15,2);
    DECLARE v_remaining_amount DECIMAL(15,2);
    DECLARE v_installment_number INT;
    DECLARE v_interest_amount DECIMAL(15,2);
    DECLARE v_principal_amount DECIMAL(15,2);
    
    -- Get loan details
    SELECT loan_amount, interest_rate, monthly_installment, remaining_amount
    INTO v_loan_amount, v_interest_rate, v_monthly_installment, v_remaining_amount
    FROM loan_records
    WHERE id = p_loan_id;
    
    -- Get next installment number
    SELECT COALESCE(MAX(installment_number), 0) + 1 INTO v_installment_number
    FROM loan_installments
    WHERE loan_id = p_loan_id;
    
    -- Calculate interest and principal
    SET v_interest_amount = (v_remaining_amount * v_interest_rate / 100) / 12;
    SET v_principal_amount = v_monthly_installment - v_interest_amount;
    
    -- Insert installment record
    INSERT INTO loan_installments (
        loan_id, payroll_id, installment_number, due_date, amount, 
        interest_amount, principal_amount, status
    ) VALUES (
        p_loan_id, p_payroll_id, v_installment_number, 
        DATE_ADD(CURDATE(), INTERVAL 1 MONTH), v_monthly_installment,
        v_interest_amount, v_principal_amount, 'pending'
    );
    
    -- Update loan remaining amount
    UPDATE loan_records 
    SET remaining_amount = remaining_amount - v_principal_amount,
        remaining_installments = remaining_installments - 1
    WHERE id = p_loan_id;
    
    SELECT v_installment_number AS installment_number, v_monthly_installment AS amount;
END//

-- Procedure to calculate overtime pay
CREATE PROCEDURE IF NOT EXISTS `CalculateOvertimePay`(
    IN p_user_id INT,
    IN p_month INT,
    IN p_year INT
)
BEGIN
    DECLARE v_total_overtime_hours DECIMAL(4,2);
    DECLARE v_hourly_rate DECIMAL(15,2);
    DECLARE v_overtime_rate DECIMAL(5,2);
    DECLARE v_total_overtime_pay DECIMAL(15,2);
    
    -- Get total overtime hours for the month
    SELECT COALESCE(SUM(overtime_hours), 0) INTO v_total_overtime_hours
    FROM overtime_records
    WHERE user_id = p_user_id 
    AND MONTH(date) = p_month 
    AND YEAR(date) = p_year
    AND status = 'approved';
    
    -- Get basic salary and calculate hourly rate
    SELECT basic_salary / 176 INTO v_hourly_rate
    FROM basic_employee_data
    WHERE user_id = p_user_id;
    
    -- Get overtime rate from settings
    SELECT CAST(setting_value AS DECIMAL(5,2)) INTO v_overtime_rate
    FROM payroll_settings
    WHERE setting_key = 'overtime_rate';
    
    -- Calculate total overtime pay
    SET v_total_overtime_pay = v_total_overtime_hours * v_hourly_rate * v_overtime_rate;
    
    SELECT v_total_overtime_hours AS overtime_hours, v_total_overtime_pay AS overtime_pay;
END//

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger to update loan status when all installments are paid
CREATE TRIGGER IF NOT EXISTS `update_loan_status_completed`
AFTER UPDATE ON `loan_records`
FOR EACH ROW
BEGIN
    IF NEW.remaining_installments = 0 AND NEW.status = 'active' THEN
        UPDATE loan_records 
        SET status = 'completed', updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
END//

-- Trigger to calculate overtime amount automatically
CREATE TRIGGER IF NOT EXISTS `calculate_overtime_amount_insert`
BEFORE INSERT ON `overtime_records`
FOR EACH ROW
BEGIN
    DECLARE v_hourly_rate DECIMAL(15,2);
    DECLARE v_overtime_rate DECIMAL(5,2);
    
    -- Get hourly rate from basic salary
    SELECT basic_salary / 176 INTO v_hourly_rate
    FROM basic_employee_data
    WHERE user_id = NEW.user_id;
    
    -- Get overtime rate from settings
    SELECT CAST(setting_value AS DECIMAL(5,2)) INTO v_overtime_rate
    FROM payroll_settings
    WHERE setting_key = 'overtime_rate';
    
    -- Calculate overtime amount
    SET NEW.overtime_amount = NEW.overtime_hours * v_hourly_rate * v_overtime_rate;
END//

CREATE TRIGGER IF NOT EXISTS `calculate_overtime_amount_update`
BEFORE UPDATE ON `overtime_records`
FOR EACH ROW
BEGIN
    DECLARE v_hourly_rate DECIMAL(15,2);
    DECLARE v_overtime_rate DECIMAL(5,2);
    
    -- Get hourly rate from basic salary
    SELECT basic_salary / 176 INTO v_hourly_rate
    FROM basic_employee_data
    WHERE user_id = NEW.user_id;
    
    -- Get overtime rate from settings
    SELECT CAST(setting_value AS DECIMAL(5,2)) INTO v_overtime_rate
    FROM payroll_settings
    WHERE setting_key = 'overtime_rate';
    
    -- Calculate overtime amount
    SET NEW.overtime_amount = NEW.overtime_hours * v_hourly_rate * v_overtime_rate;
END//

DELIMITER ;

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_payroll_approvals_payroll_approver` ON `payroll_approvals` (`payroll_id`, `approver_id`);
CREATE INDEX IF NOT EXISTS `idx_payroll_deductions_payroll_type` ON `payroll_deductions` (`payroll_id`, `deduction_type`);
CREATE INDEX IF NOT EXISTS `idx_payroll_allowances_payroll_type` ON `payroll_allowances` (`payroll_id`, `allowance_type`);
CREATE INDEX IF NOT EXISTS `idx_bank_accounts_user_primary` ON `bank_accounts` (`user_id`, `is_primary`);
CREATE INDEX IF NOT EXISTS `idx_loan_records_user_status` ON `loan_records` (`user_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_loan_installments_loan_status` ON `loan_installments` (`loan_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_overtime_records_user_date` ON `overtime_records` (`user_id`, `date`);
CREATE INDEX IF NOT EXISTS `idx_bonus_records_user_type` ON `bonus_records` (`user_id`, `bonus_type`);
CREATE INDEX IF NOT EXISTS `idx_payroll_adjustments_payroll_type` ON `payroll_adjustments` (`payroll_id`, `adjustment_type`);

-- =====================================================
-- COMMENTS
-- =====================================================

-- Add comments to tables
ALTER TABLE `payroll_approvals` COMMENT = 'Payroll approval workflow history and tracking';
ALTER TABLE `payroll_deductions` COMMENT = 'Detailed breakdown of payroll deductions';
ALTER TABLE `payroll_allowances` COMMENT = 'Detailed breakdown of payroll allowances';
ALTER TABLE `bank_accounts` COMMENT = 'Employee bank account information for salary payments';
ALTER TABLE `loan_records` COMMENT = 'Employee loan records and repayment schedules';
ALTER TABLE `loan_installments` COMMENT = 'Individual loan installment records';
ALTER TABLE `overtime_records` COMMENT = 'Employee overtime tracking and approval';
ALTER TABLE `bonus_records` COMMENT = 'Employee bonus records and approvals';
ALTER TABLE `payroll_adjustments` COMMENT = 'Payroll adjustments and corrections'; 