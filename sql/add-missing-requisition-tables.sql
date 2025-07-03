-- Add missing requisition tables to existing ghf_db database

USE ghf_db;

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
  FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`next_approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
ALTER TABLE `purchase_requests` ADD INDEX IF NOT EXISTS `idx_requisition_number` (`requisition_number`);
ALTER TABLE `purchase_requests` ADD INDEX IF NOT EXISTS `idx_status` (`status`);
ALTER TABLE `purchase_requests` ADD INDEX IF NOT EXISTS `idx_department_id` (`department_id`);
ALTER TABLE `purchase_requests` ADD INDEX IF NOT EXISTS `idx_requested_by` (`requested_by`);
ALTER TABLE `purchase_requests` ADD INDEX IF NOT EXISTS `idx_priority` (`priority`);
ALTER TABLE `purchase_requests` ADD INDEX IF NOT EXISTS `idx_required_date` (`required_date`);

ALTER TABLE `requisition_items` ADD INDEX IF NOT EXISTS `idx_purchase_request_id` (`purchase_request_id`);
ALTER TABLE `requisition_items` ADD INDEX IF NOT EXISTS `idx_category` (`category`);

ALTER TABLE `requisition_attachments` ADD INDEX IF NOT EXISTS `idx_purchase_request_id` (`purchase_request_id`);
ALTER TABLE `requisition_attachments` ADD INDEX IF NOT EXISTS `idx_uploaded_by` (`uploaded_by`);

ALTER TABLE `requisition_workflows` ADD INDEX IF NOT EXISTS `idx_purchase_request_id` (`purchase_request_id`);
ALTER TABLE `requisition_workflows` ADD INDEX IF NOT EXISTS `idx_approver_id` (`approver_id`);
ALTER TABLE `requisition_workflows` ADD INDEX IF NOT EXISTS `idx_stage` (`stage`);

-- Verify tables were created
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'ghf_db' 
AND TABLE_NAME IN ('requisition_attachments', 'requisition_workflows')
ORDER BY TABLE_NAME; 