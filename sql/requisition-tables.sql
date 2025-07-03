-- GHF Backend - Requisition Tables SQL Script

-- Create database
CREATE DATABASE IF NOT EXISTS ghf_backend;
USE ghf_backend;

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
  PRIMARY KEY (`id`)
);

-- Departments table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `manager_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Budgets table
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT NOT NULL AUTO_INCREMENT,
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
  FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  FOREIGN KEY (`responsible_person_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
);

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
  FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

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
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE
);

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
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
);

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
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`next_approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- Sample data
INSERT INTO `departments` (`department_name`, `description`) VALUES
('IT Department', 'Information Technology Department'),
('Finance Department', 'Finance and Accounting Department'),
('Human Resources', 'Human Resources Department');

-- Sample user (password: 'password123')
INSERT INTO `users` (`username`, `email`, `password`, `firstName`, `lastName`, `role`) VALUES
('admin', 'admin@ghf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Sample budget
INSERT INTO `budgets` (`department_id`, `activity_name`, `responsible_person_id`, `amount`, `created_by`) VALUES
(1, 'IT Equipment 2024', 1, 50000000.00, 1); 