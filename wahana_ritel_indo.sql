-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Nov 05, 2024 at 03:29 PM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wahana_ritel_indo`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(7) NOT NULL,
  `date` date NOT NULL,
  `check_in_time` time NOT NULL DEFAULT '00:00:00',
  `check_out_time` time NOT NULL DEFAULT '00:00:00',
  `is_late` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `ptid` varchar(7) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `marital_status` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `job_position_id` int(11) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `ptid`, `name`, `username`, `password`, `birth_date`, `email`, `phone`, `marital_status`, `address`, `join_date`, `location_id`, `grade_id`, `job_position_id`, `is_admin`) VALUES
(1, 'E240001', 'Admin', 'admincpt', '$2y$10$jOk8jmJSAkfNLwD4A.InmeltATx5tHsMv/SNB/RNB20cJ8wx.CZwC', '1990-01-01', 'johndoe@example.com', '08123456789', 'Single', '123 Main St', '2024-01-01', 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `grade_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `grade_name`) VALUES
(1, 'Junior Staff'),
(2, 'Senior Staff'),
(3, 'Manager');

-- --------------------------------------------------------

--
-- Table structure for table `job_positions`
--

CREATE TABLE `job_positions` (
  `id` int(11) NOT NULL,
  `job_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `job_positions`
--

INSERT INTO `job_positions` (`id`, `job_name`) VALUES
(1, 'Software Engineer'),
(2, 'Data Analyst'),
(3, 'Product Manager');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `location_name`, `status`) VALUES
(1, 'Jakarta', 'Active'),
(2, 'Bandung', 'Active'),
(3, 'Surabaya', 'Inactive');

-- --------------------------------------------------------

--
-- Table structure for table `req_attendance`
--

CREATE TABLE `req_attendance` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(7) NOT NULL,
  `request_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `req_personal_info`
--

CREATE TABLE `req_personal_info` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(7) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `old_name` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `old_username` varchar(50) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `old_birth_date` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `old_email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `old_phone` varchar(20) DEFAULT NULL,
  `marital_status` varchar(20) DEFAULT NULL,
  `old_marital_status` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `old_address` text DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `old_location_id` int(11) DEFAULT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `old_grade_id` int(11) DEFAULT NULL,
  `job_position_id` int(11) DEFAULT NULL,
  `old_job_position_id` int(11) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ptid` (`ptid`),
  ADD KEY `grade_id` (`grade_id`),
  ADD KEY `job_position_id` (`job_position_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_positions`
--
ALTER TABLE `job_positions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `req_attendance`
--
ALTER TABLE `req_attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `req_personal_info`
--
ALTER TABLE `req_personal_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `location_id` (`location_id`),
  ADD KEY `grade_id` (`grade_id`),
  ADD KEY `job_position_id` (`job_position_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `job_positions`
--
ALTER TABLE `job_positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `req_attendance`
--
ALTER TABLE `req_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `req_personal_info`
--
ALTER TABLE `req_personal_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`ptid`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`job_position_id`) REFERENCES `job_positions` (`id`),
  ADD CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);

--
-- Constraints for table `req_attendance`
--
ALTER TABLE `req_attendance`
  ADD CONSTRAINT `req_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`ptid`) ON DELETE CASCADE;

--
-- Constraints for table `req_personal_info`
--
ALTER TABLE `req_personal_info`
  ADD CONSTRAINT `req_personal_info_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`ptid`) ON DELETE CASCADE,
  ADD CONSTRAINT `req_personal_info_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `req_personal_info_ibfk_3` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `req_personal_info_ibfk_4` FOREIGN KEY (`job_position_id`) REFERENCES `job_positions` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
