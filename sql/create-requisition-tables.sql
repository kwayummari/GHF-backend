-- =====================================================
-- GHF Backend - Requisition Module Database Setup
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ghf_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ghf_backend;

-- =====================================================
-- DEPENDENCY TABLES (if not already created)
-- =====================================================

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(30) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(50) NOT NULL,
  `lastName` VARCHAR(50) NOT NULL,
  `role` ENUM('user', 'admin', 'finance_manager', 'department_head') DEFAULT 'user',
  `isActive` BOOLEAN DEFAULT TRUE,
  `lastLogin` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_username` (`username`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Departments table (if not exists)
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `manager_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_departments_name` (`department_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budgets table (if not exists)
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quarter_id` INT NULL,
  `department_id` INT NOT NULL,
  `activity_name` VARCHAR(255) NOT NULL,
  `responsible_person_id` INT NOT NULL,
  `description` TEXT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `status` ENUM('draft', 'approved', 'rejected') DEFAULT 'draft',
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`responsible_person_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_budgets_department` (`department_id`),
  INDEX `idx_budgets_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- REQUISITION TABLES
-- =====================================================

-- Purchase Requests table
CREATE TABLE IF NOT EXISTS `purchase_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `requisition_number` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `department_id` INT NOT NULL,
  `requested_by` INT NOT NULL,
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `required_date` DATE NOT NULL,
  `estimated_cost` DECIMAL(15,2) NOT NULL,
  `actual_cost` DECIMAL(15,2) NULL,
  `status` ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled') DEFAULT 'draft',
  `approval_stage` INT DEFAULT 0,
  `total_stages` INT DEFAULT 1,
  `budget_id` INT NULL,
  `justification` TEXT NULL,
  `notes` TEXT NULL,
  `approved_by` INT NULL,
  `approved_date` DATETIME NULL,
  `rejected_by` INT NULL,
  `rejected_date` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `submitted_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_purchase_requests_requisition_number` (`requisition_number`),
  INDEX `idx_purchase_requests_status` (`status`),
  INDEX `idx_purchase_requests_department_id` (`department_id`),
  INDEX `idx_purchase_requests_requested_by` (`requested_by`),
  INDEX `idx_purchase_requests_priority` (`priority`),
  INDEX `idx_purchase_requests_required_date` (`required_date`),
  INDEX `idx_purchase_requests_budget_id` (`budget_id`),
  INDEX `idx_purchase_requests_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requisition Items table
CREATE TABLE IF NOT EXISTS `requisition_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_request_id` INT NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(15,2) NOT NULL,
  `total_price` DECIMAL(15,2) NOT NULL,
  `specifications` TEXT NULL,
  `category` VARCHAR(100) NULL,
  `supplier_preference` VARCHAR(255) NULL,
  `brand` VARCHAR(100) NULL,
  `model` VARCHAR(100) NULL,
  `unit_of_measure` VARCHAR(50) DEFAULT 'piece',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_requisition_items_purchase_request_id` (`purchase_request_id`),
  INDEX `idx_requisition_items_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requisition Attachments table
CREATE TABLE IF NOT EXISTS `requisition_attachments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_request_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(100) NULL,
  `description` VARCHAR(500) NULL,
  `category` VARCHAR(100) NULL,
  `uploaded_by` INT NOT NULL,
  `upload_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_requisition_attachments_purchase_request_id` (`purchase_request_id`),
  INDEX `idx_requisition_attachments_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requisition Workflow table
