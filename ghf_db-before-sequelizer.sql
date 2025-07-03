-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 02, 2025 at 05:03 PM
-- Server version: 8.0.42-0ubuntu0.24.04.1
-- PHP Version: 8.3.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ghf_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`msilu`@`localhost` PROCEDURE `CalculateLoanInstallment` (IN `p_loan_id` INT, IN `p_payroll_id` INT)   BEGIN
    DECLARE v_loan_amount DECIMAL(15,2)$$

CREATE DEFINER=`msilu`@`localhost` PROCEDURE `CalculateOvertimePay` (IN `p_user_id` INT, IN `p_month` INT, IN `p_year` INT)   BEGIN
    DECLARE v_total_overtime_hours DECIMAL(4,2)$$

CREATE DEFINER=`msilu`@`localhost` PROCEDURE `MarkNotificationsAsRead` (IN `p_user_id` INT, IN `p_notification_ids` TEXT)   BEGIN
    DECLARE v_notification_id INT$$

CREATE DEFINER=`msilu`@`localhost` PROCEDURE `SendNotification` (IN `p_user_id` INT, IN `p_payroll_id` INT, IN `p_notification_type` VARCHAR(50), IN `p_title` VARCHAR(255), IN `p_message` TEXT, IN `p_sent_via` VARCHAR(20), IN `p_priority` VARCHAR(20))   BEGIN
    INSERT INTO payroll_notifications (
        user_id, payroll_id, notification_type, title, message, 
        sent_via, sent_at, priority
    ) VALUES (
        p_user_id, p_payroll_id, p_notification_type, p_title, p_message,
        p_sent_via, NOW(), p_priority
    )$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `appraisal_forms`
--

CREATE TABLE `appraisal_forms` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `objective_id` int NOT NULL,
  `self_assessment` int DEFAULT NULL,
  `self_comment` text COLLATE utf8mb4_general_ci,
  `peer_review` int DEFAULT NULL,
  `peer_reviewer_id` int DEFAULT NULL,
  `peer_comment` text COLLATE utf8mb4_general_ci,
  `hr_review` int DEFAULT NULL,
  `hr_reviewer_id` int DEFAULT NULL,
  `hr_comment` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `appraisal_forms`
--

