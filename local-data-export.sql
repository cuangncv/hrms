-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: hrms
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `createdBy` int(11) NOT NULL,
  `readBy` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` (`id`, `title`, `content`, `createdBy`, `readBy`, `createdAt`) VALUES (1,'🎉 Chào mừng hệ thống HR mới!','Hệ thống quản lý nhân sự Mini HRMS đã chính thức ra mắt. Mọi thắc mắc vui lòng liên hệ phòng Nhân sự (HR Department).',1,'[1, 2, 3]','2026-07-01 08:00:00'),(2,'📅 Lịch họp toàn công ty tháng 8','Họp toàn thể công ty vào 09:00 sáng thứ Hai 04/08/2026 tại phòng họp lớn tầng 3. Tất cả nhân viên vui lòng tham dự đầy đủ.',1,'[1,2,3]','2026-07-20 09:30:00'),(3,'💰 Thông báo điều chỉnh lương & thưởng Q3','Ban Giám Đốc quyết định điều chỉnh mức phụ cấp xăng xe và xét thưởng hiệu suất làm việc cho các nhân viên xuất sắc trong quý 3/2026.',1,'[1,3]','2026-07-22 14:00:00'),(4,'✈️ Thông báo Teambuilding Hạ Long 2026','Công ty sẽ tổ chức chương trình du lịch nghỉ dưỡng 3 ngày 2 đêm tại Hạ Long từ ngày 22/08 đến 24/08/2026. Anh chị em chuẩn bị tinh thần bung xõa nhé!',2,'[1]','2026-07-25 11:15:00'),(5,'🔒 Nhắc nhở bảo mật tài khoản & dữ liệu','Yêu cầu toàn thể nhân viên đổi mật khẩu tài khoản nội bộ và không chia sẻ thông tin đăng nhập cho bất kỳ ai ngoài thẩm quyền.',1,'[]','2026-07-26 08:30:00');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` varchar(20) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT '',
  `birthday` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `avatar` varchar(255) DEFAULT '',
  `department` varchar(50) DEFAULT 'Khác',
  `position` varchar(50) DEFAULT 'Nhân viên',
  `contractType` enum('probation','official','parttime') DEFAULT 'official',
  `baseSalary` decimal(15,2) DEFAULT 0.00,
  `allowance_lunch` decimal(15,2) DEFAULT 0.00,
  `allowance_transport` decimal(15,2) DEFAULT 0.00,
  `allowance_phone` decimal(15,2) DEFAULT 0.00,
  `startDate` date DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `deletedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `employeeId` (`employeeId`),
  KEY `userId` (`userId`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` (`id`, `employeeId`, `fullName`, `email`, `phone`, `birthday`, `gender`, `avatar`, `department`, `position`, `contractType`, `baseSalary`, `allowance_lunch`, `allowance_transport`, `allowance_phone`, `startDate`, `userId`, `isDeleted`, `deletedAt`, `createdAt`) VALUES (1,'NV0001','Nguyễn Văn An','an.nguyen@hrms.vn','0901111111','1990-05-15','male','','IT','Trưởng phòng IT','official',28000000.00,730000.00,500000.00,300000.00,'2022-01-10',4,0,NULL,'2022-01-10 08:00:00'),(2,'NV0002','Trần Thị Bích','bich.tran@hrms.vn','0902222222','1993-08-20','female','','Nhân sự','Trưởng phòng HR','official',25000000.00,730000.00,500000.00,300000.00,'2022-03-15',2,0,NULL,'2022-03-15 08:30:00'),(3,'NV0003','Lê Minh Cường','cuong.le@hrms.vn','0903333333','1995-12-01','male','','IT','Senior Developer','official',22000000.00,730000.00,500000.00,300000.00,'2023-06-01',3,0,NULL,'2023-06-01 09:00:00'),(4,'NV0004','Phạm Thu Dung','dung.pham@hrms.vn','0904444444','1991-03-10','female','','Kế toán','Kế toán trưởng','official',24000000.00,730000.00,500000.00,300000.00,'2023-02-20',7,0,NULL,'2023-02-20 09:30:00'),(5,'NV0005','Hoàng Văn Em','em.hoang@hrms.vn','0905555555','1998-07-22','male','','Sales','Trưởng phòng Sales','official',20000000.00,730000.00,500000.00,500000.00,'2023-11-01',5,0,NULL,'2023-11-01 10:00:00'),(6,'NV0006','Đinh Phương Thảo','thao.dinh@hrms.vn','0906666666','1994-01-30','female','','Marketing','Trưởng phòng MKT','official',21000000.00,730000.00,300000.00,300000.00,'2023-09-01',8,0,NULL,'2023-09-01 08:30:00'),(7,'NV0007','Ngô Thanh Giang','giang.ngo@hrms.vn','0907777777','1996-11-05','male','','IT','Frontend Developer','official',17000000.00,730000.00,500000.00,300000.00,'2023-04-01',9,0,NULL,'2023-04-01 09:00:00'),(8,'NV0008','Bùi Hà Linh','linh.bui@hrms.vn','0908888888','1992-09-14','female','','Nhân sự','Chuyên viên C&B','official',16000000.00,730000.00,300000.00,200000.00,'2021-07-15',10,0,NULL,'2021-07-15 08:00:00'),(10,'NV0010','Đỗ Khánh Linh','linh.do@hrms.vn','0911000111','1999-02-28','female','','Marketing','Content Creator','official',13500000.00,730000.00,200000.00,200000.00,'2024-03-01',12,0,NULL,'2024-03-01 08:00:00'),(11,'NV0011','Trịnh Đức Anh','anh.trinh@hrms.vn','0912111222','1995-10-12','male','','IT','Backend Developer','official',18500000.00,730000.00,400000.00,300000.00,'2023-08-15',13,0,NULL,'2023-08-15 09:00:00'),(12,'NV0012','Nguyễn Mai Phương','phuong.nguyen@hrms.vn','0913222333','1996-06-25','female','','Kế toán','Kế toán viên','official',13000000.00,730000.00,200000.00,100000.00,'2024-02-01',14,0,NULL,'2024-02-01 08:30:00'),(14,'NV0014','Phan Thùy Trang','trang.phan@hrms.vn','0915444555','1994-12-19','female','','Nhân sự','Chuyên viên Tuyển dụng','official',15000000.00,730000.00,300000.00,200000.00,'2023-10-10',16,0,NULL,'2023-10-10 08:30:00'),(15,'NV0015','Võ Văn Hòa','hoa.vo@hrms.vn','0916555666','1991-08-04','male','','IT','DevOps Engineer','official',26000000.00,730000.00,500000.00,300000.00,'2022-11-01',17,0,NULL,'2022-11-01 09:00:00'),(16,'NV0016','Đặng Kim Yến','yen.dang@hrms.vn','0917666777','2001-03-14','female','','Khác','Lễ tân & Admin','parttime',11000000.00,500000.00,200000.00,0.00,'2024-05-01',18,0,NULL,'2024-05-01 08:00:00'),(17,'NV0017','Cao Thành Long','long.cao@hrms.vn','0918777888','1998-11-30','male','','Marketing','Nhân viên ','probation',11100000.00,730000.00,300000.00,0.00,'2026-07-01',19,0,NULL,'2026-07-01 09:00:00'),(21,'NV0018','Nguyễn Công Việt Quang','vietquang@gmail.com','0123456788','2003-12-18','male','','IT','Nhân viên','official',20000000.00,1000000.00,1000000.00,0.00,'2026-07-27',21,0,NULL,'2026-07-27 07:06:05'),(22,'NV0019','Nguyễn AI','ai123@gmail.com','0987654322','2003-12-18','male','','IT','Nhân viên','official',30000000.00,0.00,0.00,0.00,'2026-07-08',22,0,NULL,'2026-08-07 06:28:09');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kpi`
--

DROP TABLE IF EXISTS `kpi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kpi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` int(11) NOT NULL,
  `reviewerId` int(11) NOT NULL,
  `quarter` varchar(10) NOT NULL,
  `year` int(11) NOT NULL,
  `score_attitude` tinyint(4) NOT NULL DEFAULT 3,
  `score_skill` tinyint(4) NOT NULL DEFAULT 3,
  `score_result` tinyint(4) NOT NULL DEFAULT 3,
  `comment` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `kpi_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kpi`
--

LOCK TABLES `kpi` WRITE;
/*!40000 ALTER TABLE `kpi` DISABLE KEYS */;
INSERT INTO `kpi` (`id`, `employeeId`, `reviewerId`, `quarter`, `year`, `score_attitude`, `score_skill`, `score_result`, `comment`, `createdAt`) VALUES (1,1,2,'Q1',2026,5,5,4,'Lãnh đạo team IT xuất sắc, tối ưu hệ thống mượt mà','2026-04-05 10:00:00'),(2,2,1,'Q1',2026,4,5,4,'Quản lý nhân sự và chính sách C&B rất tốt','2026-04-06 11:30:00'),(3,3,1,'Q1',2026,4,4,5,'Hoàn thành đúng hạn các module trọng yếu','2026-04-07 09:15:00'),(4,4,2,'Q1',2026,5,4,5,'Quyết toán sổ sách kế toán chính xác, minh bạch','2026-04-08 14:00:00'),(5,5,2,'Q1',2026,5,5,5,'Vượt 120% chỉ tiêu doanh số team Sales quý 1','2026-04-09 16:20:00'),(6,6,2,'Q1',2026,4,4,4,'Chiến dịch MKT đầu năm đạt hiệu ứng nhận diện cao','2026-04-10 10:45:00'),(7,7,1,'Q1',2026,4,3,4,'Cần cải thiện tốc độ fix bug giao diện React','2026-04-11 13:10:00'),(8,8,2,'Q1',2026,4,5,4,'Tính toán bảng lương chuẩn xác, không có sai sót','2026-04-12 15:00:00'),(9,11,1,'Q1',2026,4,5,4,'Tối ưu cơ sở dữ liệu MySQL và viết API sạch đẹp','2026-04-13 09:40:00'),(10,15,1,'Q1',2026,5,5,4,'Thiết lập hệ thống CI/CD giúp giảm 50% thời gian deploy','2026-04-14 11:20:00'),(13,14,1,'Q1',2026,4,4,3,'tốt','2026-07-26 19:32:19');
/*!40000 ALTER TABLE `kpi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` int(11) NOT NULL,
  `leaveType` varchar(20) NOT NULL,
  `fromDate` date NOT NULL,
  `toDate` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewedBy` int(11) DEFAULT NULL,
  `reviewNote` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` (`id`, `employeeId`, `leaveType`, `fromDate`, `toDate`, `reason`, `status`, `reviewedBy`, `reviewNote`, `createdAt`) VALUES (1,1,'annual','2026-07-28','2026-07-30','Nghỉ phép du lịch gia đình','approved',2,'Đã đồng ý, chúc chuyến đi vui vẻ','2026-07-20 09:00:00'),(2,2,'sick','2026-07-15','2026-07-15','Bị sốt xuất huyết nghỉ điều trị','approved',1,'Đã kiểm tra giấy xác nhận viện','2026-07-14 16:30:00'),(3,3,'personal','2026-08-05','2026-08-06','Về quê giải quyết việc gia đình','pending',NULL,'','2026-07-25 10:15:00'),(4,4,'annual','2026-08-10','2026-08-12','Nghỉ mát hàng năm','pending',NULL,'','2026-07-26 11:00:00'),(5,7,'sick','2026-07-02','2026-07-03','Đau đầu, khám bệnh tai mũi họng','approved',1,'Đã xem xét đơn','2026-07-01 14:20:00'),(7,10,'annual','2026-08-01','2026-08-02','Đi tham quan cùng bạn bè','rejected',2,'Trùng tiến độ chạy campaign MKT','2026-07-24 15:10:00'),(8,11,'sick','2026-06-20','2026-06-21','Bị cảm cúm nặng','approved',1,'Đồng ý duyệt','2026-06-19 18:00:00'),(10,14,'maternity','2026-09-01','2027-03-01','Nghỉ thai sản theo quy định','approved',2,'Đã nhận hồ sơ thai sản','2026-07-22 13:40:00'),(11,15,'annual','2026-08-15','2026-08-20','Đi du lịch xuyên Việt','pending',NULL,'','2026-07-26 12:00:00'),(12,17,'personal','2026-07-10','2026-07-10','Đi thi bằng lái xe máy','approved',5,'Duyệt cho thử việc','2026-07-08 17:00:00'),(14,22,'annual','2026-08-07','2026-11-07','đi nước ngoài','pending',NULL,'','2026-08-07 06:30:26');
/*!40000 ALTER TABLE `leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payroll` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employeeId` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `baseSalary` decimal(15,2) NOT NULL,
  `allowance_lunch` decimal(15,2) DEFAULT 0.00,
  `allowance_transport` decimal(15,2) DEFAULT 0.00,
  `allowance_phone` decimal(15,2) DEFAULT 0.00,
  `deductions` decimal(15,2) DEFAULT 0.00,
  `totalAllowance` decimal(15,2) DEFAULT 0.00,
  `grossSalary` decimal(15,2) DEFAULT 0.00,
  `netSalary` decimal(15,2) DEFAULT 0.00,
  `createdAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employeeId` (`employeeId`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` (`id`, `employeeId`, `month`, `year`, `baseSalary`, `allowance_lunch`, `allowance_transport`, `allowance_phone`, `deductions`, `totalAllowance`, `grossSalary`, `netSalary`, `createdAt`) VALUES (1,1,7,2026,28000000.00,730000.00,500000.00,300000.00,2940000.00,1530000.00,29530000.00,26590000.00,'2026-07-26 14:11:25'),(2,2,7,2026,25000000.00,730000.00,500000.00,300000.00,2625000.00,1530000.00,26530000.00,23905000.00,'2026-07-26 14:11:25'),(3,3,7,2026,22000000.00,730000.00,500000.00,300000.00,2310000.00,1530000.00,23530000.00,21220000.00,'2026-07-26 14:11:25'),(4,4,7,2026,24000000.00,730000.00,500000.00,300000.00,2520000.00,1530000.00,25530000.00,23010000.00,'2026-07-26 14:11:25'),(5,5,7,2026,20000000.00,730000.00,500000.00,500000.00,2100000.00,1730000.00,21730000.00,19630000.00,'2026-07-26 14:11:25'),(6,6,7,2026,21000000.00,730000.00,300000.00,300000.00,2205000.00,1330000.00,22330000.00,20125000.00,'2026-07-26 14:11:25'),(7,7,7,2026,17000000.00,730000.00,500000.00,300000.00,1785000.00,1530000.00,18530000.00,16745000.00,'2026-07-26 14:11:25'),(8,8,7,2026,16000000.00,730000.00,300000.00,200000.00,1680000.00,1230000.00,17230000.00,15550000.00,'2026-07-26 14:11:25'),(10,10,7,2026,13500000.00,730000.00,200000.00,200000.00,1417500.00,1130000.00,14630000.00,13212500.00,'2026-07-26 14:11:25'),(11,11,7,2026,18500000.00,730000.00,400000.00,300000.00,1942500.00,1430000.00,19930000.00,17987500.00,'2026-07-26 14:11:25'),(12,12,7,2026,13000000.00,730000.00,200000.00,100000.00,1365000.00,1030000.00,14030000.00,12665000.00,'2026-07-26 14:11:25'),(14,14,7,2026,15000000.00,730000.00,300000.00,200000.00,1575000.00,1230000.00,16230000.00,14655000.00,'2026-07-26 14:11:25'),(15,15,7,2026,26000000.00,730000.00,500000.00,300000.00,2730000.00,1530000.00,27530000.00,24800000.00,'2026-07-26 14:11:25'),(16,16,7,2026,11000000.00,500000.00,200000.00,0.00,1155000.00,700000.00,11700000.00,10545000.00,'2026-07-26 14:11:25'),(17,17,7,2026,11500000.00,730000.00,300000.00,0.00,1207500.00,1030000.00,12530000.00,11322500.00,'2026-07-26 14:11:25'),(69,1,8,2026,28000000.00,730000.00,500000.00,300000.00,2940000.00,1530000.00,29530000.00,26590000.00,'2026-07-26 19:13:43'),(70,2,8,2026,25000000.00,730000.00,500000.00,300000.00,2625000.00,1530000.00,26530000.00,23905000.00,'2026-07-26 19:13:43'),(71,3,8,2026,22000000.00,730000.00,500000.00,300000.00,2310000.00,1530000.00,23530000.00,21220000.00,'2026-07-26 19:13:43'),(72,4,8,2026,24000000.00,730000.00,500000.00,300000.00,2520000.00,1530000.00,25530000.00,23010000.00,'2026-07-26 19:13:43'),(73,5,8,2026,20000000.00,730000.00,500000.00,500000.00,2100000.00,1730000.00,21730000.00,19630000.00,'2026-07-26 19:13:43'),(74,6,8,2026,21000000.00,730000.00,300000.00,300000.00,2205000.00,1330000.00,22330000.00,20125000.00,'2026-07-26 19:13:43'),(75,7,8,2026,17000000.00,730000.00,500000.00,300000.00,1785000.00,1530000.00,18530000.00,16745000.00,'2026-07-26 19:13:43'),(76,8,8,2026,16000000.00,730000.00,300000.00,200000.00,1680000.00,1230000.00,17230000.00,15550000.00,'2026-07-26 19:13:43'),(78,10,8,2026,13500000.00,730000.00,200000.00,200000.00,1417500.00,1130000.00,14630000.00,13212500.00,'2026-07-26 19:13:43'),(79,11,8,2026,18500000.00,730000.00,400000.00,300000.00,1942500.00,1430000.00,19930000.00,17987500.00,'2026-07-26 19:13:43'),(80,12,8,2026,13000000.00,730000.00,200000.00,100000.00,1365000.00,1030000.00,14030000.00,12665000.00,'2026-07-26 19:13:43'),(82,14,8,2026,15000000.00,730000.00,300000.00,200000.00,1575000.00,1230000.00,16230000.00,14655000.00,'2026-07-26 19:13:43'),(83,15,8,2026,26000000.00,730000.00,500000.00,300000.00,2730000.00,1530000.00,27530000.00,24800000.00,'2026-07-26 19:13:43'),(84,16,8,2026,11000000.00,500000.00,200000.00,0.00,1155000.00,700000.00,11700000.00,10545000.00,'2026-07-26 19:13:43'),(85,17,8,2026,11100000.00,730000.00,300000.00,0.00,1165500.00,1030000.00,12130000.00,10964500.00,'2026-07-26 19:13:43'),(103,21,7,2026,20000000.00,1000000.00,1000000.00,0.00,2100000.00,2000000.00,22000000.00,19900000.00,'2026-07-27 07:06:21'),(104,21,8,2026,20000000.00,1000000.00,1000000.00,0.00,2100000.00,2000000.00,22000000.00,19900000.00,'2026-08-07 06:29:01'),(105,22,8,2026,30000000.00,0.00,0.00,0.00,3150000.00,0.00,30000000.00,26850000.00,'2026-08-07 06:29:01');
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `role` enum('admin','manager','employee') NOT NULL DEFAULT 'employee',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password`, `fullName`, `role`, `isActive`, `createdAt`) VALUES (1,'admin','$2y$10$H/qOup0.F0gwVMP0wJt05eUveFQ6y3u//fP3/4PJtk1QzDTToSNvC','Nguyễn Admin','admin',1,'2024-01-01 08:00:00'),(2,'manager','$2y$10$.qKE4zjFeM0Y/QoCJY7GTO91KgZJ9owIZWKuD4BueKwz6nTXjjwUi','Trần Thị Bích','manager',1,'2024-01-05 09:00:00'),(3,'employee','$2y$10$BTtcHihBcK/ic.0BjAl3d.q48W6ykACWeZ2..c2Auxty1KeU07U/S','Lê Minh Cường','employee',1,'2024-02-10 10:30:00'),(4,'it_lead','$2y$10$H/qOup0.F0gwVMP0wJt05eUveFQ6y3u//fP3/4PJtk1QzDTToSNvC','Nguyễn Văn An','manager',1,'2024-01-10 08:30:00'),(5,'sale_lead','$2y$10$.qKE4zjFeM0Y/QoCJY7GTO91KgZJ9owIZWKuD4BueKwz6nTXjjwUi','Hoàng Văn Em','manager',1,'2024-03-01 09:15:00'),(7,'dungpham','$2y$10$jw1Oi7f1fvAdJ4E9nozwPuJanOH4TFCPhMErjCgvFok.EB883GIOK','Phạm Thu Dung','employee',1,'2026-07-26 18:58:16'),(8,'thaodinh','$2y$10$JfPvv4ORLqyMmhbEN2Mc.eeEWA1D449/9wQ/9NsZsDYZA0Wd9A5eO','Đinh Phương Thảo','employee',1,'2026-07-26 18:58:16'),(9,'giangngo','$2y$10$Io3e3pFRpgEClqk4i9FCfuK3HiIpII14ofgQPNVgsz1tPKGxb9jty','Ngô Thanh Giang','employee',1,'2026-07-26 18:58:16'),(10,'linhbui','$2y$10$slA9FTjIlHufIxj7JJSadO/JZSzOvoRxKLGpaX0cqBfYOx7cBiKcO','Bùi Hà Linh','employee',1,'2026-07-26 18:58:16'),(12,'linhdo','$2y$10$x/9AA4UQZiifoOa2veKTX.tA.paQkDS2oTXpOdbiWZMOdXBXtwdgC','Đỗ Khánh Linh','employee',1,'2026-07-26 18:58:16'),(13,'anhtrinh','$2y$10$1QQlmhifmhz8zhO7xoXKC.b1O1gGk/tJQLAbfjNp43NX5mGhqY.JG','Trịnh Đức Anh','employee',1,'2026-07-26 18:58:17'),(14,'phuongnguyen','$2y$10$fodrAuL3iJ7Vw94v58ca1eZE1o6P7hnIroD3J/f0rLBD5SpQXkIYm','Nguyễn Mai Phương','employee',1,'2026-07-26 18:58:17'),(16,'trangphan','$2y$10$Ssg2eyXfYYnXnlZOcgA.SOCmilV6DQusB0WzT3tjKxl26JmeKL7nG','Phan Thùy Trang','employee',1,'2026-07-26 18:58:17'),(17,'hoavo','$2y$10$/DCXVUcMlTl1zqDMftKMfudhVeezn5NLV0DG5C6Q6Okc8mqSB305m','Võ Văn Hòa','employee',1,'2026-07-26 18:58:17'),(18,'yendang','$2y$10$QYVzMJ0eb5LVGtoFtd/gwekSrKLAXxH/3Cpa2FUn26JW0/FUKbwWK','Đặng Kim Yến','employee',1,'2026-07-26 18:58:17'),(19,'longcao','$2y$10$.1Y0.hfiBgZPtxfsv8x5..QOALRm6UHAtsJAESMButixDOC1D21by','Cao Thành Long','employee',1,'2026-07-26 18:58:17'),(21,'quang','$2y$10$roDC0o10SiDrkZycOOlYhOMagC/b7yQTQqrUZHPBil3QWRD7Ul7Uq','Nguyễn Công Việt Quang','employee',1,'2026-07-27 07:06:05'),(22,'cuangcvq','$2y$10$KwYFVAsImp0fi1aZ8rMUguNsrt2Gai9DX5oXswzIMGYVnuREMp7yi','Nguyễn AI','employee',1,'2026-08-07 06:28:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-07 12:07:22