CREATE TABLE IF NOT EXISTS `requisition_workflows` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_request_id` INT NOT NULL,
  `stage` INT NOT NULL,
  `stage_name` VARCHAR(100) NOT NULL,
  `approver_role` VARCHAR(100) NOT NULL,
  `approver_id` INT NOT NULL,
  `action` ENUM('approved', 'rejected', 'returned', 'forwarded') NOT NULL,
  `comments` TEXT NULL,
  `conditions` TEXT NULL,
  `next_approver_id` INT NULL,
  `completed_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`next_approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_requisition_workflows_purchase_request_id` (`purchase_request_id`),
  INDEX `idx_requisition_workflows_approver_id` (`approver_id`),
  INDEX `idx_requisition_workflows_stage` (`stage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample departments
INSERT IGNORE INTO `departments` (`id`, `department_name`, `description`) VALUES
(1, 'IT Department', 'Information Technology Department'),
(2, 'Finance Department', 'Finance and Accounting Department'),
(3, 'Human Resources', 'Human Resources Department'),
(4, 'Operations', 'Operations Department'),
(5, 'Marketing', 'Marketing Department');

-- Insert sample users (password: 'password123' - hashed with bcrypt)
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password`, `firstName`, `lastName`, `role`) VALUES
(1, 'admin', 'admin@ghf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'),
(2, 'finance_manager', 'finance@ghf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Finance', 'Manager', 'finance_manager'),
(3, 'dept_head', 'dept@ghf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department', 'Head', 'department_head'),
(4, 'user1', 'user1@ghf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular', 'User', 'user');

-- Insert sample budgets
INSERT IGNORE INTO `budgets` (`id`, `department_id`, `activity_name`, `responsible_person_id`, `description`, `amount`, `status`, `created_by`) VALUES
(1, 1, 'IT Equipment 2024', 1, 'Annual IT equipment budget', 50000000.00, 'approved', 1),
(2, 2, 'Office Supplies 2024', 2, 'Office supplies and stationery', 10000000.00, 'approved', 2),
(3, 3, 'Training Budget 2024', 3, 'Employee training and development', 25000000.00, 'approved', 3);

-- =====================================================
-- TRIGGERS (Optional - for automatic total calculation)
-- =====================================================

-- Trigger to automatically calculate total_price for requisition items
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `calculate_total_price_insert` 
BEFORE INSERT ON `requisition_items`
FOR EACH ROW
BEGIN
    SET NEW.total_price = NEW.quantity * NEW.unit_price;
END//

CREATE TRIGGER IF NOT EXISTS `calculate_total_price_update` 
BEFORE UPDATE ON `requisition_items`
FOR EACH ROW
BEGIN
    SET NEW.total_price = NEW.quantity * NEW.unit_price;
END//
DELIMITER ;

-- =====================================================
-- VIEWS (Optional - for easier querying)
-- =====================================================

-- View for requisition summary
CREATE OR REPLACE VIEW `requisition_summary` AS
SELECT 
    pr.id,
    pr.requisition_number,
    pr.title,
    pr.status,
    pr.priority,
    pr.estimated_cost,
    pr.required_date,
    d.department_name,
    CONCAT(u.firstName, ' ', u.lastName) as requester_name,
    pr.created_at,
    COUNT(ri.id) as items_count
FROM purchase_requests pr
LEFT JOIN departments d ON pr.department_id = d.id
LEFT JOIN users u ON pr.requested_by = u.id
LEFT JOIN requisition_items ri ON pr.id = ri.purchase_request_id
GROUP BY pr.id;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'ghf_backend' 
AND TABLE_NAME IN (
    'users', 
    'departments', 
    'budgets', 
    'purchase_requests', 
    'requisition_items', 
    'requisition_attachments', 
    'requisition_workflows'
)
ORDER BY TABLE_NAME;

-- Check foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'ghf_backend' 
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- =====================================================
-- USAGE NOTES
-- =====================================================

/*
1. Run this script in your MySQL database
2. The script will create all necessary tables for the requisition module
3. Sample data is included for testing
4. All foreign key relationships are properly established
5. Indexes are created for optimal performance
6. Triggers automatically calculate item totals
7. A summary view is created for easier reporting

To test the API:
1. Start the server: npm start
2. Access API documentation: http://localhost:3000/api-docs
3. Test endpoints using the sample data provided

Sample API calls:
- GET /api/v1/requisitions (list all requisitions)
- POST /api/v1/requisitions (create new requisition)
- GET /api/v1/requisitions/1 (get specific requisition)
*/ 