INSERT INTO `appraisal_forms` (`id`, `user_id`, `objective_id`, `self_assessment`, `self_comment`, `peer_review`, `peer_reviewer_id`, `peer_comment`, `hr_review`, `hr_reviewer_id`, `hr_comment`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 8, 'Achieved most goals, some delays due to external factors.', 7, 3, 'Bob showed good effort but faced some blockers.', 8, 1, 'Overall good performance, needs to work on collaboration.', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 2, 2, 6, 'Started learning, still in progress.', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` int NOT NULL,
  `asset_code` varchar(50) NOT NULL,
  `asset_name` varchar(255) NOT NULL,
  `asset_tag` varchar(50) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','maintenance','disposed','lost') DEFAULT 'active',
  `location` varchar(255) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `custodian_id` int DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(15,2) DEFAULT NULL,
  `current_value` decimal(15,2) DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `description` text,
  `notes` text,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asset_maintenance`
--

CREATE TABLE `asset_maintenance` (
  `id` int NOT NULL,
  `maintenance_number` varchar(50) NOT NULL,
  `asset_id` int NOT NULL,
  `maintenance_type` enum('preventive','corrective','emergency') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `scheduled_date` date NOT NULL,
  `completed_date` date DEFAULT NULL,
  `estimated_duration` varchar(50) DEFAULT NULL,
  `actual_duration` varchar(50) DEFAULT NULL,
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `actual_cost` decimal(15,2) DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `vendor_id` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `maintenance_category` varchar(100) DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `completion_percentage` int DEFAULT '0',
  `notes` text,
  `completion_notes` text,
  `created_by` int NOT NULL,
  `completed_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `arrival_time` timestamp NULL DEFAULT NULL,
  `departure_time` timestamp NULL DEFAULT NULL,
  `scheduler_status` enum('working day','weekend','holiday in working day','holiday in weekend') COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('absent','present','on leave','half day') COLLATE utf8mb4_general_ci DEFAULT 'absent',
  `description` text COLLATE utf8mb4_general_ci,
  `date` date NOT NULL,
  `activity` text COLLATE utf8mb4_general_ci,
  `approval_status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `submitted_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_general_ci,
  `supervisor_comments` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `user_id`, `arrival_time`, `departure_time`, `scheduler_status`, `status`, `description`, `date`, `activity`, `approval_status`, `submitted_at`, `submitted_by`, `approved_at`, `approved_by`, `rejected_at`, `rejected_by`, `rejection_reason`, `supervisor_comments`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-06-10 05:05:00', '2025-06-10 14:15:00', 'working day', 'present', 'Regular workday', '2025-06-10', 'Attended team meeting, worked on reports', 'approved', '2025-06-26 12:08:53', 1, '2025-06-26 12:09:06', 1, NULL, NULL, NULL, 'correct', '2025-06-13 19:05:21', '2025-06-26 12:09:06'),
(2, 2, '2025-06-10 05:30:00', '2025-06-10 14:00:00', 'working day', 'present', 'Working on Project X', '2025-06-10', 'Coding and debugging', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-13 19:05:21', '2025-06-26 11:14:32'),
(3, 1, NULL, NULL, 'weekend', 'absent', 'Weekend off', '2025-06-08', 'Resting', 'approved', '2025-06-26 12:08:53', 1, '2025-06-26 12:09:06', 1, NULL, NULL, NULL, 'correct', '2025-06-13 19:05:21', '2025-06-26 12:09:06'),
(4, 1, '2025-06-23 05:23:10', '2025-06-23 18:23:33', 'working day', 'present', 'Regular workday', '2025-06-23', 'Office work', 'approved', '2025-06-26 12:08:53', 1, '2025-06-26 12:09:06', 1, NULL, NULL, NULL, 'correct', '2025-06-23 18:23:10', '2025-06-26 12:09:06'),
(7, 1, '2025-06-25 21:57:44', '2025-06-25 21:57:46', 'working day', 'half day', 'Regular workday', '2025-06-25', 'Office work', 'approved', '2025-06-26 12:08:53', 1, '2025-06-26 12:09:06', 1, NULL, NULL, NULL, 'correct', '2025-06-25 21:57:44', '2025-06-26 12:09:06');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `total_hours` decimal(4,2) DEFAULT NULL,
  `overtime_hours` decimal(4,2) DEFAULT '0.00',
  `status` enum('present','absent','late','half_day','leave','sick') DEFAULT 'present',
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` enum('savings','current','salary','investment') COLLATE utf8mb4_unicode_ci DEFAULT 'salary',
  `branch_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_holder_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee bank account information for salary payments';

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `user_id`, `bank_name`, `account_number`, `account_type`, `branch_code`, `swift_code`, `iban`, `account_holder_name`, `is_primary`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'CRDB Bank', '1234567890', 'salary', '001', NULL, NULL, 'Admin User', 1, 1, '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(2, 2, 'NMB Bank', '0987654321', 'salary', '002', NULL, NULL, 'Finance Manager', 1, 1, '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(3, 3, 'NBC Bank', '1122334455', 'salary', '003', NULL, NULL, 'HR Manager', 1, 1, '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(4, 4, 'CRDB Bank', '5566778899', 'salary', '001', NULL, NULL, 'Operations Manager', 1, 1, '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(5, 5, 'NMB Bank', '9988776655', 'salary', '002', NULL, NULL, 'Marketing Manager', 1, 1, '2025-07-02 12:32:29', '2025-07-02 12:32:29');

-- --------------------------------------------------------

--
-- Table structure for table `basic_employee_data`
--

CREATE TABLE `basic_employee_data` (
  `user_id` int NOT NULL,
  `status` enum('active','inactive','on leave','terminated') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `registration_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_joined` date NOT NULL,
  `designation` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `employment_type` enum('full time','contract','intern','part time','volunteer') COLLATE utf8mb4_general_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  `salary` decimal(15,2) DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nida` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bima` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nssf` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `helsb` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `signature` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `basic_employee_data`
--

INSERT INTO `basic_employee_data` (`user_id`, `status`, `registration_number`, `date_joined`, `designation`, `employment_type`, `department_id`, `salary`, `supervisor_id`, `bank_name`, `account_number`, `nida`, `bima`, `nssf`, `helsb`, `signature`, `created_at`, `updated_at`) VALUES
(1, 'active', 'REG001', '2020-01-15', 'System Administrator', 'full time', 3, 5000000.00, 3, 'CRDB Bank', '1234567890', 'NIDA-12345', 'BIMA-111', 'NSSF-222', 'HELSB-333', '', '2025-06-13 19:05:21', '2025-06-15 22:39:20'),
(2, 'active', 'REG002', '2021-03-01', 'Software Developer', 'full time', 3, 3500000.00, 1, 'NMB Bank', '0987654321', 'NIDA-67890', 'BIMA-444', 'NSSF-555', NULL, NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 'active', 'REG003', '2019-07-20', 'IT Department Head', 'full time', 3, 4000000.00, 1, 'Standard Chartered', '1122334455', 'NIDA-13579', 'BIMA-777', 'NSSF-888', 'HELSB-999', NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, 'active', 'REG213243', '2025-06-10', 'HR MANAGER', 'full time', 1, 2500000.00, 1, 'CRDB Bank', '0129832893721', '21345678', '3289217821', '23823129', '3892637461', NULL, '2025-06-16 00:06:26', '2025-06-16 00:06:26');

-- --------------------------------------------------------

--
-- Table structure for table `bio_data`
--

CREATE TABLE `bio_data` (
  `user_id` int NOT NULL,
  `fingerprint_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `signature` text COLLATE utf8mb4_general_ci,
  `marital_status` enum('single','married','divorced','widowed') COLLATE utf8mb4_general_ci NOT NULL,
  `national_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dob` date NOT NULL,
  `blood_group` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bio_data`
--

INSERT INTO `bio_data` (`user_id`, `fingerprint_id`, `signature`, `marital_status`, `national_id`, `dob`, `blood_group`, `created_at`, `updated_at`) VALUES
(1, 'FINGER001', 'alice_signature_base64', 'married', 'NATID-001', '1985-05-10', 'O+', '2025-06-13 19:05:21', '2025-06-15 22:39:20'),
(2, 'FINGER002', 'bob_signature_base64', 'single', 'NATID-002', '1990-11-22', 'B-', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 'FINGER003', 'charlie_signature_base64', 'divorced', 'NATID-003', '1978-01-01', 'O+', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, '34567898765', '', 'single', '12345678987654456', '2001-06-20', 'O+', '2025-06-16 00:06:26', '2025-06-16 00:06:26');

-- --------------------------------------------------------

--
-- Table structure for table `bonus_records`
--

CREATE TABLE `bonus_records` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `bonus_type` enum('performance','annual','festival','retention','referral','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `pay_period` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'YYYY-MM format',
  `is_taxable` tinyint(1) DEFAULT '1',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee bonus records and approvals';

--
-- Dumping data for table `bonus_records`
--

INSERT INTO `bonus_records` (`id`, `user_id`, `bonus_type`, `amount`, `percentage`, `pay_period`, `is_taxable`, `reason`, `approved_by`, `approved_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'performance', 200000.00, 8.00, '2024-06', 1, 'Outstanding performance Q2', NULL, NULL, 'approved', '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(2, 2, 'annual', 300000.00, 12.00, '2024-06', 1, 'Annual bonus 2024', NULL, NULL, 'approved', '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(3, 3, 'festival', 100000.00, NULL, '2024-06', 1, 'Eid al-Fitr bonus', NULL, NULL, 'approved', '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(4, 4, 'retention', 150000.00, 6.00, '2024-06', 1, '5-year service bonus', NULL, NULL, 'pending', '2025-07-02 12:32:29', '2025-07-02 12:32:29');

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int NOT NULL,
  `quarter_id` int NOT NULL,
  `department_id` int NOT NULL,
  `activity_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `responsible_person_id` int NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `quarter_id`, `department_id`, `activity_name`, `responsible_person_id`, `description`, `amount`, `status`, `created_at`, `created_by`, `updated_at`, `approved_by`) VALUES
(1, 1, 3, 'IT Infrastructure Upgrade', 3, 'Upgrade network infrastructure and servers', 15000000.00, 'approved', '2025-06-13 19:05:21', 1, '2025-06-13 19:05:21', 1),
(2, 2, 2, 'HR Training Programs', 1, 'Employee development and training workshops', 5000000.00, 'submitted', '2025-06-13 19:05:21', 1, '2025-06-13 19:05:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `budget_expenses`
--

CREATE TABLE `budget_expenses` (
  `id` int NOT NULL,
  `budget_id` int NOT NULL,
  `expense_report_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budget_expenses`
--

INSERT INTO `budget_expenses` (`id`, `budget_id`, `expense_report_id`, `amount`, `created_at`) VALUES
(1, 1, 1, 230000.00, '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `department_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department_name`, `created_at`, `updated_at`) VALUES
(1, 'Human Resources', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 'Finance', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 'IT', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, 'Procurement', '2025-06-16 02:52:48', '2025-06-16 02:52:48');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `file_path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `file_size` int NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `user_id`, `name`, `description`, `file_path`, `file_type`, `file_size`, `uploaded_at`, `uploaded_by`) VALUES
(1, 1, 'Alice Resume', 'Resume for Alice Smith', '/documents/alice_resume.pdf', 'application/pdf', 102400, '2025-06-13 19:05:21', 1),
(2, 2, 'Bob Passport', 'Passport copy for Bob Johnson', '/documents/bob_passport.jpg', 'image/jpeg', 51200, '2025-06-13 19:05:21', 2),
(3, 3, 'Meeting Minutes 2025-06-10', 'Minutes for June 10, 2025 meeting', '/documents/meeting_minutes_20250610.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 204800, '2025-06-13 19:05:21', 1),
(7, 1, 'ERNEST_MALIMA_ CV.docx.pdf', 'Leave application supporting document', 'documents/1750600335597-cc36e25d0c1873aa.pdf', 'application/pdf', 135779, '2025-06-22 13:52:15', 1);

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

CREATE TABLE `emergency_contacts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `relationship` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergency_contacts`
--

INSERT INTO `emergency_contacts` (`id`, `user_id`, `name`, `phone_number`, `relationship`, `created_at`, `updated_at`) VALUES
(1, 1, 'John Smith', '9988776655', 'Spouse', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 2, 'Jane Johnson', '7766554433', 'Mother', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 3, 'David Brown', '5544332211', 'Sibling', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, 1, 'John Smith', '9988776655', 'Spouse', '2025-06-13 19:08:18', '2025-06-13 19:08:18'),
(5, 2, 'Jane Johnson', '7766554433', 'Mother', '2025-06-13 19:08:18', '2025-06-13 19:08:18'),
(6, 3, 'David Brown', '5544332211', 'Sibling', '2025-06-13 19:08:18', '2025-06-13 19:08:18');

-- --------------------------------------------------------

--
-- Table structure for table `expense_lines`
--

CREATE TABLE `expense_lines` (
  `id` int NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `has_receipt` tinyint(1) DEFAULT '1',
  `amount` decimal(15,2) NOT NULL,
  `document_id` int DEFAULT NULL,
  `expense_report_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expense_lines`
--

INSERT INTO `expense_lines` (`id`, `title`, `has_receipt`, `amount`, `document_id`, `expense_report_id`, `created_at`, `updated_at`) VALUES
(1, 'Hotel Accommodation', 1, 150000.00, NULL, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 'Bus Fare', 1, 80000.00, NULL, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `expense_reports`
--

CREATE TABLE `expense_reports` (
  `id` int NOT NULL,
  `travel_advance_request_id` int NOT NULL,
  `date` date NOT NULL,
  `document_id` int DEFAULT NULL,
  `expense_title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `receipt_document_id` int DEFAULT NULL,
  `expense_amount` decimal(15,2) NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `budget_line` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deadline` date NOT NULL,
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expense_reports`
--

INSERT INTO `expense_reports` (`id`, `travel_advance_request_id`, `date`, `document_id`, `expense_title`, `receipt_document_id`, `expense_amount`, `description`, `budget_line`, `deadline`, `status`, `created_at`, `updated_at`, `created_by`, `approved_by`) VALUES
(1, 1, '2025-07-15', NULL, 'Travel Expenses for Workshop', NULL, 230000.00, 'Accommodation and transport costs for workshop in Arusha', 'IT Training Budget', '2025-07-20', 'submitted', '2025-06-13 19:05:21', '2025-06-13 19:05:21', 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fingerprints`
--

CREATE TABLE `fingerprints` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `template` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fingerprints`
--

INSERT INTO `fingerprints` (`id`, `user_id`, `template`, `created_at`) VALUES
(1, 1, 'fingerprint_template_alice', '2025-06-13 19:05:21'),
(2, 2, 'fingerprint_template_bob', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `fiscal_years`
--

CREATE TABLE `fiscal_years` (
  `id` int NOT NULL,
  `year` varchar(9) COLLATE utf8mb4_general_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','inactive','closed') COLLATE utf8mb4_general_ci DEFAULT 'inactive',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fiscal_years`
--

INSERT INTO `fiscal_years` (`id`, `year`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`, `created_by`) VALUES
(1, '2024/2025', '2024-07-01', '2025-06-30', 'active', '2025-06-13 19:05:21', '2025-06-13 19:05:21', 1),
(2, '2023/2024', '2023-07-01', '2024-06-30', 'closed', '2025-06-13 19:05:21', '2025-06-13 19:05:21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `flat_rates`
--

CREATE TABLE `flat_rates` (
  `id` int NOT NULL,
  `location_category` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'TZS',
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flat_rates`
--

INSERT INTO `flat_rates` (`id`, `location_category`, `amount`, `currency`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Domestic Travel', 50000.00, 'TZS', 'Daily flat rate for domestic travel expenses', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 'International Travel', 200.00, 'USD', 'Daily flat rate for international travel expenses', '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `holiday_list`
--

CREATE TABLE `holiday_list` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `status` enum('editable','non-editable') COLLATE utf8mb4_general_ci DEFAULT 'editable',
  `is_workday` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holiday_list`
--

INSERT INTO `holiday_list` (`id`, `name`, `date`, `status`, `is_workday`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'New Year\'s Day', '2025-01-01', 'non-editable', 0, '2025-06-13 19:05:21', '2025-06-13 19:05:21', 1, 1),
(2, 'Independence Day', '2025-12-09', 'editable', 0, '2025-06-13 19:05:21', '2025-06-13 19:05:21', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `increments`
--

CREATE TABLE `increments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `increment_percentage` decimal(5,2) NOT NULL,
  `fiscal_year_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `increments`
--

INSERT INTO `increments` (`id`, `user_id`, `increment_percentage`, `fiscal_year_id`, `created_at`, `approved_by`) VALUES
(1, 2, 0.05, 1, '2025-06-13 19:05:21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `leave_applications`
--

CREATE TABLE `leave_applications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type_id` int NOT NULL,
  `starting_date` date NOT NULL,
  `end_date` date NOT NULL,
  `approval_status` enum('draft','pending','approved by supervisor','approved by hr','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `approver_id` int DEFAULT NULL,
  `validity_check` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_general_ci,
  `attachment_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_applications`
--

INSERT INTO `leave_applications` (`id`, `user_id`, `type_id`, `starting_date`, `end_date`, `approval_status`, `approver_id`, `validity_check`, `comment`, `attachment_id`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2025-07-01', '2025-07-07', 'approved by supervisor', 3, 'Valid', 'Annual leave for family vacation', NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 1, 2, '2025-06-15', '2025-06-17', 'pending', 3, 'Valid', 'Fever, doctor’s note submitted upon return', NULL, '2025-06-13 19:05:21', '2025-06-22 01:23:18'),
(6, 1, 5, '2025-06-22', '2025-06-26', 'pending', NULL, '5 days', 'I need some compacionate', 7, '2025-06-22 13:52:15', '2025-06-22 13:52:15');

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `leave_type` enum('annual','sick','maternity','paternity','unpaid','other') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` int NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `rejection_reason` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `minimum_days` int NOT NULL DEFAULT '1',
  `maximum_days` int NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `name`, `minimum_days`, `maximum_days`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Annual Leave', 1, 28, 'Regular annual leave', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(2, 'Sick Leave', 1, 30, 'Leave due to illness with medical certificate required for more than 2 days', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(3, 'Maternity Leave', 84, 84, 'Leave for female employees for childbirth', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(4, 'Paternity Leave', 3, 3, 'Leave for male employees when their spouse gives birth', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(5, 'Compassionate Leave', 1, 5, 'Leave due to death or serious illness of a family member', '2025-05-17 21:20:28', '2025-05-17 21:20:28');

-- --------------------------------------------------------

--
-- Table structure for table `loan_installments`
--

CREATE TABLE `loan_installments` (
  `id` int NOT NULL,
  `loan_id` int NOT NULL,
  `payroll_id` int DEFAULT NULL,
  `installment_number` int NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) DEFAULT '0.00',
  `principal_amount` decimal(15,2) NOT NULL,
  `status` enum('pending','paid','overdue','waived') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `paid_date` date DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Individual loan installment records';

-- --------------------------------------------------------

--
-- Table structure for table `loan_records`
--

CREATE TABLE `loan_records` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `loan_type` enum('salary_advance','personal_loan','housing_loan','vehicle_loan','education_loan','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `loan_amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL,
  `monthly_installment` decimal(15,2) NOT NULL,
  `total_installments` int NOT NULL,
  `remaining_installments` int NOT NULL,
  `remaining_amount` decimal(15,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','completed','defaulted','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee loan records and repayment schedules';

--
-- Dumping data for table `loan_records`
--

INSERT INTO `loan_records` (`id`, `user_id`, `loan_type`, `loan_amount`, `interest_rate`, `total_amount`, `monthly_installment`, `total_installments`, `remaining_installments`, `remaining_amount`, `start_date`, `end_date`, `status`, `approved_by`, `approved_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'personal_loan', 500000.00, 12.00, 560000.00, 46666.67, 12, 8, 373333.36, '2024-01-01', '2024-12-31', 'active', 2, NULL, NULL, '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(2, 3, 'housing_loan', 2000000.00, 8.00, 2160000.00, 180000.00, 12, 10, 1800000.00, '2024-02-01', '2025-01-31', 'active', 2, NULL, NULL, '2025-07-02 12:32:29', '2025-07-02 12:32:29');

--
-- Triggers `loan_records`
--
DELIMITER $$
CREATE TRIGGER `update_loan_status_completed` AFTER UPDATE ON `loan_records` FOR EACH ROW BEGIN
    IF NEW.remaining_installments = 0 AND NEW.status = 'active' THEN
        UPDATE loan_records 
        SET status = 'completed', updated_at = NOW()
        WHERE id = NEW.id$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `lpo`
--

CREATE TABLE `lpo` (
  `id` int NOT NULL,
  `po_number` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `supplier_id` int NOT NULL,
  `item_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `invoice_document_id` int DEFAULT NULL,
  `delivery_note_document_id` int DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'TZS',
  `status` enum('pending','delivered','paid','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lpo`
--

INSERT INTO `lpo` (`id`, `po_number`, `supplier_id`, `item_name`, `invoice_document_id`, `delivery_note_document_id`, `amount`, `currency`, `status`, `created_at`, `updated_at`, `created_by`, `approved_by`) VALUES
(1, 'PO001', 1, 'New Servers', NULL, NULL, 5000000.00, 'TZS', 'pending', '2025-06-13 19:05:21', '2025-06-13 19:05:21', 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` int NOT NULL,
  `meeting_title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `meeting_type` enum('board','management','department','team','project','one_on_one','client') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'team',
  `meeting_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_virtual` tinyint(1) DEFAULT '0',
  `meeting_link` text COLLATE utf8mb4_general_ci,
  `chairperson` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `organizer` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `agenda_items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `status` enum('scheduled','in_progress','completed','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'scheduled',
  `minutes_document_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`id`, `meeting_title`, `meeting_type`, `meeting_date`, `start_time`, `end_time`, `location`, `is_virtual`, `meeting_link`, `chairperson`, `organizer`, `agenda_items`, `status`, `minutes_document_id`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Q3 Board Meeting', 'board', '2025-07-15', '10:00:00', '12:00:00', 'Boardroom, GHF Headquarters', 0, NULL, 'Kwayu Elibariki Mmari', 'Denis Daniel Msuya', '[{\"item\": \"Financial Review Q3\", \"duration\": \"30 mins\", \"presenter\": \"Finance Manager\"}, {\"item\": \"Strategic Planning Update\", \"duration\": \"45 mins\", \"presenter\": \"CEO\"}, {\"item\": \"New Project Approvals\", \"duration\": \"30 mins\", \"presenter\": \"Program Director\"}, {\"item\": \"Risk Management Discussion\", \"duration\": \"15 mins\", \"presenter\": \"Admin\"}]', 'scheduled', NULL, 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(2, 'Monthly Management Review', 'management', '2025-07-08', '14:00:00', '16:00:00', 'Conference Room A', 0, NULL, 'Charlie Brown', 'Bob M. Johnson', '[{\"item\": \"Departmental Updates\", \"duration\": \"60 mins\", \"presenter\": \"All Heads\"}, {\"item\": \"Budget Review\", \"duration\": \"30 mins\", \"presenter\": \"Finance\"}, {\"item\": \"HR Policy Updates\", \"duration\": \"30 mins\", \"presenter\": \"HR Manager\"}]', 'in_progress', NULL, 3, '2025-06-27 13:09:02', '2025-06-27 14:52:59'),
(3, 'Weekly IT Team Standup', 'team', '2025-07-02', '09:00:00', '10:00:00', 'Online', 1, 'https://zoom.us/j/1234567890', 'Denis Daniel Msuya', 'Denis Daniel Msuya', '[{\"item\": \"Sprint Review\", \"duration\": \"20 mins\", \"presenter\": \"Tech Lead\"}, {\"item\": \"Current Blockers\", \"duration\": \"15 mins\", \"presenter\": \"Team\"}, {\"item\": \"Next Sprint Planning\", \"duration\": \"25 mins\", \"presenter\": \"Scrum Master\"}]', 'completed', NULL, 4, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(4, 'HR Department Meeting', 'department', '2025-07-10', '11:00:00', '12:30:00', 'HR Meeting Room', 0, NULL, 'Ernest Elibariki Mmari', 'Kwayu Elibariki Mmari', '[{\"item\": \"New Employee Onboarding Process\", \"duration\": \"30 mins\", \"presenter\": \"HR Coordinator\"}, {\"item\": \"Performance Review Timeline\", \"duration\": \"30 mins\", \"presenter\": \"HR Manager\"}, {\"item\": \"Training Schedule Q3\", \"duration\": \"30 mins\", \"presenter\": \"Training Officer\"}]', 'in_progress', NULL, 5, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(5, 'Donor Partnership Meeting - USAID', 'client', '2025-07-12', '15:00:00', '17:00:00', 'Executive Meeting Room', 0, NULL, 'Kwayu Elibariki Mmari', 'Charlie Brown', '[{\"item\": \"Project Progress Report\", \"duration\": \"45 mins\", \"presenter\": \"Project Manager\"}, {\"item\": \"Budget Utilization Review\", \"duration\": \"30 mins\", \"presenter\": \"Finance Director\"}, {\"item\": \"Next Phase Planning\", \"duration\": \"30 mins\", \"presenter\": \"Program Director\"}, {\"item\": \"Compliance Update\", \"duration\": \"15 mins\", \"presenter\": \"Compliance Officer\"}]', 'scheduled', NULL, 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_attendees`
--

CREATE TABLE `meeting_attendees` (
  `id` int NOT NULL,
  `meeting_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `attendance_status` enum('invited','confirmed','attended','absent','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'invited',
  `is_required` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_attendees`
--

INSERT INTO `meeting_attendees` (`id`, `meeting_id`, `user_id`, `name`, `email`, `role`, `attendance_status`, `is_required`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Kwayu Elibariki Mmari', 'developerkwayu@gmail.com', 'Chairperson', 'confirmed', 1, 'Board Chair', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(2, 1, 3, 'Charlie Brown', 'mmaridenis@gmail.com', 'CEO', 'confirmed', 1, 'Chief Executive Officer', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(3, 1, 4, 'Denis Daniel Msuya', 'msuya@gmail.com', 'Finance Director', 'confirmed', 1, 'Financial oversight', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(4, 1, 5, 'Ernest Elibariki Mmari', 'malima@gmail.com', 'Program Director', 'invited', 1, 'Program updates', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(5, 2, 3, 'Charlie Brown', 'mmaridenis@gmail.com', 'Chairperson', 'confirmed', 1, 'Meeting Chair', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(6, 2, 2, 'Bob M. Johnson', 'bob@gmail.com', 'IT Manager', 'confirmed', 1, 'Technology updates', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(7, 2, 1, 'Kwayu Elibariki Mmari', 'developerkwayu@gmail.com', 'HR Manager', 'confirmed', 1, 'HR policies', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(8, 2, 4, 'Denis Daniel Msuya', 'msuya@gmail.com', 'Finance Manager', 'confirmed', 1, 'Budget review', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(9, 3, 4, 'Denis Daniel Msuya', 'msuya@gmail.com', 'Team Lead', 'attended', 1, 'Sprint lead', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(10, 3, 2, 'Bob M. Johnson', 'bob@gmail.com', 'Developer', 'attended', 1, 'Development updates', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(11, 3, NULL, 'Sarah Tech', 'sarah.tech@ghf.org', 'QA Engineer', 'attended', 0, 'Quality assurance', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(12, 3, NULL, 'Mike Code', 'mike.code@ghf.org', 'Junior Developer', 'attended', 0, 'Development support', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(13, 4, 5, 'Ernest Elibariki Mmari', 'malima@gmail.com', 'Chairperson', 'invited', 1, 'Department Head', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(14, 4, 1, 'Kwayu Elibariki Mmari', 'developerkwayu@gmail.com', 'HR Coordinator', 'invited', 1, 'HR operations', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(15, 4, NULL, 'Grace Admin', 'grace.admin@ghf.org', 'HR Assistant', 'invited', 0, 'Administrative support', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(16, 5, 1, 'Kwayu Elibariki Mmari', 'developerkwayu@gmail.com', 'Chairperson', 'confirmed', 1, 'Meeting lead', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(17, 5, 3, 'Charlie Brown', 'mmaridenis@gmail.com', 'CEO', 'confirmed', 1, 'Executive representation', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(18, 5, 4, 'Denis Daniel Msuya', 'msuya@gmail.com', 'Finance Director', 'confirmed', 1, 'Financial reporting', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(19, 5, NULL, 'John USAID', 'john.donor@usaid.gov', 'USAID Representative', 'confirmed', 1, 'Donor representative', '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(20, 5, NULL, 'Mary Program', 'mary.program@usaid.gov', 'Program Officer', 'confirmed', 1, 'Program oversight', '2025-06-27 13:09:02', '2025-06-27 13:09:02');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_documents`
--

CREATE TABLE `meeting_documents` (
  `id` int NOT NULL,
  `meeting_id` int NOT NULL,
  `document_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `document_type` enum('agenda','minutes','presentation','report','attachment') COLLATE utf8mb4_general_ci DEFAULT 'attachment',
  `uploaded_by` int NOT NULL,
  `upload_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` text COLLATE utf8mb4_general_ci,
  `is_public` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_documents`
--

INSERT INTO `meeting_documents` (`id`, `meeting_id`, `document_name`, `file_path`, `file_size`, `file_type`, `document_type`, `uploaded_by`, `upload_date`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 1, 'Q3 Financial Report.pdf', '/uploads/meetings/q3_financial_report.pdf', 2456789, 'application/pdf', 'report', 4, '2025-06-27 13:09:02', 'Quarterly financial performance report', 0, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(2, 1, 'Board Meeting Agenda.docx', '/uploads/meetings/board_agenda_july.docx', 125640, 'application/msword', 'agenda', 1, '2025-06-27 13:09:02', 'Detailed meeting agenda with time allocations', 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(3, 1, 'Strategic Plan Presentation.pptx', '/uploads/meetings/strategic_plan.pptx', 5678901, 'application/vnd.ms-powerpoint', 'presentation', 3, '2025-06-27 13:09:02', 'Q4 strategic planning presentation', 0, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(4, 2, 'Management Meeting Minutes.pdf', '/uploads/meetings/mgmt_minutes_june.pdf', 567890, 'application/pdf', 'minutes', 2, '2025-06-27 13:09:02', 'Previous meeting minutes for reference', 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(5, 2, 'Department Budget Review.xlsx', '/uploads/meetings/dept_budget_review.xlsx', 234567, 'application/vnd.ms-excel', 'report', 4, '2025-06-27 13:09:02', 'Departmental budget analysis', 0, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(6, 3, 'Sprint Review Report.pdf', '/uploads/meetings/sprint_review.pdf', 456789, 'application/pdf', 'report', 4, '2025-06-27 13:09:02', 'Current sprint progress and metrics', 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(7, 3, 'Technical Blockers List.docx', '/uploads/meetings/tech_blockers.docx', 89012, 'application/msword', 'attachment', 2, '2025-06-27 13:09:02', 'List of current technical challenges', 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(8, 4, 'HR Policy Updates.pdf', '/uploads/meetings/hr_policy_updates.pdf', 789012, 'application/pdf', 'report', 5, '2025-06-27 13:09:02', 'Updated HR policies and procedures', 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(9, 4, 'Training Schedule Q3.xlsx', '/uploads/meetings/training_schedule.xlsx', 123456, 'application/vnd.ms-excel', 'attachment', 1, '2025-06-27 13:09:02', 'Employee training calendar', 1, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(10, 5, 'USAID Project Report.pdf', '/uploads/meetings/usaid_project_report.pdf', 3456789, 'application/pdf', 'report', 3, '2025-06-27 13:09:02', 'Comprehensive project progress report', 0, '2025-06-27 13:09:02', '2025-06-27 13:09:02'),
(11, 5, 'Budget Utilization Analysis.xlsx', '/uploads/meetings/budget_utilization.xlsx', 567890, 'application/vnd.ms-excel', 'report', 4, '2025-06-27 13:09:02', 'Detailed budget analysis and utilization', 0, '2025-06-27 13:09:02', '2025-06-27 13:09:02');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_records`
--

CREATE TABLE `meeting_records` (
  `id` int NOT NULL,
  `date` datetime NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `uploader_user_id` int NOT NULL,
  `chairperson_user_id` int NOT NULL,
  `document_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_records`
--

INSERT INTO `meeting_records` (`id`, `date`, `title`, `description`, `uploader_user_id`, `chairperson_user_id`, `document_id`, `created_at`, `updated_at`) VALUES
(1, '2025-06-10 09:00:00', 'Weekly IT Department Meeting', 'Discussion on Q3 projects and infrastructure.', 1, 3, 3, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, '2025-06-25 14:00:00', 'Previous Management Meeting', 'Monthly review of departmental performance and budget allocation discussions', 2, 3, NULL, '2025-06-27 10:09:02', '2025-06-27 10:09:02'),
(3, '2025-06-20 09:00:00', 'IT Sprint Review - Week 25', 'Review of development sprint with focus on GHF system enhancements', 4, 4, NULL, '2025-06-27 10:09:02', '2025-06-27 10:09:02'),
(4, '2025-06-18 15:30:00', 'Emergency Board Session', 'Urgent discussion on donor funding changes and project adjustments', 1, 1, NULL, '2025-06-27 10:09:02', '2025-06-27 10:09:02'),
(5, '2025-06-15 11:00:00', 'HR Policy Review Meeting', 'Discussion on updated employee handbook and new recruitment procedures', 5, 5, NULL, '2025-06-27 10:09:02', '2025-06-27 10:09:02'),
(6, '2025-06-12 16:00:00', 'Quarterly Stakeholder Meeting', 'Review of Q2 achievements and planning for Q3 objectives', 3, 1, NULL, '2025-06-27 10:09:02', '2025-06-27 10:09:02');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_tasks`
--

CREATE TABLE `meeting_tasks` (
  `id` int NOT NULL,
  `meeting_id` int NOT NULL,
  `task_description` text COLLATE utf8mb4_general_ci NOT NULL,
  `assigned_to` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `assigned_user_id` int DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_general_ci DEFAULT 'medium',
  `progress` int DEFAULT '0',
  `notes` text COLLATE utf8mb4_general_ci,
  `created_by` int NOT NULL,
  `raised_by_user_id` int NOT NULL,
  `assigned_to_user_id` int NOT NULL,
  `status` enum('not_started','in_progress','completed','cancelled','overdue') COLLATE utf8mb4_general_ci DEFAULT 'not_started',
  `follow_up_person_user_id` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_general_ci,
  `due_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_tasks`
--

INSERT INTO `meeting_tasks` (`id`, `meeting_id`, `task_description`, `assigned_to`, `assigned_user_id`, `priority`, `progress`, `notes`, `created_by`, `raised_by_user_id`, `assigned_to_user_id`, `status`, `follow_up_person_user_id`, `comment`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 1, '', '', NULL, 'medium', 0, NULL, 0, 3, 2, 'in_progress', 3, 'Investigate new virtualization software.', '2025-06-20', '2025-06-13 22:05:21', '2025-06-27 12:05:35'),
(2, 1, '', '', NULL, 'medium', 0, NULL, 0, 3, 1, 'not_started', NULL, 'Prepare budget report for next quarter.', '2025-06-25', '2025-06-13 22:05:21', '2025-06-27 12:05:35'),
(3, 1, 'Prepare detailed Q4 budget proposal with departmental breakdown', 'Denis Daniel Msuya', 4, 'high', 25, 'Initial draft started', 1, 1, 4, 'in_progress', 1, 'Focus on capital expenditure requirements', '2025-07-30', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(4, 1, 'Review and update risk management framework', 'Charlie Brown', 3, 'medium', 0, NULL, 1, 1, 3, 'not_started', 1, 'Include new compliance requirements', '2025-08-15', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(5, 1, 'Conduct board member orientation for new member', 'Kwayu Elibariki Mmari', 1, 'medium', 10, 'Materials being prepared', 1, 1, 1, 'in_progress', NULL, 'Schedule for early August', '2025-08-05', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(6, 2, 'Implement new employee performance tracking system', 'Bob M. Johnson', 2, 'high', 60, 'System design completed, development in progress', 3, 3, 2, 'in_progress', 3, 'Integration with existing HR system required', '2025-08-01', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(7, 2, 'Update departmental SOPs for new compliance requirements', 'Ernest Elibariki Mmari', 5, 'medium', 30, 'Three departments completed', 3, 3, 5, 'in_progress', 1, 'Focus on finance and program departments next', '2025-07-25', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(8, 2, 'Organize cross-departmental collaboration workshop', 'Kwayu Elibariki Mmari', 1, 'low', 15, 'Venue and date being finalized', 3, 3, 1, 'in_progress', 3, 'Target mid-August for maximum attendance', '2025-08-20', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(9, 3, 'Resolve database performance issues in production', 'Denis Daniel Msuya', 4, 'urgent', 80, 'Root cause identified, optimization in progress', 4, 4, 4, 'in_progress', 2, 'Monitor performance metrics closely', '2025-07-05', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(10, 3, 'Deploy new backup and recovery solution', 'Bob M. Johnson', 2, 'high', 45, 'Testing phase completed, deployment planned', 4, 4, 2, 'in_progress', 4, 'Schedule deployment for weekend to minimize disruption', '2025-07-15', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(11, 3, 'Update system documentation for recent changes', 'Denis Daniel Msuya', 4, 'medium', 20, 'Template prepared, content writing started', 4, 4, 4, 'in_progress', NULL, 'Include API documentation updates', '2025-07-20', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(12, 4, 'Revise employee onboarding checklist and process', 'Kwayu Elibariki Mmari', 1, 'medium', 70, 'Draft completed, under review', 5, 5, 1, 'in_progress', 5, 'Include feedback from recent hires', '2025-07-18', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(13, 4, 'Design comprehensive training program for Q3', 'Ernest Elibariki Mmari', 5, 'high', 40, 'Needs assessment completed, curriculum development ongoing', 5, 5, 5, 'in_progress', 1, 'Focus on technical and soft skills balance', '2025-08-01', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(14, 4, 'Update employee handbook with new policies', 'Kwayu Elibariki Mmari', 1, 'medium', 85, 'Nearly complete, final review pending', 5, 5, 1, 'in_progress', 5, 'Legal review required before publication', '2025-07-12', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(15, 5, 'Prepare comprehensive project impact assessment report', 'Charlie Brown', 3, 'high', 20, 'Data collection phase initiated', 1, 1, 3, 'in_progress', 4, 'Include beneficiary feedback and quantitative metrics', '2025-08-10', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(16, 5, 'Develop sustainability plan for project continuation', 'Ernest Elibariki Mmari', 5, 'high', 10, 'Initial framework being developed', 1, 1, 5, 'in_progress', 1, 'Consider multiple funding scenarios', '2025-08-15', '2025-06-27 13:11:48', '2025-06-27 13:11:48'),
(17, 5, 'Submit quarterly financial report to donor', 'Denis Daniel Msuya', 4, 'urgent', 90, 'Report compiled, final review in progress', 1, 1, 4, 'in_progress', 1, 'Ensure compliance with donor reporting requirements', '2025-07-08', '2025-06-27 13:11:48', '2025-06-27 13:11:48');

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` int NOT NULL,
  `menu_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `menu_label` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `menu_icon` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `menu_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `menu_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `menu_name`, `menu_label`, `menu_icon`, `menu_url`, `parent_id`, `menu_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'dashboard', 'Dashboard', 'DashboardOutlined', '/dashboard', NULL, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(2, 'employees', 'Employees', 'PeopleOutlined', NULL, NULL, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(3, 'employees_list', 'Employee List', 'PeopleOutlined', '/employees', 2, 1, 1, '2025-06-15 15:52:49', '2025-06-22 01:05:36'),
(4, 'employees_create', 'Add Employee', 'PersonAddOutlined', '/employees/create', 2, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(5, 'leaves', 'Leave Management', 'EventNoteOutlined', NULL, NULL, 3, 1, '2025-06-15 15:52:49', '2025-06-23 19:25:19'),
(6, 'leaves_list', 'My Leaves', 'EventNoteOutlined', '/leaves', 5, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(7, 'leaves_apply', 'Apply for Leave', 'AddCircleOutlined', '/leaves/create', 5, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(8, 'leaves_approvals', 'Leave Approvals', 'ApprovalOutlined', '/leaves/approvals', 5, 3, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(9, 'attendance', 'Attendance', 'AccessTimeOutlined', NULL, NULL, 4, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(10, 'attendance_clockin', 'Clock In/Out', 'AccessTimeOutlined', '/attendance', 9, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(11, 'attendance_reports', 'Attendance Reports', 'AssessmentOutlined', '/attendance/reports', 9, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(12, 'attendance_schedule', 'Work Schedule', 'ScheduleOutlined', '/attendance/schedule', 9, 3, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(13, 'departments', 'Departments', 'CorporateFareOutlined', NULL, NULL, 5, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(14, 'departments_list', 'Department List', 'CorporateFareOutlined', '/departments', 13, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(15, 'departments_create', 'Add Department', 'AddBusinessOutlined', '/departments/create', 13, 2, 0, '2025-06-15 15:52:49', '2025-06-23 13:26:37'),
(16, 'finance', 'Finance', 'AccountBalanceOutlined', NULL, NULL, 6, 1, '2025-06-15 15:52:49', '2025-06-30 16:13:34'),
(17, 'finance_overview', 'Finance Overview', 'AccountBalanceOutlined', '/finance', 16, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(18, 'finance_budgets', 'Budgets', 'AccountBalanceWalletOutlined', '/finance/budgets', 16, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(19, 'finance_assets', 'Asset Managenent', 'InventoryOutlined', '', 16, 3, 1, '2025-06-15 15:52:49', '2025-06-30 16:11:22'),
(20, 'finance_requisitions', 'Requisitions', 'RequestQuoteOutlined', '/finance/requisitions', 16, 4, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(21, 'documents', 'Documents', 'FolderOutlined', '/documents', NULL, 14, 1, '2025-06-15 15:52:49', '2025-06-18 22:16:33'),
(22, 'reports', 'Reports', 'AssessmentOutlined', '/reports', NULL, 15, 1, '2025-06-15 15:52:49', '2025-06-18 22:16:33'),
(23, 'settings', 'Settings', 'SettingsOutlined', NULL, NULL, 16, 1, '2025-06-15 15:52:49', '2025-06-18 22:16:33'),
(24, 'settings_overview', 'Settings Overview', 'SettingsOutlined', '/settings', 23, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(25, 'settings_roles', 'Role Management', 'SecurityOutlined', '/settings/roles', 23, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(26, 'settings_menus', 'Menu Management', 'MenuOutlined', '/settings/menus', 23, 3, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(27, 'settings_users', 'User Management', 'SupervisedUserCircleOutlined', '/settings/users', 23, 4, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(28, 'profile', 'My Profile', 'PersonOutlined', '/profile', NULL, 17, 1, '2025-06-15 15:52:49', '2025-06-18 22:16:33'),
(29, 'performance', 'Performance', 'TrendingUpOutlined', NULL, NULL, 11, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(30, 'performance_appraisals', 'Performance Appraisals', 'AssessmentOutlined', '/performance/appraisals', 29, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(31, 'performance_objectives', 'Objectives Management', 'TrackChangesOutlined', '/performance/objectives', 29, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(32, 'meetings', 'Meetings', 'GroupOutlined', NULL, NULL, 12, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(33, 'meetings_list', 'Meeting Records', 'GroupOutlined', '/meetings', 32, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(34, 'meetings_create', 'Schedule Meeting', 'AddOutlined', '/meetings/create', 32, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(35, 'meetings_tasks', 'Meeting Tasks', 'TaskOutlined', '/meetings/tasks', 32, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(36, 'finance_payroll', 'Payroll Management', 'PaymentOutlined', NULL, 16, 5, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(37, 'payroll_overview', 'Payroll Overview', 'PaymentOutlined', '/finance/payroll', 36, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(38, 'payroll_process', 'Process Payroll', 'PlayArrowOutlined', '/finance/payroll/process', 36, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(39, 'payroll_history', 'Payroll History', 'HistoryOutlined', '/finance/payroll/history', 36, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(40, 'salary_components', 'Salary Components', 'AccountBalanceOutlined', '/finance/payroll/components', 36, 6, 1, '2025-06-18 22:16:33', '2025-06-23 17:38:41'),
(41, 'finance_travel', 'Travel & Advances', 'FlightOutlined', NULL, 16, 6, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(42, 'travel_requests', 'Travel Requests', 'FlightTakeoffOutlined', '/finance/travel/requests', 41, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(43, 'travel_advances', 'Travel Advances', 'AccountBalanceWalletOutlined', '/finance/travel/advances', 41, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(44, 'expense_reports', 'Expense Reports', 'ReceiptOutlined', '/finance/travel/expenses', 41, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(45, 'finance_petty_cash', 'Petty Cash', 'LocalAtmOutlined', NULL, 16, 7, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(46, 'petty_cash_book', 'Petty Cash Book', 'BookOutlined', '/finance/petty-cash', 45, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(47, 'petty_cash_expenses', 'Cash Expenses', 'MoneyOffOutlined', '/finance/petty-cash/expenses', 45, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(48, 'petty_cash_replenishment', 'Replenishment', 'AddCardOutlined', '/finance/petty-cash/replenishment', 45, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(49, 'procurement', 'Procurement', 'ShoppingCartOutlined', NULL, NULL, 13, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(50, 'procurement_suppliers', 'Suppliers', 'BusinessOutlined', '/procurement/suppliers', 49, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(51, 'procurement_quotations', 'Quotations', 'RequestQuoteOutlined', '/procurement/quotations', 49, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(52, 'procurement_orders', 'Purchase Orders', 'ShoppingCartOutlined', '/procurement/orders', 49, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(53, 'procurement_purchases', 'Purchase Requests', 'AddShoppingCartOutlined', '/procurement/requests', 49, 4, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(54, 'budget_planning', 'Budget Planning', 'AccountTreeOutlined', '/finance/budgets/planning', 16, 8, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(55, 'budget_monitoring', 'Budget Monitoring', 'MonitorOutlined', '/finance/budgets/monitoring', 16, 9, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(56, 'budget_variance', 'Budget Variance', 'CompareArrowsOutlined', '/finance/budgets/variance', 16, 10, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(57, 'reports_hr', 'HR Reports', 'PeopleOutlined', '/reports/hr', 22, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(58, 'reports_finance', 'Financial Reports', 'AccountBalanceOutlined', '/reports/finance', 22, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(59, 'reports_payroll', 'Payroll Reports', 'PaymentOutlined', '/reports/payroll', 22, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(60, 'reports_attendance', 'Attendance Reports', 'AccessTimeOutlined', '/reports/attendance', 22, 4, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(61, 'reports_procurement', 'Procurement Reports', 'ShoppingCartOutlined', '/reports/procurement', 22, 5, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(62, 'settings_fiscal', 'Fiscal Year Settings', 'DateRangeOutlined', '/settings/fiscal-year', 23, 5, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(63, 'settings_salary', 'Salary Scale Management', 'MoneyOutlined', '/settings/salary-scale', 23, 6, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(64, 'settings_leave_types', 'Leave Type Settings', 'EventAvailableOutlined', '/settings/leave-types', 23, 7, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(65, 'settings_holidays', 'Holiday Management', 'EventOutlined', '/settings/holidays', 23, 8, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(66, 'assets_register', 'Asset Register', 'InventoryOutlined', '/finance/assets/register', 19, 1, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(67, 'assets_depreciation', 'Asset Depreciation', 'TrendingDownOutlined', '/finance/assets/depreciation', 19, 2, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(68, 'assets_maintenance', 'Asset Maintenance', 'BuildOutlined', '/finance/assets/maintenance', 19, 3, 1, '2025-06-18 22:16:33', '2025-06-18 22:16:33'),
(69, 'attendance_timesheet', 'Monthly Timesheet', 'AssignmentOutlined', '/attendance/timesheet', 9, 4, 1, '2025-06-23 17:38:41', '2025-06-23 17:38:41'),
(70, 'attendance_timesheet_approval', 'Timesheet Approvals', 'ApprovalOutlined', '/attendance/timesheet/approval', 9, 5, 1, '2025-06-23 17:38:41', '2025-06-23 17:38:41'),
(71, 'payroll_processing', 'Process Payroll', 'PaymentOutlined', '/finance/payroll/processing', 36, 5, 1, '2025-06-23 17:38:41', '2025-06-23 17:38:41');

-- --------------------------------------------------------

--
-- Table structure for table `menu_permissions`
--

CREATE TABLE `menu_permissions` (
  `id` int NOT NULL,
  `menu_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `next_of_kin`
--

CREATE TABLE `next_of_kin` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `percentage` int NOT NULL,
  `relationship` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `next_of_kin`
--

INSERT INTO `next_of_kin` (`id`, `user_id`, `name`, `phone_number`, `percentage`, `relationship`, `created_at`, `updated_at`) VALUES
(1, 1, 'Sarah Smith', '1231231234', 100, 'Spouse', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 2, 'Robert Johnson', '4324324321', 50, 'Father', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 2, 'Emily Johnson', '5435435432', 50, 'Mother', '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `channel` enum('email','sms','in-app') COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('sent','delivered','read','failed') COLLATE utf8mb4_general_ci DEFAULT 'sent',
  `receiver_user_id` int NOT NULL,
  `sender_user_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `subject`, `message`, `channel`, `status`, `receiver_user_id`, `sender_user_id`, `created_at`) VALUES
(1, 'Welcome to GHF HR System', 'Your account has been created successfully.', 'in-app', 'read', 2, 1, '2025-06-13 19:05:21'),
(2, 'Leave Application Approved', 'Your leave from 2025-07-01 to 2025-07-07 has been approved.', 'email', 'sent', 2, 1, '2025-06-13 19:05:21'),
(3, 'New Policy Update', 'Please review the updated company policy document regarding remote work.', 'in-app', 'sent', 2, 1, '2025-06-13 19:08:18');

-- --------------------------------------------------------

--
-- Table structure for table `objectives`
--

CREATE TABLE `objectives` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `implementation_quarter` enum('Q1','Q2','Q3','Q4') COLLATE utf8mb4_general_ci NOT NULL,
  `fiscal_year_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `objectives`
--

INSERT INTO `objectives` (`id`, `user_id`, `title`, `description`, `is_approved`, `implementation_quarter`, `fiscal_year_id`, `created_at`, `updated_at`) VALUES
(1, 2, 'Complete Project X', 'Finish development of Project X by end of Q1', 1, 'Q1', 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 2, 'Learn New Skill', 'Acquire new programming language skills', 0, 'Q2', 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 3, 'Improve Team Efficiency', 'Implement new agile methodologies for the IT department', 1, 'Q1', 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `overtime_records`
--

CREATE TABLE `overtime_records` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `hours_worked` decimal(4,2) NOT NULL,
  `overtime_hours` decimal(4,2) NOT NULL,
  `overtime_rate` decimal(5,2) DEFAULT '1.50',
  `overtime_amount` decimal(15,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee overtime tracking and approval';

--
-- Dumping data for table `overtime_records`
--

INSERT INTO `overtime_records` (`id`, `user_id`, `date`, `hours_worked`, `overtime_hours`, `overtime_rate`, `overtime_amount`, `reason`, `approved_by`, `approved_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, '2024-06-15', 10.00, 2.00, 1.50, 30000.00, 'Project deadline', NULL, NULL, 'approved', '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(2, 2, '2024-06-16', 9.50, 1.50, 1.50, 22500.00, 'Month-end closing', NULL, NULL, 'approved', '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(3, 3, '2024-06-17', 8.00, 0.00, 1.50, 0.00, 'Regular hours', NULL, NULL, 'approved', '2025-07-02 12:32:29', '2025-07-02 12:32:29'),
(4, 4, '2024-06-18', 11.00, 3.00, 1.50, 45000.00, 'Emergency maintenance', NULL, NULL, 'pending', '2025-07-02 12:32:29', '2025-07-02 12:32:29');

--
-- Triggers `overtime_records`
--
DELIMITER $$
CREATE TRIGGER `calculate_overtime_amount_insert` BEFORE INSERT ON `overtime_records` FOR EACH ROW BEGIN
    DECLARE v_hourly_rate DECIMAL(15,2)$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `calculate_overtime_amount_update` BEFORE UPDATE ON `overtime_records` FOR EACH ROW BEGIN
    DECLARE v_hourly_rate DECIMAL(15,2)$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `base_salary` decimal(15,2) NOT NULL,
  `increment_id` int DEFAULT NULL,
  `total_earnings` decimal(15,2) NOT NULL,
  `total_deductions` decimal(15,2) NOT NULL,
  `net_pay` decimal(15,2) NOT NULL,
  `status` enum('draft','processed','approved','paid') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `processed_by` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `user_id`, `date`, `base_salary`, `increment_id`, `total_earnings`, `total_deductions`, `net_pay`, `status`, `processed_by`, `approved_by`, `created_at`, `updated_at`) VALUES
(1, 2, '2025-06-30', 3500000.00, 1, 3675000.00, 200000.00, 3475000.00, 'processed', 1, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `payrolls`
--

CREATE TABLE `payrolls` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `allowances` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON string of allowances array',
  `deductions` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON string of deductions array',
  `gross_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `net_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `payment_date` date DEFAULT NULL,
  `status` enum('pending','processed','approved','rejected','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approval_stage` int DEFAULT '0',
  `total_stages` int DEFAULT '1',
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Main payroll records with approval workflow';

--
-- Dumping data for table `payrolls`
--

INSERT INTO `payrolls` (`id`, `employee_id`, `month`, `year`, `basic_salary`, `allowances`, `deductions`, `gross_salary`, `net_salary`, `payment_date`, `status`, `approval_stage`, `total_stages`, `approved_by`, `approved_date`, `rejected_by`, `rejected_date`, `rejection_reason`, `notes`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 2024, 800000.00, NULL, NULL, 950000.00, 850000.00, NULL, 'approved', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(2, 2, 6, 2024, 1200000.00, NULL, NULL, 1400000.00, 1250000.00, NULL, 'approved', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(3, 3, 6, 2024, 900000.00, NULL, NULL, 1050000.00, 950000.00, NULL, 'pending', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(4, 4, 6, 2024, 700000.00, NULL, NULL, 850000.00, 750000.00, NULL, 'processed', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(5, 5, 6, 2024, 1000000.00, NULL, NULL, 1150000.00, 1050000.00, NULL, 'approved', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2025-07-02 19:02:54', '2025-07-02 19:02:54');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_adjustments`
--

CREATE TABLE `payroll_adjustments` (
  `id` int NOT NULL,
  `payroll_id` int NOT NULL,
  `adjustment_type` enum('addition','deduction') COLLATE utf8mb4_unicode_ci NOT NULL,
  `adjustment_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payroll adjustments and corrections';

-- --------------------------------------------------------

--
-- Table structure for table `payroll_allowances`
--

CREATE TABLE `payroll_allowances` (
  `id` int NOT NULL,
  `payroll_id` int NOT NULL,
  `allowance_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allowance_type` enum('housing','transport','lunch','overtime','bonus','performance','hardship','danger','night_shift','weekend','holiday','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `is_taxable` tinyint(1) DEFAULT '1',
  `is_recurring` tinyint(1) DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detailed breakdown of payroll allowances';

--
-- Dumping data for table `payroll_allowances`
--

INSERT INTO `payroll_allowances` (`id`, `payroll_id`, `allowance_name`, `allowance_type`, `amount`, `percentage`, `is_taxable`, `is_recurring`, `description`, `reference_number`, `created_at`) VALUES
(1, 1, 'Housing Allowance', 'housing', 100000.00, 12.50, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(2, 1, 'Transport Allowance', 'transport', 50000.00, 6.25, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(3, 2, 'Housing Allowance', 'housing', 150000.00, 12.50, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(4, 2, 'Transport Allowance', 'transport', 50000.00, 4.17, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(5, 3, 'Housing Allowance', 'housing', 120000.00, 13.33, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(6, 3, 'Transport Allowance', 'transport', 30000.00, 3.33, 1, 1, NULL, NULL, '2025-07-02 19:02:54');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_approvals`
--

CREATE TABLE `payroll_approvals` (
  `id` int NOT NULL,
  `payroll_id` int NOT NULL,
  `approver_id` int NOT NULL,
  `stage` int NOT NULL,
  `stage_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` enum('approved','rejected','returned') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `conditions` text COLLATE utf8mb4_unicode_ci,
  `approved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payroll approval workflow history and tracking';

--
-- Dumping data for table `payroll_approvals`
--

INSERT INTO `payroll_approvals` (`id`, `payroll_id`, `approver_id`, `stage`, `stage_name`, `action`, `comments`, `conditions`, `approved_at`) VALUES
(1, 1, 2, 1, 'Finance Review', 'approved', 'Payroll reviewed and approved', NULL, '2025-07-02 19:02:54'),
(2, 2, 2, 1, 'Finance Review', 'approved', 'All calculations verified', NULL, '2025-07-02 19:02:54'),
(3, 5, 2, 1, 'Finance Review', 'approved', 'Payroll approved for payment', NULL, '2025-07-02 19:02:54');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_deductions`
--

CREATE TABLE `payroll_deductions` (
  `id` int NOT NULL,
  `payroll_id` int NOT NULL,
  `deduction_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deduction_type` enum('tax','social_security','loan','insurance','pension','union_dues','advance','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `is_mandatory` tinyint(1) DEFAULT '0',
  `is_taxable` tinyint(1) DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detailed breakdown of payroll deductions';

--
-- Dumping data for table `payroll_deductions`
--

INSERT INTO `payroll_deductions` (`id`, `payroll_id`, `deduction_name`, `deduction_type`, `amount`, `percentage`, `is_mandatory`, `is_taxable`, `description`, `reference_number`, `created_at`) VALUES
(1, 1, 'PAYE Tax', 'tax', 80000.00, 10.00, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(2, 1, 'NSSF Contribution', 'social_security', 40000.00, 5.00, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(3, 2, 'PAYE Tax', 'tax', 120000.00, 10.00, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(4, 2, 'NSSF Contribution', 'social_security', 60000.00, 5.00, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(5, 3, 'PAYE Tax', 'tax', 90000.00, 10.00, 1, 1, NULL, NULL, '2025-07-02 19:02:54'),
(6, 3, 'NSSF Contribution', 'social_security', 45000.00, 5.00, 1, 1, NULL, NULL, '2025-07-02 19:02:54');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_notifications`
--

CREATE TABLE `payroll_notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `payroll_id` int DEFAULT NULL,
  `notification_type` enum('payslip_generated','payslip_sent','payroll_approved','payroll_rejected','payment_processed','payroll_created','payroll_updated','loan_deduction','bonus_awarded','overtime_approved') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `sent_via` enum('email','sms','system','push') COLLATE utf8mb4_unicode_ci DEFAULT 'system',
  `sent_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payroll notification system for employee communications';

--
-- Dumping data for table `payroll_notifications`
--

INSERT INTO `payroll_notifications` (`id`, `user_id`, `payroll_id`, `notification_type`, `title`, `message`, `is_read`, `sent_via`, `sent_at`, `read_at`, `priority`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'payroll_approved', 'Payroll Approved', 'Your payroll for June 2024 has been approved.', 0, 'email', NULL, NULL, 'high', '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(2, 2, 2, 'payroll_approved', 'Payroll Approved', 'Your payroll for June 2024 has been approved.', 0, 'email', NULL, NULL, 'high', '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(3, 3, 3, 'payroll_created', 'Payroll Created', 'Your payroll for June 2024 has been created.', 0, 'system', NULL, NULL, 'medium', '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(4, 4, 4, 'payment_processed', 'Payment Processed', 'Your salary payment for June 2024 has been processed.', 0, 'sms', NULL, NULL, 'high', '2025-07-02 19:02:54', '2025-07-02 19:02:54'),
(5, 5, 5, 'payroll_approved', 'Payroll Approved', 'Your payroll for June 2024 has been approved.', 0, 'email', NULL, NULL, 'high', '2025-07-02 19:02:54', '2025-07-02 19:02:54');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_processing_logs`
--

CREATE TABLE `payroll_processing_logs` (
  `id` int NOT NULL,
  `process_id` varchar(50) NOT NULL,
  `pay_period` varchar(7) NOT NULL,
  `total_employees` int NOT NULL DEFAULT '0',
  `processed_count` int NOT NULL DEFAULT '0',
  `failed_count` int NOT NULL DEFAULT '0',
  `total_gross_pay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_net_pay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `processing_time` int DEFAULT NULL,
  `status` enum('processing','completed','failed') DEFAULT 'processing',
  `error_details` text,
  `processed_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_settings`
--

CREATE TABLE `payroll_settings` (
  `id` int NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payslip_templates`
--

CREATE TABLE `payslip_templates` (
  `id` int NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `template_html` longtext NOT NULL,
  `template_css` text,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `action` enum('create','read','update','delete') COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `action`, `description`, `created_at`, `updated_at`) VALUES
(1, 'View Users', 'Users', 'read', 'Can view user list', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(2, 'Create User', 'Users', 'create', 'Can create new users', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(3, 'Edit User', 'Users', 'update', 'Can edit user information', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(4, 'Delete User', 'Users', 'delete', 'Can delete users', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(5, 'View Leaves', 'Leaves', 'read', 'Can view leave applications', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(6, 'Approve Leaves', 'Leaves', 'update', 'Can approve leave applications', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(7, 'View Dashboard', 'Dashboard', 'read', 'Can view dashboard', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(8, 'View Employees', 'HR', 'read', 'Can view employee list', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(9, 'Manage Employees', 'HR', 'create', 'Can create and manage employees', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(10, 'View Employee Profile', 'HR', 'read', 'Can view employee profiles', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(11, 'Edit Employee Profile', 'HR', 'update', 'Can edit employee profiles', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(12, 'Manage Leave', 'HR', 'create', 'Can manage leave applications', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(13, 'View Attendance', 'HR', 'read', 'Can view attendance records', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(14, 'Manage Attendance', 'HR', 'update', 'Can manage attendance records', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(15, 'View Performance', 'HR', 'read', 'Can view performance appraisals', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(16, 'Manage Performance', 'HR', 'create', 'Can manage performance appraisals', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(17, 'View Objectives', 'HR', 'read', 'Can view objectives', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(18, 'Manage Objectives', 'HR', 'create', 'Can manage objectives', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(19, 'View Payroll', 'Finance', 'read', 'Can view payroll', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(20, 'Manage Payroll', 'Finance', 'create', 'Can manage payroll', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(21, 'View Budget', 'Finance', 'read', 'Can view budgets', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(22, 'Manage Budget', 'Finance', 'create', 'Can manage budgets', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(23, 'View Expenses', 'Finance', 'read', 'Can view expense reports', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(24, 'Manage Expenses', 'Finance', 'create', 'Can manage expense reports', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(25, 'View Travel Advances', 'Finance', 'read', 'Can view travel advances', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(26, 'Manage Travel Advances', 'Finance', 'create', 'Can manage travel advances', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(27, 'View Petty Cash', 'Finance', 'read', 'Can view petty cash', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(28, 'Manage Petty Cash', 'Finance', 'create', 'Can manage petty cash', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(29, 'View Purchase Requests', 'Procurement', 'read', 'Can view purchase requests', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(30, 'Manage Purchase Requests', 'Procurement', 'create', 'Can manage purchase requests', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(31, 'View Quotations', 'Procurement', 'read', 'Can view quotations', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(32, 'Manage Quotations', 'Procurement', 'create', 'Can manage quotations', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(33, 'View Suppliers', 'Procurement', 'read', 'Can view suppliers', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(34, 'Manage Suppliers', 'Procurement', 'create', 'Can manage suppliers', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(35, 'View Purchase Orders', 'Procurement', 'read', 'Can view purchase orders', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(36, 'Manage Purchase Orders', 'Procurement', 'create', 'Can manage purchase orders', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(37, 'View Meetings', 'Meetings', 'read', 'Can view meeting records', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(38, 'Manage Meetings', 'Meetings', 'create', 'Can manage meeting records', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(39, 'View Meeting Tasks', 'Meetings', 'read', 'Can view meeting tasks', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(40, 'Manage Meeting Tasks', 'Meetings', 'create', 'Can manage meeting tasks', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(41, 'View Documents', 'Documents', 'read', 'Can view documents', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(42, 'Manage Documents', 'Documents', 'create', 'Can manage documents', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(43, 'View Reports', 'Reports', 'read', 'Can view reports', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(44, 'Generate Reports', 'Reports', 'create', 'Can generate reports', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(45, 'View Settings', 'Settings', 'read', 'Can view system settings', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(46, 'Manage Settings', 'Settings', 'create', 'Can manage system settings', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(47, 'Manage Users', 'Settings', 'create', 'Can manage system users', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(48, 'Manage Roles', 'Settings', 'create', 'Can manage system roles', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(49, 'Manage Permissions', 'Settings', 'create', 'Can manage system permissions', '2025-06-13 00:55:46', '2025-06-13 00:55:46'),
(50, 'View Dashboard', 'Dashboard', 'read', 'Can view dashboard', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(51, 'View Employee Profile', 'HR', 'read', 'Can view employee profiles', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(52, 'Edit Employee Profile', 'HR', 'update', 'Can edit employee profiles', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(53, 'Manage Attendance', 'HR', 'update', 'Can manage attendance records', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(54, 'View Performance', 'HR', 'read', 'Can view performance appraisals', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(55, 'Manage Performance', 'HR', 'create', 'Can manage performance appraisals', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(56, 'View Objectives', 'HR', 'read', 'Can view objectives', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(57, 'Manage Objectives', 'HR', 'create', 'Can manage objectives', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(58, 'View Payroll', 'Finance', 'read', 'Can view payroll', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(59, 'View Budget', 'Finance', 'read', 'Can view budgets', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(60, 'View Expenses', 'Finance', 'read', 'Can view expense reports', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(61, 'Manage Expenses', 'Finance', 'create', 'Can manage expense reports', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(62, 'View Travel Advances', 'Finance', 'read', 'Can view travel advances', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(63, 'Manage Travel Advances', 'Finance', 'create', 'Can manage travel advances', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(64, 'View Petty Cash', 'Finance', 'read', 'Can view petty cash', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(65, 'Manage Petty Cash', 'Finance', 'create', 'Can manage petty cash', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(66, 'View Purchase Requests', 'Procurement', 'read', 'Can view purchase requests', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(67, 'Manage Purchase Requests', 'Procurement', 'create', 'Can manage purchase requests', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(68, 'View Quotations', 'Procurement', 'read', 'Can view quotations', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(69, 'Manage Quotations', 'Procurement', 'create', 'Can manage quotations', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(70, 'View Suppliers', 'Procurement', 'read', 'Can view suppliers', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(71, 'Manage Suppliers', 'Procurement', 'create', 'Can manage suppliers', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(72, 'View Purchase Orders', 'Procurement', 'read', 'Can view purchase orders', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(73, 'Manage Purchase Orders', 'Procurement', 'create', 'Can manage purchase orders', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(74, 'View Meetings', 'Meetings', 'read', 'Can view meeting records', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(75, 'Manage Meetings', 'Meetings', 'create', 'Can manage meeting records', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(76, 'View Meeting Tasks', 'Meetings', 'read', 'Can view meeting tasks', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(77, 'Manage Meeting Tasks', 'Meetings', 'create', 'Can manage meeting tasks', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(78, 'View Documents', 'Documents', 'read', 'Can view documents', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(79, 'Manage Documents', 'Documents', 'create', 'Can manage documents', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(80, 'View Reports', 'Reports', 'read', 'Can view reports', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(81, 'Generate Reports', 'Reports', 'create', 'Can generate reports', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(82, 'View Settings', 'Settings', 'read', 'Can view system settings', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(83, 'Manage Settings', 'Settings', 'create', 'Can manage system settings', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(84, 'Manage Users', 'Settings', 'create', 'Can manage system users', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(85, 'Manage Roles', 'Settings', 'create', 'Can manage system roles', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(86, 'Manage Permissions', 'Settings', 'create', 'Can manage system permissions', '2025-06-13 00:58:30', '2025-06-13 00:58:30'),
(87, 'View Performance Appraisals', 'Performance', 'read', 'Can view performance appraisals', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(88, 'Create Performance Appraisals', 'Performance', 'create', 'Can create performance appraisals', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(89, 'Update Performance Appraisals', 'Performance', 'update', 'Can update performance appraisals', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(90, 'Delete Performance Appraisals', 'Performance', 'delete', 'Can delete performance appraisals', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(91, 'View Objectives', 'Performance', 'read', 'Can view objectives', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(92, 'Manage Objectives', 'Performance', 'create', 'Can manage objectives', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(93, 'Approve Objectives', 'Performance', 'update', 'Can approve objectives', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(94, 'View Performance Reports', 'Performance', 'read', 'Can view performance reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(95, 'View Meetings', 'Meetings', 'read', 'Can view meeting records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(96, 'Create Meetings', 'Meetings', 'create', 'Can create meeting records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(97, 'Update Meetings', 'Meetings', 'update', 'Can update meeting records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(98, 'Delete Meetings', 'Meetings', 'delete', 'Can delete meeting records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(99, 'View Meeting Tasks', 'Meetings', 'read', 'Can view meeting tasks', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(100, 'Assign Meeting Tasks', 'Meetings', 'create', 'Can assign meeting tasks', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(101, 'Update Task Status', 'Meetings', 'update', 'Can update task status', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(102, 'View Meeting Reports', 'Meetings', 'read', 'Can view meeting reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(103, 'View Payroll', 'Payroll', 'read', 'Can view payroll information', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(104, 'Process Payroll', 'Payroll', 'create', 'Can process payroll', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(105, 'Update Payroll', 'Payroll', 'update', 'Can update payroll records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(106, 'Delete Payroll', 'Payroll', 'delete', 'Can delete payroll records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(107, 'View Payroll History', 'Payroll', 'read', 'Can view payroll history', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(108, 'Approve Payroll', 'Payroll', 'update', 'Can approve payroll processing', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(109, 'View Salary Components', 'Payroll', 'read', 'Can view salary components', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(110, 'Manage Salary Components', 'Payroll', 'create', 'Can manage salary components', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(111, 'Generate Payroll Reports', 'Payroll', 'read', 'Can generate payroll reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(112, 'Export Payroll Data', 'Payroll', 'read', 'Can export payroll data', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(113, 'View Employee Payslips', 'Payroll', 'read', 'Can view employee payslips', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(114, 'Print Payroll Documents', 'Payroll', 'read', 'Can print payroll documents', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(115, 'View Travel Requests', 'Travel', 'read', 'Can view travel requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(116, 'Create Travel Requests', 'Travel', 'create', 'Can create travel requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(117, 'Update Travel Requests', 'Travel', 'update', 'Can update travel requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(118, 'Approve Travel Requests', 'Travel', 'update', 'Can approve travel requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(119, 'View Travel Advances', 'Travel', 'read', 'Can view travel advances', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(120, 'Process Travel Advances', 'Travel', 'create', 'Can process travel advances', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(121, 'View Expense Reports', 'Travel', 'read', 'Can view expense reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(122, 'Create Expense Reports', 'Travel', 'create', 'Can create expense reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(123, 'Approve Expense Reports', 'Travel', 'update', 'Can approve expense reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(124, 'Retire Travel Advances', 'Travel', 'update', 'Can retire travel advances', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(125, 'View Travel Reports', 'Travel', 'read', 'Can view travel reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(126, 'Manage Flat Rates', 'Travel', 'create', 'Can manage travel flat rates', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(127, 'View Petty Cash', 'PettyCash', 'read', 'Can view petty cash records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(128, 'Create Petty Cash Entry', 'PettyCash', 'create', 'Can create petty cash entries', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(129, 'Update Petty Cash', 'PettyCash', 'update', 'Can update petty cash records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(130, 'Delete Petty Cash Entry', 'PettyCash', 'delete', 'Can delete petty cash entries', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(131, 'Request Replenishment', 'PettyCash', 'create', 'Can request petty cash replenishment', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(132, 'Approve Replenishment', 'PettyCash', 'update', 'Can approve replenishment requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(133, 'View Petty Cash Reports', 'PettyCash', 'read', 'Can view petty cash reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(134, 'Manage Petty Cash Book', 'PettyCash', 'create', 'Can manage petty cash book', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(135, 'View Suppliers', 'Procurement', 'read', 'Can view suppliers', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(136, 'Manage Suppliers', 'Procurement', 'create', 'Can manage suppliers', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(137, 'View Quotations', 'Procurement', 'read', 'Can view quotations', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(138, 'Create Quotations', 'Procurement', 'create', 'Can create quotations', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(139, 'Compare Quotations', 'Procurement', 'read', 'Can compare quotations', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(140, 'Approve Quotations', 'Procurement', 'update', 'Can approve quotations', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(141, 'View Purchase Orders', 'Procurement', 'read', 'Can view purchase orders', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(142, 'Create Purchase Orders', 'Procurement', 'create', 'Can create purchase orders', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(143, 'Update Purchase Orders', 'Procurement', 'update', 'Can update purchase orders', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(144, 'View Purchase Requests', 'Procurement', 'read', 'Can view purchase requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(145, 'Create Purchase Requests', 'Procurement', 'create', 'Can create purchase requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(146, 'Approve Purchase Requests', 'Procurement', 'update', 'Can approve purchase requests', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(147, 'View Procurement Reports', 'Procurement', 'read', 'Can view procurement reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(148, 'Manage Vendor Selection', 'Procurement', 'update', 'Can manage vendor selection', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(149, 'Generate LPO', 'Procurement', 'create', 'Can generate Local Purchase Orders', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(150, 'Track Deliveries', 'Procurement', 'update', 'Can track delivery status', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(151, 'View Budget Planning', 'Budget', 'read', 'Can view budget planning', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(152, 'Create Budget Plans', 'Budget', 'create', 'Can create budget plans', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(153, 'Monitor Budget Performance', 'Budget', 'read', 'Can monitor budget performance', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(154, 'View Budget Variance', 'Budget', 'read', 'Can view budget variance reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(155, 'Approve Budget Revisions', 'Budget', 'update', 'Can approve budget revisions', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(156, 'Generate Budget Reports', 'Budget', 'read', 'Can generate budget reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(157, 'Manage Fiscal Year', 'Budget', 'create', 'Can manage fiscal year settings', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(158, 'Budget Allocation', 'Budget', 'create', 'Can allocate budget to departments', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(159, 'View Asset Register', 'Assets', 'read', 'Can view asset register', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(160, 'Manage Asset Register', 'Assets', 'create', 'Can manage asset register', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(161, 'View Asset Depreciation', 'Assets', 'read', 'Can view asset depreciation', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(162, 'Calculate Depreciation', 'Assets', 'create', 'Can calculate asset depreciation', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(163, 'View Asset Maintenance', 'Assets', 'read', 'Can view asset maintenance records', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(164, 'Schedule Maintenance', 'Assets', 'create', 'Can schedule asset maintenance', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(165, 'Generate Asset Reports', 'Assets', 'read', 'Can generate asset reports', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(166, 'Asset Disposal', 'Assets', 'update', 'Can process asset disposal', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(167, 'Manage Leave Types', 'Settings', 'create', 'Can manage leave types', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(168, 'Manage Holidays', 'Settings', 'create', 'Can manage holiday calendar', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(169, 'Manage Salary Scale', 'Settings', 'create', 'Can manage salary scale settings', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(170, 'View System Logs', 'Settings', 'read', 'Can view system audit logs', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(171, 'Backup System', 'Settings', 'create', 'Can perform system backup', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(172, 'System Configuration', 'Settings', 'create', 'Can configure system settings', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(173, 'Manage Email Templates', 'Settings', 'create', 'Can manage email templates', '2025-06-18 22:21:07', '2025-06-18 22:21:07'),
(174, 'Manage Notifications', 'Settings', 'create', 'Can manage notification settings', '2025-06-18 22:21:07', '2025-06-18 22:21:07');

-- --------------------------------------------------------

--
-- Table structure for table `personal_employee_data`
--

CREATE TABLE `personal_employee_data` (
  `user_id` int NOT NULL,
  `location` text COLLATE utf8mb4_general_ci NOT NULL,
  `education_level` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personal_employee_data`
--

INSERT INTO `personal_employee_data` (`user_id`, `location`, `education_level`, `created_at`, `updated_at`) VALUES
(1, 'Dar es Salaam, Tanzania', 'Masters Degree', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 'Arusha, Tanzania', 'Bachelors Degree', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 'Dodoma, Tanzania', 'PhD', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, 'Dar es salaam', 'Masters', '2025-06-16 00:06:26', '2025-06-16 00:06:26');

-- --------------------------------------------------------

--
-- Table structure for table `petty_cash_book`
--

CREATE TABLE `petty_cash_book` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount_received` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `maximum_amount` decimal(15,2) DEFAULT '750000.00',
  `minimum_amount` decimal(15,2) DEFAULT '120000.00',
  `balance` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `petty_cash_book`
--

INSERT INTO `petty_cash_book` (`id`, `user_id`, `amount_received`, `date`, `maximum_amount`, `minimum_amount`, `balance`, `created_at`, `updated_at`) VALUES
(1, 1, 500000.00, '2025-06-01', 750000.00, 120000.00, 500000.00, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `petty_cash_expenses`
--

CREATE TABLE `petty_cash_expenses` (
  `id` int NOT NULL,
  `petty_cash_book_id` int NOT NULL,
  `date` date NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `receipt_document_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `petty_cash_expenses`
--

INSERT INTO `petty_cash_expenses` (`id`, `petty_cash_book_id`, `date`, `description`, `amount`, `receipt_document_id`, `created_at`, `updated_at`, `created_by`) VALUES
(1, 1, '2025-06-05', 'Office supplies purchase', 50000.00, NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requests`
--

CREATE TABLE `purchase_requests` (
  `id` int NOT NULL,
  `item` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `budget_id` int NOT NULL,
  `requester_id` int NOT NULL,
  `quantity` int NOT NULL,
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected','processed') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_by` int DEFAULT NULL,
  `requisition_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_requests`
--

INSERT INTO `purchase_requests` (`id`, `item`, `budget_id`, `requester_id`, `quantity`, `estimated_cost`, `status`, `created_at`, `updated_at`, `approved_by`, `requisition_number`, `title`, `description`) VALUES
(1, 'New Office Chairs', 1, 2, 10, 1000000.00, 'submitted', '2025-06-13 19:05:21', '2025-06-13 19:05:21', NULL, '', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `quarters`
--

CREATE TABLE `quarters` (
  `id` int NOT NULL,
  `fiscal_year_id` int NOT NULL,
  `title` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quarters`
--

INSERT INTO `quarters` (`id`, `fiscal_year_id`, `title`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(1, 1, 'Q1', '2024-07-01', '2024-09-30', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 1, 'Q2', '2024-10-01', '2024-12-31', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 1, 'Q3', '2025-01-01', '2025-03-31', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, 1, 'Q4', '2025-04-01', '2025-06-30', '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `document_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `procurement_title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'TZS',
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `submitted_by` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotations`
--

INSERT INTO `quotations` (`id`, `supplier_id`, `document_id`, `date`, `procurement_title`, `amount`, `currency`, `description`, `created_at`, `updated_at`, `submitted_by`) VALUES
(1, 1, NULL, '2025-06-12', 'Quotation for New Servers', 4800000.00, 'TZS', 'Quotation for 5 Dell PowerEdge Servers', '2025-06-13 19:05:21', '2025-06-13 19:05:21', 3);

-- --------------------------------------------------------

--
-- Table structure for table `replenishment_requests`
--

CREATE TABLE `replenishment_requests` (
  `id` int NOT NULL,
  `petty_cash_book_id` int NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` enum('draft','submitted','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `description` text COLLATE utf8mb4_general_ci,
  `requested_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `replenishment_requests`
--

INSERT INTO `replenishment_requests` (`id`, `petty_cash_book_id`, `date`, `amount`, `status`, `description`, `requested_by`, `approved_by`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-06-10', 200000.00, 'submitted', 'Request for petty cash replenishment due to recent expenses.', 1, NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `requisition_attachments`
--

CREATE TABLE `requisition_attachments` (
  `id` int NOT NULL,
  `purchase_request_id` int NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requisition_items`
--

CREATE TABLE `requisition_items` (
  `id` int NOT NULL,
  `purchase_request_id` int NOT NULL COMMENT 'Reference to the parent purchase request',
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the item',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Detailed description of the item',
  `quantity` int NOT NULL DEFAULT '1' COMMENT 'Quantity required',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Unit price of the item',
  `total_price` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Total price (quantity * unit_price)',
  `specifications` text COLLATE utf8mb4_unicode_ci COMMENT 'Technical specifications or requirements',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Item category (Electronics, Office Supplies, etc.)',
  `supplier_preference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Preferred supplier for this item',
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Preferred brand',
  `model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Preferred model',
  `unit_of_measure` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pieces' COMMENT 'Unit of measure (pieces, kg, liters, etc.)',
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Internal item code or SKU',
  `is_urgent` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether this item is urgently needed',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes for this item',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requisition_workflows`
--

CREATE TABLE `requisition_workflows` (
  `id` int NOT NULL,
  `purchase_request_id` int NOT NULL,
  `stage` int NOT NULL,
  `stage_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_id` int NOT NULL,
  `action` enum('approved','rejected','returned','forwarded') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `conditions` text COLLATE utf8mb4_unicode_ci,
  `next_approver_id` int DEFAULT NULL,
  `completed_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'System administrator with full access', 1, '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(2, 'HR Manager', 'Human resources manager', 0, '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(3, 'Finance Manager', 'Finance department manager', 0, '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(4, 'Department Head', 'Head of a department', 0, '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(5, 'Employee', 'Regular employee', 1, '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(6, 'MEAL', 'MONITORING AND EVALUATION', 0, '2025-06-20 01:59:24', '2025-06-20 01:59:24'),
(7, 'Admin Assistant', 'This is an assistant to administer', 0, '2025-06-21 13:30:19', '2025-06-21 13:30:19');

-- --------------------------------------------------------

--
-- Table structure for table `role_menu_access`
--

CREATE TABLE `role_menu_access` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `can_access` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_menu_access`
--

INSERT INTO `role_menu_access` (`id`, `role_id`, `menu_id`, `can_access`, `created_at`, `updated_at`) VALUES
(72, 1, 1, 1, '2025-06-15 15:52:49', '2025-06-21 13:58:18'),
(73, 1, 2, 1, '2025-06-15 15:52:49', '2025-06-20 22:07:47'),
(74, 1, 5, 1, '2025-06-15 15:52:49', '2025-06-20 22:07:55'),
(75, 1, 9, 1, '2025-06-15 15:52:49', '2025-06-20 22:07:54'),
(76, 1, 13, 1, '2025-06-15 15:52:49', '2025-06-20 22:07:54'),
(77, 1, 16, 1, '2025-06-15 15:52:49', '2025-06-20 22:07:52'),
(78, 1, 21, 1, '2025-06-15 15:52:49', '2025-06-20 22:07:49'),
(79, 1, 22, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(80, 1, 23, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(81, 1, 28, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(82, 1, 3, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(83, 1, 4, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(84, 1, 6, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(85, 1, 7, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(86, 1, 8, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(87, 1, 10, 1, '2025-06-15 15:52:49', '2025-06-22 00:55:14'),
(88, 1, 11, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(89, 1, 12, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(90, 1, 14, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(91, 1, 15, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(92, 1, 17, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(93, 1, 18, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(95, 1, 20, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(96, 1, 24, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(97, 1, 25, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(98, 1, 26, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(99, 1, 27, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(103, 2, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(104, 2, 2, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(105, 2, 5, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(106, 2, 9, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(107, 2, 13, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(108, 2, 21, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(109, 2, 22, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(110, 2, 28, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(111, 2, 3, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(112, 2, 4, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(113, 2, 6, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(114, 2, 7, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(115, 2, 8, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(116, 2, 10, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(117, 2, 11, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(118, 2, 12, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(119, 2, 14, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(120, 2, 15, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(121, 2, 27, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(134, 4, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(135, 4, 5, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(136, 4, 9, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(137, 4, 13, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(138, 4, 21, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(139, 4, 22, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(140, 4, 28, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(141, 4, 6, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(142, 4, 7, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(143, 4, 8, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(144, 4, 10, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(145, 4, 11, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(146, 4, 14, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(149, 5, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(150, 5, 5, 1, '2025-06-15 15:52:49', '2025-06-21 13:46:28'),
(151, 5, 9, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(152, 5, 21, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(153, 5, 28, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(154, 5, 6, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(155, 5, 7, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(156, 5, 10, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(164, 3, 1, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(165, 3, 16, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(166, 3, 21, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(167, 3, 22, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(168, 3, 28, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(169, 3, 17, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(170, 3, 18, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(172, 3, 20, 1, '2025-06-15 15:52:49', '2025-06-15 15:52:49'),
(176, 1, 49, 1, '2025-06-20 22:07:50', '2025-06-20 22:07:50'),
(177, 1, 32, 1, '2025-06-20 22:07:51', '2025-06-20 22:07:51'),
(178, 1, 29, 1, '2025-06-20 22:07:51', '2025-06-20 22:07:51'),
(183, 1, 30, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(184, 1, 31, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(185, 1, 33, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(186, 1, 34, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(187, 1, 35, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(188, 1, 36, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(189, 1, 37, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(190, 1, 38, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(191, 1, 39, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(192, 1, 40, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(193, 1, 41, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(194, 1, 42, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(195, 1, 43, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(196, 1, 44, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(197, 1, 45, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(198, 1, 46, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(199, 1, 47, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(200, 1, 48, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(201, 1, 50, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(202, 1, 51, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(203, 1, 52, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(204, 1, 53, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(205, 1, 54, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(206, 1, 55, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(207, 1, 56, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(208, 1, 57, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(209, 1, 58, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(210, 1, 59, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(211, 1, 60, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(212, 1, 61, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(213, 1, 62, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(214, 1, 63, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(215, 1, 64, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(216, 1, 65, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(217, 1, 66, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(218, 1, 67, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(219, 1, 68, 1, '2025-06-21 13:00:19', '2025-06-21 13:00:19'),
(250, 7, 1, 1, '2025-06-21 13:58:24', '2025-06-21 13:58:24'),
(253, 1, 69, 1, '2025-06-23 17:46:18', '2025-06-23 17:46:18'),
(254, 7, 69, 1, '2025-06-23 17:50:19', '2025-06-23 17:50:19'),
(255, 4, 69, 1, '2025-06-23 17:50:32', '2025-06-23 17:50:32'),
(256, 5, 69, 1, '2025-06-23 17:50:38', '2025-06-23 17:50:38'),
(257, 3, 69, 1, '2025-06-23 17:50:46', '2025-06-23 17:50:46'),
(258, 2, 69, 1, '2025-06-23 17:50:50', '2025-06-23 17:50:50'),
(259, 6, 69, 1, '2025-06-23 17:50:53', '2025-06-23 17:50:53'),
(260, 7, 70, 1, '2025-06-26 10:55:43', '2025-06-26 10:55:43'),
(261, 1, 70, 1, '2025-06-26 10:55:43', '2025-06-26 10:55:43'),
(262, 1, 19, 1, '2025-06-30 16:11:22', '2025-06-30 16:11:22'),
(263, 3, 19, 1, '2025-06-30 16:11:22', '2025-06-30 16:11:22');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
(138, 2, 11, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(139, 2, 12, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(140, 2, 13, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(141, 2, 14, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(142, 2, 15, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(143, 2, 16, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(144, 2, 17, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(145, 2, 18, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(146, 2, 35, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(147, 2, 36, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(148, 2, 37, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(149, 2, 38, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(150, 2, 39, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(151, 2, 40, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(152, 2, 41, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(153, 2, 42, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(154, 2, 44, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(155, 3, 11, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(156, 3, 19, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(157, 3, 20, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(158, 3, 21, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(159, 3, 22, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(160, 3, 23, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(161, 3, 24, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(162, 3, 25, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(163, 3, 26, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(164, 3, 27, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(165, 3, 28, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(166, 3, 29, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(167, 3, 30, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(168, 3, 31, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(169, 3, 32, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(170, 3, 33, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(171, 3, 34, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(172, 3, 39, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(173, 3, 40, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(174, 3, 41, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(175, 3, 42, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(176, 4, 11, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(177, 4, 1, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(178, 4, 12, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(179, 4, 15, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(180, 4, 16, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(181, 4, 17, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(182, 4, 18, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(183, 4, 20, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(184, 4, 27, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(185, 4, 28, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(186, 4, 35, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(187, 4, 36, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(188, 4, 37, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(189, 4, 38, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(190, 4, 39, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(191, 4, 41, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(192, 5, 11, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(193, 5, 1, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(194, 5, 12, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(195, 5, 17, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(196, 5, 27, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(197, 5, 35, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(198, 5, 37, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(199, 5, 39, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(200, 5, 41, '2025-06-13 00:59:57', NULL, '2025-06-13 00:59:57', NULL),
(209, 1, 166, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(210, 1, 162, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(211, 1, 165, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(212, 1, 160, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(213, 1, 164, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(214, 1, 161, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(215, 1, 163, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(216, 1, 159, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(217, 1, 155, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(218, 1, 158, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(219, 1, 152, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(220, 1, 156, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(221, 1, 157, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(222, 1, 153, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(223, 1, 151, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(224, 1, 154, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(225, 1, 7, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(226, 1, 50, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(227, 1, 42, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(228, 1, 79, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(229, 1, 41, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(230, 1, 78, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(231, 1, 22, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(232, 1, 24, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(233, 1, 61, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(234, 1, 20, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(235, 1, 28, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(236, 1, 65, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(237, 1, 26, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(238, 1, 63, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(239, 1, 21, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(240, 1, 59, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(241, 1, 23, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(242, 1, 60, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(243, 1, 19, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(244, 1, 58, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(245, 1, 27, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(246, 1, 64, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(247, 1, 25, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(248, 1, 62, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(249, 1, 11, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(250, 1, 52, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(251, 1, 14, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(252, 1, 53, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(253, 1, 9, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(254, 1, 12, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(255, 1, 18, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(256, 1, 57, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(257, 1, 16, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(258, 1, 55, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(259, 1, 13, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(260, 1, 10, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(261, 1, 51, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(262, 1, 8, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(263, 1, 17, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(264, 1, 56, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(265, 1, 15, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(266, 1, 54, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(267, 1, 6, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(268, 1, 5, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(269, 1, 100, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(270, 1, 96, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(271, 1, 98, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(272, 1, 40, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(273, 1, 77, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(274, 1, 38, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(275, 1, 75, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(276, 1, 97, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(277, 1, 101, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(278, 1, 102, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(279, 1, 39, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(280, 1, 76, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(281, 1, 99, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(282, 1, 37, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(283, 1, 74, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(284, 1, 95, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(285, 1, 108, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(286, 1, 106, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(287, 1, 112, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(288, 1, 111, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(289, 1, 110, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(290, 1, 114, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(291, 1, 104, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(292, 1, 105, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(293, 1, 113, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(294, 1, 103, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(295, 1, 107, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(296, 1, 109, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(297, 1, 93, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(298, 1, 88, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(299, 1, 90, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(300, 1, 92, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(301, 1, 89, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(302, 1, 91, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(303, 1, 87, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(304, 1, 94, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(305, 1, 132, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(306, 1, 128, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(307, 1, 130, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(308, 1, 134, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(309, 1, 131, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(310, 1, 129, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(311, 1, 127, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(312, 1, 133, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(313, 1, 146, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(314, 1, 140, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(315, 1, 139, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(316, 1, 142, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(317, 1, 145, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(318, 1, 138, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(319, 1, 149, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(320, 1, 36, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(321, 1, 73, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(322, 1, 30, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(323, 1, 67, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(324, 1, 32, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(325, 1, 69, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(326, 1, 34, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(327, 1, 71, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(328, 1, 136, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(329, 1, 148, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(330, 1, 150, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(331, 1, 143, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(332, 1, 147, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(333, 1, 35, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(334, 1, 72, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(335, 1, 141, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(336, 1, 29, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(337, 1, 66, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(338, 1, 144, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(339, 1, 31, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(340, 1, 68, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(341, 1, 137, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(342, 1, 33, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(343, 1, 70, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(344, 1, 135, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(345, 1, 44, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(346, 1, 81, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(347, 1, 43, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(348, 1, 80, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(349, 1, 171, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(350, 1, 173, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(351, 1, 168, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(352, 1, 167, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(353, 1, 174, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(354, 1, 49, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(355, 1, 86, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(356, 1, 48, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(357, 1, 85, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(358, 1, 169, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(359, 1, 46, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(360, 1, 83, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(361, 1, 47, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(362, 1, 84, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(363, 1, 172, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(364, 1, 45, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(365, 1, 82, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(366, 1, 170, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(367, 1, 123, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(368, 1, 118, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(369, 1, 122, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(370, 1, 116, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(371, 1, 126, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(372, 1, 120, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(373, 1, 124, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(374, 1, 117, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(375, 1, 121, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(376, 1, 119, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(377, 1, 125, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(378, 1, 115, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(379, 1, 2, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(380, 1, 4, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(381, 1, 3, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL),
(382, 1, 1, '2025-06-20 21:39:02', 1, '2025-06-20 21:39:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `salary_components`
--

CREATE TABLE `salary_components` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('deduction','earning') COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `employee_percentage` decimal(5,2) DEFAULT '0.00',
  `employer_percentage` decimal(5,2) DEFAULT '0.00',
  `fixed_amount` decimal(15,2) DEFAULT '0.00',
  `description` text COLLATE utf8mb4_general_ci,
  `is_taxable` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_components`
--

INSERT INTO `salary_components` (`id`, `user_id`, `type`, `title`, `employee_percentage`, `employer_percentage`, `fixed_amount`, `description`, `is_taxable`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'earning', 'Housing Allowance', 0.00, 0.00, 500000.00, 'Monthly housing allowance', 1, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 1, 'deduction', 'NSSF Contribution', 0.10, 0.10, 0.00, 'Mandatory NSSF contribution', 0, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 2, 'earning', 'Transport Allowance', 0.00, 0.00, 100000.00, 'Monthly transport allowance', 1, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(4, 2, 'deduction', 'PAYE', 0.00, 0.00, 150000.00, 'Pay As You Earn tax', 0, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `SequelizeMeta`
--

CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `SequelizeMeta`
--

INSERT INTO `SequelizeMeta` (`name`) VALUES
('20250101000000-create-asset-tables.js');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int NOT NULL,
  `supplier_id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('individual','company') COLLATE utf8mb4_general_ci NOT NULL,
  `tax_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_id`, `name`, `type`, `tax_id`, `address`, `email`, `phone_number`, `contact_person`, `created_at`, `updated_at`) VALUES
(1, 'SUP001', 'Tech Solutions Ltd.', 'company', 'TAXID123', '123 Tech Avenue, Dar es Salaam', 'info@techsolutions.com', '255712345678', 'Jane Doe', '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 'SUP002', 'Office Supplies Co.', 'company', 'TAXID456', '456 Business Road, Dar es Salaam', 'sales@officesupplies.com', '255787654321', 'Peter Green', '2025-06-13 19:05:21', '2025-06-13 19:05:21');

-- --------------------------------------------------------

--
-- Table structure for table `tax_rates`
--

CREATE TABLE `tax_rates` (
  `id` int NOT NULL,
  `tax_type` enum('PAYE','NSSF','NHIF','OTHER') NOT NULL,
  `rate_percentage` decimal(5,2) NOT NULL,
  `min_amount` decimal(15,2) DEFAULT NULL,
  `max_amount` decimal(15,2) DEFAULT NULL,
  `effective_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timesheets`
--

CREATE TABLE `timesheets` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `status` enum('draft','submitted','approved','rejected','processing') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
  `total_hours` decimal(5,2) DEFAULT '0.00',
  `total_working_days` int DEFAULT '0',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_general_ci,
  `supervisor_comments` text COLLATE utf8mb4_general_ci,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `travel_advance_requests`
--

CREATE TABLE `travel_advance_requests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `approval_status` enum('draft','approved by supervisor','approved by finance','rejected') COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `document_id` int DEFAULT NULL,
  `departure_date` date NOT NULL,
  `return_date` date NOT NULL,
  `total_cost` decimal(15,2) NOT NULL,
  `flat_rate_id` int NOT NULL,
  `rejection_reason` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `travel_advance_requests`
--

INSERT INTO `travel_advance_requests` (`id`, `user_id`, `approval_status`, `document_id`, `departure_date`, `return_date`, `total_cost`, `flat_rate_id`, `rejection_reason`, `created_at`, `updated_at`, `approved_by`) VALUES
(1, 2, 'approved by finance', NULL, '2025-07-10', '2025-07-15', 250000.00, 1, NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21', 1),
(2, 3, 'draft', NULL, '2025-08-01', '2025-08-03', 150000.00, 1, NULL, '2025-06-13 19:05:21', '2025-06-13 19:05:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `username` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin','finance_manager','hr_manager','department_head') COLLATE utf8mb4_general_ci DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT '1',
  `department_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `email`, `password`, `created_at`, `updated_at`, `last_login`, `username`, `last_name`, `role`, `is_active`, `department_id`) VALUES
(1, 'Kwayu', 'developerkwayu@gmail.com', '$2a$10$RUQyfoFTuKRfVfhEAW2K6.2axkc0ahOHhjDJeSD4CQlaUbWvgkwMm', '2025-06-13 19:05:21', '2025-06-28 15:42:07', '2025-06-28 15:42:07', NULL, '', 'user', 1, NULL),
(2, 'Bob', 'bob@gmail.com', '$2a$10$RUQyfoFTuKRfVfhEAW2K6.2axkc0ahOHhjDJeSD4CQlaUbWvgkwMm', '2025-06-13 19:05:21', '2025-06-13 23:13:56', '2025-06-13 23:13:56', NULL, '', 'user', 1, NULL),
(3, 'Charlie', 'mmaridenis@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2025-06-13 19:05:21', '2025-06-22 13:33:44', '2025-06-12 09:00:00', NULL, '', 'user', 1, NULL),
(4, 'Denis', 'msuya@gmail.com', '$2a$10$6LOCcB/x9oyYE6RmsBRJl.qSCxjjLN4Y2rDMbmpPkHQcr5CCbSCMy', '2025-06-15 23:59:45', '2025-06-15 23:59:45', NULL, NULL, '', 'user', 1, NULL),
(5, 'ERNEST', 'malima@gmail.com', '$2a$10$pG24MG2Lyrs22Rb/UNWIeezRugdwoy7eP/2463fltAfhTmeYyONOO', '2025-06-16 00:10:51', '2025-06-16 00:10:51', NULL, NULL, '', 'user', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(2, 2, 5, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(3, 3, 4, '2025-06-13 19:05:21', '2025-06-13 19:05:21'),
(7, 4, 5, '2025-06-15 23:59:45', '2025-06-15 23:59:45'),
(8, 5, 5, '2025-06-16 00:10:51', '2025-06-16 00:10:51');

-- --------------------------------------------------------

--
-- Table structure for table `work_scheduler`
--

CREATE TABLE `work_scheduler` (
  `id` int NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') COLLATE utf8mb4_general_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `work_scheduler`
--

INSERT INTO `work_scheduler` (`id`, `day_of_week`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 'Monday', '08:00:00', '17:00:00', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(2, 'Tuesday', '08:00:00', '17:00:00', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(3, 'Wednesday', '08:00:00', '17:00:00', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(4, 'Thursday', '08:00:00', '17:00:00', '2025-05-17 21:20:28', '2025-05-17 21:20:28'),
(5, 'Friday', '08:00:00', '17:00:00', '2025-05-17 21:20:28', '2025-05-17 21:20:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appraisal_forms`
--
ALTER TABLE `appraisal_forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `objective_id` (`objective_id`),
  ADD KEY `peer_reviewer_id` (`peer_reviewer_id`),
  ADD KEY `hr_reviewer_id` (`hr_reviewer_id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_code` (`asset_code`),
  ADD UNIQUE KEY `asset_code_2` (`asset_code`),
  ADD KEY `assets_asset_code` (`asset_code`),
  ADD KEY `assets_status` (`status`),
  ADD KEY `assets_category` (`category`),
  ADD KEY `assets_department_id` (`department_id`),
  ADD KEY `assets_custodian_id` (`custodian_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `asset_maintenance`
--
ALTER TABLE `asset_maintenance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `maintenance_number` (`maintenance_number`),
  ADD UNIQUE KEY `maintenance_number_2` (`maintenance_number`),
  ADD KEY `asset_maintenance_maintenance_number` (`maintenance_number`),
  ADD KEY `asset_maintenance_asset_id` (`asset_id`),
  ADD KEY `asset_maintenance_status` (`status`),
  ADD KEY `asset_maintenance_maintenance_type` (`maintenance_type`),
  ADD KEY `asset_maintenance_scheduled_date` (`scheduled_date`),
  ADD KEY `asset_maintenance_created_by` (`created_by`),
  ADD KEY `completed_by` (`completed_by`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_date` (`user_id`,`date`),
  ADD UNIQUE KEY `attendance_user_id_date` (`user_id`,`date`),
  ADD KEY `attendance_submitted_by_fk` (`submitted_by`),
  ADD KEY `attendance_approved_by_fk` (`approved_by`),
  ADD KEY `attendance_rejected_by_fk` (`rejected_by`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_date` (`user_id`,`date`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_account` (`user_id`,`account_number`),
  ADD KEY `idx_bank_accounts_user_id` (`user_id`),
  ADD KEY `idx_bank_accounts_primary` (`is_primary`),
  ADD KEY `idx_bank_accounts_active` (`is_active`),
  ADD KEY `idx_bank_accounts_bank_name` (`bank_name`);

--
-- Indexes for table `basic_employee_data`
--
ALTER TABLE `basic_employee_data`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`),
  ADD UNIQUE KEY `nida` (`nida`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `bio_data`
--
ALTER TABLE `bio_data`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `fingerprint_id` (`fingerprint_id`),
  ADD UNIQUE KEY `national_id` (`national_id`);

--
-- Indexes for table `bonus_records`
--
ALTER TABLE `bonus_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_bonus_records_user_id` (`user_id`),
  ADD KEY `idx_bonus_records_type` (`bonus_type`),
  ADD KEY `idx_bonus_records_status` (`status`),
  ADD KEY `idx_bonus_records_pay_period` (`pay_period`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quarter_id` (`quarter_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `responsible_person_id` (`responsible_person_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `budget_expenses`
--
ALTER TABLE `budget_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `budget_id` (`budget_id`),
  ADD KEY `expense_report_id` (`expense_report_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `expense_lines`
--
ALTER TABLE `expense_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `expense_report_id` (`expense_report_id`);

--
-- Indexes for table `expense_reports`
--
ALTER TABLE `expense_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `travel_advance_request_id` (`travel_advance_request_id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `receipt_document_id` (`receipt_document_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `fingerprints`
--
ALTER TABLE `fingerprints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `fiscal_years`
--
ALTER TABLE `fiscal_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year` (`year`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `flat_rates`
--
ALTER TABLE `flat_rates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `holiday_list`
--
ALTER TABLE `holiday_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `date` (`date`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `increments`
--
ALTER TABLE `increments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fiscal_year_id` (`fiscal_year_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `leave_applications`
--
ALTER TABLE `leave_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `approver_id` (`approver_id`),
  ADD KEY `attachment_id` (`attachment_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `loan_installments`
--
ALTER TABLE `loan_installments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_loan_installment` (`loan_id`,`installment_number`),
  ADD KEY `idx_loan_installments_loan_id` (`loan_id`),
  ADD KEY `idx_loan_installments_payroll_id` (`payroll_id`),
  ADD KEY `idx_loan_installments_status` (`status`),
  ADD KEY `idx_loan_installments_due_date` (`due_date`);

--
-- Indexes for table `loan_records`
--
ALTER TABLE `loan_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_records_user_id` (`user_id`),
  ADD KEY `idx_loan_records_type` (`loan_type`),
  ADD KEY `idx_loan_records_status` (`status`),
  ADD KEY `idx_loan_records_approved_by` (`approved_by`);

--
-- Indexes for table `lpo`
--
ALTER TABLE `lpo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `po_number` (`po_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `invoice_document_id` (`invoice_document_id`),
  ADD KEY `delivery_note_document_id` (`delivery_note_document_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `minutes_document_id` (`minutes_document_id`),
  ADD KEY `meetings_meeting_date_status` (`meeting_date`,`status`),
  ADD KEY `meetings_created_by` (`created_by`),
  ADD KEY `meetings_chairperson` (`chairperson`);

--
-- Indexes for table `meeting_attendees`
--
ALTER TABLE `meeting_attendees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_meeting_email` (`meeting_id`,`email`),
  ADD UNIQUE KEY `meeting_attendees_meeting_id_email` (`meeting_id`,`email`),
  ADD KEY `idx_meeting_id` (`meeting_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `meeting_attendees_meeting_id` (`meeting_id`),
  ADD KEY `meeting_attendees_user_id` (`user_id`),
  ADD KEY `meeting_attendees_email` (`email`);

--
-- Indexes for table `meeting_documents`
--
ALTER TABLE `meeting_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_meeting_id` (`meeting_id`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_upload_date` (`upload_date`),
  ADD KEY `meeting_documents_meeting_id` (`meeting_id`),
  ADD KEY `meeting_documents_uploaded_by` (`uploaded_by`),
  ADD KEY `meeting_documents_document_type` (`document_type`),
  ADD KEY `meeting_documents_upload_date` (`upload_date`);

--
-- Indexes for table `meeting_records`
--
ALTER TABLE `meeting_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploader_user_id` (`uploader_user_id`),
  ADD KEY `chairperson_user_id` (`chairperson_user_id`),
  ADD KEY `document_id` (`document_id`);

--
-- Indexes for table `meeting_tasks`
--
ALTER TABLE `meeting_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `raised_by_user_id` (`raised_by_user_id`),
  ADD KEY `assigned_to_user_id` (`assigned_to_user_id`),
  ADD KEY `follow_up_person_user_id` (`follow_up_person_user_id`),
  ADD KEY `meeting_tasks_meeting_id` (`meeting_id`),
  ADD KEY `meeting_tasks_assigned_user_id` (`assigned_user_id`),
  ADD KEY `meeting_tasks_due_date_status` (`due_date`,`status`),
  ADD KEY `meeting_tasks_priority` (`priority`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `menu_permissions`
--
ALTER TABLE `menu_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_menu_permission` (`menu_id`,`permission_id`),
  ADD UNIQUE KEY `menu_permissions_menu_id_permission_id` (`menu_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `next_of_kin`
--
ALTER TABLE `next_of_kin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_user_id` (`receiver_user_id`),
  ADD KEY `sender_user_id` (`sender_user_id`);

--
-- Indexes for table `objectives`
--
ALTER TABLE `objectives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fiscal_year_id` (`fiscal_year_id`);

--
-- Indexes for table `overtime_records`
--
ALTER TABLE `overtime_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_date_overtime` (`user_id`,`date`),
  ADD KEY `idx_overtime_records_user_id` (`user_id`),
  ADD KEY `idx_overtime_records_date` (`date`),
  ADD KEY `idx_overtime_records_status` (`status`),
  ADD KEY `idx_overtime_records_approved_by` (`approved_by`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `increment_id` (`increment_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_month_year` (`employee_id`,`month`,`year`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `rejected_by` (`rejected_by`),
  ADD KEY `idx_payrolls_status` (`status`),
  ADD KEY `idx_payrolls_period` (`month`,`year`),
  ADD KEY `idx_payrolls_created_by` (`created_by`),
  ADD KEY `idx_payrolls_approved_by` (`approved_by`),
  ADD KEY `idx_payrolls_payment_date` (`payment_date`),
  ADD KEY `idx_payroll_status` (`status`),
  ADD KEY `idx_payroll_period` (`month`,`year`);

--
-- Indexes for table `payroll_adjustments`
--
ALTER TABLE `payroll_adjustments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_payroll_adjustments_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_adjustments_type` (`adjustment_type`),
  ADD KEY `idx_payroll_adjustments_status` (`status`);

--
-- Indexes for table `payroll_allowances`
--
ALTER TABLE `payroll_allowances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_allowances_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_allowances_type` (`allowance_type`),
  ADD KEY `idx_payroll_allowances_taxable` (`is_taxable`);

--
-- Indexes for table `payroll_approvals`
--
ALTER TABLE `payroll_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_approvals_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_approvals_approver_id` (`approver_id`),
  ADD KEY `idx_payroll_approvals_stage` (`stage`),
  ADD KEY `idx_payroll_approvals_action` (`action`),
  ADD KEY `idx_payroll_approvals_approved_at` (`approved_at`);

--
-- Indexes for table `payroll_deductions`
--
ALTER TABLE `payroll_deductions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_deductions_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_deductions_type` (`deduction_type`),
  ADD KEY `idx_payroll_deductions_mandatory` (`is_mandatory`);

--
-- Indexes for table `payroll_notifications`
--
ALTER TABLE `payroll_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payroll_notifications_user_id` (`user_id`),
  ADD KEY `idx_payroll_notifications_payroll_id` (`payroll_id`),
  ADD KEY `idx_payroll_notifications_type` (`notification_type`),
  ADD KEY `idx_payroll_notifications_read` (`is_read`),
  ADD KEY `idx_payroll_notifications_sent_via` (`sent_via`),
  ADD KEY `idx_payroll_notifications_priority` (`priority`),
  ADD KEY `idx_payroll_notifications_created_at` (`created_at`),
  ADD KEY `idx_payroll_notifications_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_payroll_notifications_user_type` (`user_id`,`notification_type`);

--
-- Indexes for table `payroll_processing_logs`
--
ALTER TABLE `payroll_processing_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `process_id` (`process_id`),
  ADD KEY `processed_by` (`processed_by`);

--
-- Indexes for table `payroll_settings`
--
ALTER TABLE `payroll_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `payslip_templates`
--
ALTER TABLE `payslip_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_employee_data`
--
ALTER TABLE `personal_employee_data`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `petty_cash_book`
--
ALTER TABLE `petty_cash_book`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `petty_cash_expenses`
--
ALTER TABLE `petty_cash_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `petty_cash_book_id` (`petty_cash_book_id`),
  ADD KEY `receipt_document_id` (`receipt_document_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `requisition_number` (`requisition_number`),
  ADD KEY `budget_id` (`budget_id`),
  ADD KEY `requester_id` (`requester_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `quarters`
--
ALTER TABLE `quarters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fiscal_year_id` (`fiscal_year_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `submitted_by` (`submitted_by`);

--
-- Indexes for table `replenishment_requests`
--
ALTER TABLE `replenishment_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `petty_cash_book_id` (`petty_cash_book_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `requisition_attachments`
--
ALTER TABLE `requisition_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_request_id` (`purchase_request_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `requisition_items`
--
ALTER TABLE `requisition_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_purchase_request_id` (`purchase_request_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_supplier_preference` (`supplier_preference`),
  ADD KEY `idx_item_code` (`item_code`);

--
-- Indexes for table `requisition_workflows`
--
ALTER TABLE `requisition_workflows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_request_id` (`purchase_request_id`),
  ADD KEY `approver_id` (`approver_id`),
  ADD KEY `next_approver_id` (`next_approver_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD UNIQUE KEY `roles_role_name` (`role_name`);

--
-- Indexes for table `role_menu_access`
--
ALTER TABLE `role_menu_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_menu` (`role_id`,`menu_id`),
  ADD UNIQUE KEY `role_menu_access_role_id_menu_id` (`role_id`,`menu_id`),
  ADD KEY `role_menu_access_role_id` (`role_id`),
  ADD KEY `role_menu_access_menu_id` (`menu_id`),
  ADD KEY `role_menu_access_can_access` (`can_access`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  ADD UNIQUE KEY `role_permissions_role_id_permission_id` (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `salary_components`
--
ALTER TABLE `salary_components`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `SequelizeMeta`
--
ALTER TABLE `SequelizeMeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `tax_rates`
--
ALTER TABLE `tax_rates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_month_year` (`user_id`,`month`,`year`),
  ADD KEY `rejected_by` (`rejected_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `timesheets_status` (`status`),
  ADD KEY `timesheets_submitted_at` (`submitted_at`),
  ADD KEY `timesheets_approved_by` (`approved_by`);

--
-- Indexes for table `travel_advance_requests`
--
ALTER TABLE `travel_advance_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `flat_rate_id` (`flat_rate_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD KEY `users_email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD UNIQUE KEY `user_roles_user_id_role_id` (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `work_scheduler`
--
ALTER TABLE `work_scheduler`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appraisal_forms`
--
ALTER TABLE `appraisal_forms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asset_maintenance`
--
ALTER TABLE `asset_maintenance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bonus_records`
--
ALTER TABLE `bonus_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `budget_expenses`
--
ALTER TABLE `budget_expenses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `expense_lines`
--
ALTER TABLE `expense_lines`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `expense_reports`
--
ALTER TABLE `expense_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fingerprints`
--
ALTER TABLE `fingerprints`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `fiscal_years`
--
ALTER TABLE `fiscal_years`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `flat_rates`
--
ALTER TABLE `flat_rates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `holiday_list`
--
ALTER TABLE `holiday_list`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `increments`
--
ALTER TABLE `increments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leave_applications`
--
ALTER TABLE `leave_applications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `loan_installments`
--
ALTER TABLE `loan_installments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_records`
--
ALTER TABLE `loan_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lpo`
--
ALTER TABLE `lpo`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_attendees`
--
ALTER TABLE `meeting_attendees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `meeting_documents`
--
ALTER TABLE `meeting_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `meeting_records`
--
ALTER TABLE `meeting_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `meeting_tasks`
--
ALTER TABLE `meeting_tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `menu_permissions`
--
ALTER TABLE `menu_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `next_of_kin`
--
ALTER TABLE `next_of_kin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `objectives`
--
ALTER TABLE `objectives`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `overtime_records`
--
ALTER TABLE `overtime_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payroll_adjustments`
--
ALTER TABLE `payroll_adjustments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_allowances`
--
ALTER TABLE `payroll_allowances`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payroll_approvals`
--
ALTER TABLE `payroll_approvals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payroll_deductions`
--
ALTER TABLE `payroll_deductions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payroll_notifications`
--
ALTER TABLE `payroll_notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payroll_processing_logs`
--
ALTER TABLE `payroll_processing_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_settings`
--
ALTER TABLE `payroll_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payslip_templates`
--
ALTER TABLE `payslip_templates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=175;

--
-- AUTO_INCREMENT for table `petty_cash_book`
--
ALTER TABLE `petty_cash_book`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `petty_cash_expenses`
--
ALTER TABLE `petty_cash_expenses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quarters`
--
ALTER TABLE `quarters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `replenishment_requests`
--
ALTER TABLE `replenishment_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `requisition_attachments`
--
ALTER TABLE `requisition_attachments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requisition_items`
--
ALTER TABLE `requisition_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requisition_workflows`
--
ALTER TABLE `requisition_workflows`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `role_menu_access`
--
ALTER TABLE `role_menu_access`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=264;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=383;

--
-- AUTO_INCREMENT for table `salary_components`
--
ALTER TABLE `salary_components`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tax_rates`
--
ALTER TABLE `tax_rates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timesheets`
--
ALTER TABLE `timesheets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `travel_advance_requests`
--
ALTER TABLE `travel_advance_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `work_scheduler`
--
ALTER TABLE `work_scheduler`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appraisal_forms`
--
ALTER TABLE `appraisal_forms`
  ADD CONSTRAINT `appraisal_forms_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appraisal_forms_ibfk_2` FOREIGN KEY (`objective_id`) REFERENCES `objectives` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appraisal_forms_ibfk_3` FOREIGN KEY (`peer_reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appraisal_forms_ibfk_4` FOREIGN KEY (`hr_reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_5` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `assets_ibfk_6` FOREIGN KEY (`custodian_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `assets_ibfk_7` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `assets_ibfk_8` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `asset_maintenance`
--
ALTER TABLE `asset_maintenance`
  ADD CONSTRAINT `asset_maintenance_ibfk_4` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `asset_maintenance_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `asset_maintenance_ibfk_6` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_approved_by_fk` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_rejected_by_fk` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `attendance_submitted_by_fk` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `bank_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `basic_employee_data`
--
ALTER TABLE `basic_employee_data`
  ADD CONSTRAINT `basic_employee_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `basic_employee_data_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `basic_employee_data_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bio_data`
--
ALTER TABLE `bio_data`
  ADD CONSTRAINT `bio_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bonus_records`
--
ALTER TABLE `bonus_records`
  ADD CONSTRAINT `bonus_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bonus_records_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`quarter_id`) REFERENCES `quarters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_3` FOREIGN KEY (`responsible_person_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `budget_expenses`
--
ALTER TABLE `budget_expenses`
  ADD CONSTRAINT `budget_expenses_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budget_expenses_ibfk_2` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD CONSTRAINT `emergency_contacts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_lines`
--
ALTER TABLE `expense_lines`
  ADD CONSTRAINT `expense_lines_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expense_lines_ibfk_2` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_reports`
--
ALTER TABLE `expense_reports`
  ADD CONSTRAINT `expense_reports_ibfk_1` FOREIGN KEY (`travel_advance_request_id`) REFERENCES `travel_advance_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_reports_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expense_reports_ibfk_3` FOREIGN KEY (`receipt_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `expense_reports_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_reports_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `fingerprints`
--
ALTER TABLE `fingerprints`
  ADD CONSTRAINT `fingerprints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fiscal_years`
--
ALTER TABLE `fiscal_years`
  ADD CONSTRAINT `fiscal_years_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `holiday_list`
--
ALTER TABLE `holiday_list`
  ADD CONSTRAINT `holiday_list_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `holiday_list_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `increments`
--
ALTER TABLE `increments`
  ADD CONSTRAINT `increments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `increments_ibfk_2` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `increments_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `leave_applications`
--
ALTER TABLE `leave_applications`
  ADD CONSTRAINT `leave_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_applications_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_applications_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `leave_applications_ibfk_4` FOREIGN KEY (`attachment_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `loan_installments`
--
ALTER TABLE `loan_installments`
  ADD CONSTRAINT `loan_installments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loan_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `loan_installments_ibfk_2` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `loan_records`
--
ALTER TABLE `loan_records`
  ADD CONSTRAINT `loan_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `loan_records_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lpo`
--
ALTER TABLE `lpo`
  ADD CONSTRAINT `lpo_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lpo_ibfk_2` FOREIGN KEY (`invoice_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lpo_ibfk_3` FOREIGN KEY (`delivery_note_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lpo_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lpo_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`minutes_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `meetings_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `meeting_records`
--
ALTER TABLE `meeting_records`
  ADD CONSTRAINT `meeting_records_ibfk_1` FOREIGN KEY (`uploader_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_records_ibfk_2` FOREIGN KEY (`chairperson_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_records_ibfk_3` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `meeting_tasks`
--
ALTER TABLE `meeting_tasks`
  ADD CONSTRAINT `meeting_tasks_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meeting_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_tasks_ibfk_2` FOREIGN KEY (`raised_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_tasks_ibfk_3` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_tasks_ibfk_4` FOREIGN KEY (`follow_up_person_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_permissions`
--
ALTER TABLE `menu_permissions`
  ADD CONSTRAINT `menu_permissions_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `next_of_kin`
--
ALTER TABLE `next_of_kin`
  ADD CONSTRAINT `next_of_kin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`receiver_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `objectives`
--
ALTER TABLE `objectives`
  ADD CONSTRAINT `objectives_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `objectives_ibfk_2` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_years` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `overtime_records`
--
ALTER TABLE `overtime_records`
  ADD CONSTRAINT `overtime_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `overtime_records_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payroll_ibfk_2` FOREIGN KEY (`increment_id`) REFERENCES `increments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payroll_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payroll_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `payrolls_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payrolls_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `payrolls_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payrolls_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payrolls_ibfk_5` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payroll_adjustments`
--
ALTER TABLE `payroll_adjustments`
  ADD CONSTRAINT `payroll_adjustments_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payroll_adjustments_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payroll_allowances`
--
ALTER TABLE `payroll_allowances`
  ADD CONSTRAINT `payroll_allowances_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payroll_approvals`
--
ALTER TABLE `payroll_approvals`
  ADD CONSTRAINT `payroll_approvals_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payroll_approvals_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `payroll_deductions`
--
ALTER TABLE `payroll_deductions`
  ADD CONSTRAINT `payroll_deductions_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payroll_notifications`
--
ALTER TABLE `payroll_notifications`
  ADD CONSTRAINT `payroll_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payroll_notifications_ibfk_2` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `payroll_processing_logs`
--
ALTER TABLE `payroll_processing_logs`
  ADD CONSTRAINT `payroll_processing_logs_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `payslip_templates`
--
ALTER TABLE `payslip_templates`
  ADD CONSTRAINT `payslip_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `personal_employee_data`
--
ALTER TABLE `personal_employee_data`
  ADD CONSTRAINT `personal_employee_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `petty_cash_book`
--
ALTER TABLE `petty_cash_book`
  ADD CONSTRAINT `petty_cash_book_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `petty_cash_expenses`
--
ALTER TABLE `petty_cash_expenses`
  ADD CONSTRAINT `petty_cash_expenses_ibfk_1` FOREIGN KEY (`petty_cash_book_id`) REFERENCES `petty_cash_book` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `petty_cash_expenses_ibfk_2` FOREIGN KEY (`receipt_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `petty_cash_expenses_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_requests_ibfk_2` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quarters`
--
ALTER TABLE `quarters`
  ADD CONSTRAINT `quarters_ibfk_1` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_years` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `quotations_ibfk_3` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `replenishment_requests`
--
ALTER TABLE `replenishment_requests`
  ADD CONSTRAINT `replenishment_requests_ibfk_1` FOREIGN KEY (`petty_cash_book_id`) REFERENCES `petty_cash_book` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `replenishment_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `replenishment_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `requisition_attachments`
--
ALTER TABLE `requisition_attachments`
  ADD CONSTRAINT `requisition_attachments_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requisition_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `requisition_items`
--
ALTER TABLE `requisition_items`
  ADD CONSTRAINT `requisition_items_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `requisition_workflows`
--
ALTER TABLE `requisition_workflows`
  ADD CONSTRAINT `requisition_workflows_ibfk_1` FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requisition_workflows_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `requisition_workflows_ibfk_3` FOREIGN KEY (`next_approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `role_menu_access`
--
ALTER TABLE `role_menu_access`
  ADD CONSTRAINT `role_menu_access_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_menu_access_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `role_permissions_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `salary_components`
--
ALTER TABLE `salary_components`
  ADD CONSTRAINT `salary_components_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD CONSTRAINT `timesheets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timesheets_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `timesheets_ibfk_3` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `timesheets_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `timesheets_ibfk_5` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `travel_advance_requests`
--
ALTER TABLE `travel_advance_requests`
  ADD CONSTRAINT `travel_advance_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `travel_advance_requests_ibfk_2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `travel_advance_requests_ibfk_3` FOREIGN KEY (`flat_rate_id`) REFERENCES `flat_rates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `travel_advance_requests_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
