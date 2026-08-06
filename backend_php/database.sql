-- Tạo cơ sở dữ liệu hrms nếu chưa có
CREATE DATABASE IF NOT EXISTS `hrms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hrms`;

-- --------------------------------------------------------
-- Xóa bảng cũ nếu tồn tại
-- --------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `payroll`;
DROP TABLE IF EXISTS `kpi`;
DROP TABLE IF EXISTS `leaves`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------
-- 1. Bảng users (Tài khoản người dùng)
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu users (mật khẩu chuẩn bcrypt cho admin123, manager123, emp123)
INSERT INTO `users` (`id`, `username`, `password`, `fullName`, `role`, `isActive`, `createdAt`) VALUES
(1, 'admin',    '$2y$10$H/qOup0.F0gwVMP0wJt05eUveFQ6y3u//fP3/4PJtk1QzDTToSNvC', 'Nguyễn Admin',    'admin',    1, '2024-01-01 08:00:00'),
(2, 'manager',  '$2y$10$.qKE4zjFeM0Y/QoCJY7GTO91KgZJ9owIZWKuD4BueKwz6nTXjjwUi', 'Trần Thị Bích',   'manager',  1, '2024-01-05 09:00:00'),
(3, 'employee', '$2y$10$BTtcHihBcK/ic.0BjAl3d.q48W6ykACWeZ2..c2Auxty1KeU07U/S', 'Lê Minh Cường',   'employee', 1, '2024-02-10 10:30:00'),
(4, 'it_lead',  '$2y$10$H/qOup0.F0gwVMP0wJt05eUveFQ6y3u//fP3/4PJtk1QzDTToSNvC', 'Nguyễn Văn An',   'manager',  1, '2024-01-10 08:30:00'),
(5, 'sale_lead', '$2y$10$.qKE4zjFeM0Y/QoCJY7GTO91KgZJ9owIZWKuD4BueKwz6nTXjjwUi', 'Hoàng Văn Em',   'manager',  1, '2024-03-01 09:15:00');

-- --------------------------------------------------------
-- 2. Bảng employees (Hồ sơ nhân viên - 17 Nhân viên phong phú)
-- --------------------------------------------------------
CREATE TABLE `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` VARCHAR(20) NOT NULL UNIQUE,
  `fullName` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT '',
  `birthday` DATE DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT 'other',
  `avatar` VARCHAR(255) DEFAULT '',
  `department` VARCHAR(50) DEFAULT 'Khác',
  `position` VARCHAR(50) DEFAULT 'Nhân viên',
  `contractType` ENUM('probation', 'official', 'parttime') DEFAULT 'official',
  `baseSalary` DECIMAL(15,2) DEFAULT 0,
  `allowance_lunch` DECIMAL(15,2) DEFAULT 0,
  `allowance_transport` DECIMAL(15,2) DEFAULT 0,
  `allowance_phone` DECIMAL(15,2) DEFAULT 0,
  `startDate` DATE DEFAULT NULL,
  `userId` INT DEFAULT NULL,
  `isDeleted` TINYINT(1) DEFAULT 0,
  `deletedAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `employees` (`id`, `employeeId`, `fullName`, `email`, `phone`, `birthday`, `gender`, `avatar`, `department`, `position`, `contractType`, `baseSalary`, `allowance_lunch`, `allowance_transport`, `allowance_phone`, `startDate`, `userId`, `isDeleted`, `deletedAt`, `createdAt`) VALUES
(1,  'NV0001', 'Nguyễn Văn An',     'an.nguyen@hrms.vn',    '0901111111', '1990-05-15', 'male',   '', 'IT',       'Trưởng phòng IT',   'official',  28000000, 730000, 500000, 300000, '2022-01-10', 4, 0, NULL, '2022-01-10 08:00:00'),
(2,  'NV0002', 'Trần Thị Bích',     'bich.tran@hrms.vn',    '0902222222', '1993-08-20', 'female', '', 'Nhân sự', 'Trưởng phòng HR',   'official',  25000000, 730000, 500000, 300000, '2022-03-15', 2, 0, NULL, '2022-03-15 08:30:00'),
(3,  'NV0003', 'Lê Minh Cường',     'cuong.le@hrms.vn',     '0903333333', '1995-12-01', 'male',   '', 'IT',       'Senior Developer',  'official',  22000000, 730000, 500000, 300000, '2023-06-01', 3, 0, NULL, '2023-06-01 09:00:00'),
(4,  'NV0004', 'Phạm Thu Dung',     'dung.pham@hrms.vn',    '0904444444', '1991-03-10', 'female', '', 'Kế toán', 'Kế toán trưởng',    'official',  24000000, 730000, 500000, 300000, '2023-02-20', NULL, 0, NULL, '2023-02-20 09:30:00'),
(5,  'NV0005', 'Hoàng Văn Em',      'em.hoang@hrms.vn',     '0905555555', '1998-07-22', 'male',   '', 'Sales',    'Trưởng phòng Sales', 'official',  20000000, 730000, 500000, 500000, '2023-11-01', 5, 0, NULL, '2023-11-01 10:00:00'),
(6,  'NV0006', 'Đinh Phương Thảo',  'thao.dinh@hrms.vn',    '0906666666', '1994-01-30', 'female', '', 'Marketing','Trưởng phòng MKT',   'official',  21000000, 730000, 300000, 300000, '2023-09-01', NULL, 0, NULL, '2023-09-01 08:30:00'),
(7,  'NV0007', 'Ngô Thanh Giang',   'giang.ngo@hrms.vn',    '0907777777', '1996-11-05', 'male',   '', 'IT',       'Frontend Developer','official',  17000000, 730000, 500000, 300000, '2023-04-01', NULL, 0, NULL, '2023-04-01 09:00:00'),
(8,  'NV0008', 'Bùi Hà Linh',       'linh.bui@hrms.vn',     '0908888888', '1992-09-14', 'female', '', 'Nhân sự', 'Chuyên viên C&B',   'official',  16000000, 730000, 300000, 200000, '2021-07-15', NULL, 0, NULL, '2021-07-15 08:00:00'),
(9,  'NV0009', 'Vũ Hoàng Nam',      'nam.vu@hrms.vn',       '0909999999', '1997-04-18', 'male',   '', 'Sales',    'Chuyên viên Sales', 'official',  14000000, 730000, 500000, 300000, '2024-01-15', NULL, 0, NULL, '2024-01-15 09:30:00'),
(10, 'NV0010', 'Đỗ Khánh Linh',     'linh.do@hrms.vn',      '0911000111', '1999-02-28', 'female', '', 'Marketing','Content Creator',   'official',  13500000, 730000, 200000, 200000, '2024-03-01', NULL, 0, NULL, '2024-03-01 08:00:00'),
(11, 'NV0011', 'Trịnh Đức Anh',     'anh.trinh@hrms.vn',    '0912111222', '1995-10-12', 'male',   '', 'IT',       'Backend Developer', 'official',  18500000, 730000, 400000, 300000, '2023-08-15', NULL, 0, NULL, '2023-08-15 09:00:00'),
(12, 'NV0012', 'Nguyễn Mai Phương', 'phuong.nguyen@hrms.vn','0913222333', '1996-06-25', 'female', '', 'Kế toán', 'Kế toán viên',     'official',  13000000, 730000, 200000, 100000, '2024-02-01', NULL, 0, NULL, '2024-02-01 08:30:00'),
(13, 'NV0013', 'Lý Quốc Bảo',       'bao.ly@hrms.vn',       '0914333444', '2000-09-08', 'male',   '', 'Sales',    'Chuyên viên Tư vấn','probation', 12500000, 730000, 200000, 200000, '2026-06-01', NULL, 0, NULL, '2026-06-01 09:00:00'),
(14, 'NV0014', 'Phan Thùy Trang',   'trang.phan@hrms.vn',   '0915444555', '1994-12-19', 'female', '', 'Nhân sự', 'Chuyên viên Tuyển dụng','official', 15000000, 730000, 300000, 200000, '2023-10-10', NULL, 0, NULL, '2023-10-10 08:30:00'),
(15, 'NV0015', 'Võ Văn Hòa',        'hoa.vo@hrms.vn',       '0916555666', '1991-08-04', 'male',   '', 'IT',       'DevOps Engineer',   'official',  26000000, 730000, 500000, 300000, '2022-11-01', NULL, 0, NULL, '2022-11-01 09:00:00'),
(16, 'NV0016', 'Đặng Kim Yến',      'yen.dang@hrms.vn',     '0917666777', '2001-03-14', 'female', '', 'Khác',     'Lễ tân & Admin',    'parttime',  11000000, 500000, 200000, 0,      '2024-05-01', NULL, 0, NULL, '2024-05-01 08:00:00'),
(17, 'NV0017', 'Cao Thành Long',    'long.cao@hrms.vn',     '0918777888', '1998-11-30', 'male',   '', 'Sales',    'Nhân viên Kinh doanh','probation', 11500000, 730000, 300000, 0,      '2026-07-01', NULL, 0, NULL, '2026-07-01 09:00:00');

-- --------------------------------------------------------
-- 3. Bảng leaves (Nghỉ phép - Dữ liệu đa dạng & thực tế)
-- --------------------------------------------------------
CREATE TABLE `leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` INT NOT NULL,
  `leaveType` VARCHAR(20) NOT NULL,
  `fromDate` DATE NOT NULL,
  `toDate` DATE NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `reviewedBy` INT DEFAULT NULL,
  `reviewNote` TEXT DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `leaves` (`id`, `employeeId`, `leaveType`, `fromDate`, `toDate`, `reason`, `status`, `reviewedBy`, `reviewNote`, `createdAt`) VALUES
(1,  1,  'annual',   '2026-07-28', '2026-07-30', 'Nghỉ phép du lịch gia đình',     'approved', 2, 'Đã đồng ý, chúc chuyến đi vui vẻ', '2026-07-20 09:00:00'),
(2,  2,  'sick',     '2026-07-15', '2026-07-15', 'Bị sốt xuất huyết nghỉ điều trị', 'approved', 1, 'Đã kiểm tra giấy xác nhận viện', '2026-07-14 16:30:00'),
(3,  3,  'personal', '2026-08-05', '2026-08-06', 'Về quê giải quyết việc gia đình', 'pending',  NULL, '',                             '2026-07-25 10:15:00'),
(4,  4,  'annual',   '2026-08-10', '2026-08-12', 'Nghỉ mát hàng năm',              'pending',  NULL, '',                             '2026-07-26 11:00:00'),
(5,  7,  'sick',     '2026-07-02', '2026-07-03', 'Đau đầu, khám bệnh tai mũi họng',  'approved', 1, 'Đã xem xét đơn',                  '2026-07-01 14:20:00'),
(6,  9,  'personal', '2026-07-18', '2026-07-18', 'Đi khám sức khỏe định kỳ lái xe', 'approved', 2, 'Duyệt nghỉ 1 ngày',              '2026-07-16 08:45:00'),
(7,  10, 'annual',   '2026-08-01', '2026-08-02', 'Đi tham quan cùng bạn bè',       'rejected', 2, 'Trùng tiến độ chạy campaign MKT',  '2026-07-24 15:10:00'),
(8,  11, 'sick',     '2026-06-20', '2026-06-21', 'Bị cảm cúm nặng',                 'approved', 1, 'Đồng ý duyệt',                    '2026-06-19 18:00:00'),
(9,  13, 'personal', '2026-07-29', '2026-07-29', 'Làm thủ tục hành chính tại phường','pending',  NULL, '',                             '2026-07-26 09:30:00'),
(10, 14, 'maternity','2026-09-01', '2027-03-01', 'Nghỉ thai sản theo quy định',    'approved', 2, 'Đã nhận hồ sơ thai sản',           '2026-07-22 13:40:00'),
(11, 15, 'annual',   '2026-08-15', '2026-08-20', 'Đi du lịch xuyên Việt',          'pending',  NULL, '',                             '2026-07-26 12:00:00'),
(12, 17, 'personal', '2026-07-10', '2026-07-10', 'Đi thi bằng lái xe máy',         'approved', 5, 'Duyệt cho thử việc',              '2026-07-08 17:00:00');

-- --------------------------------------------------------
-- 4. Bảng kpi (Đánh giá KPI)
-- --------------------------------------------------------
CREATE TABLE `kpi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` INT NOT NULL,
  `reviewerId` INT NOT NULL,
  `quarter` VARCHAR(10) NOT NULL,
  `year` INT NOT NULL,
  `score_attitude` TINYINT NOT NULL DEFAULT 3,
  `score_skill` TINYINT NOT NULL DEFAULT 3,
  `score_result` TINYINT NOT NULL DEFAULT 3,
  `comment` TEXT DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kpi` (`id`, `employeeId`, `reviewerId`, `quarter`, `year`, `score_attitude`, `score_skill`, `score_result`, `comment`, `createdAt`) VALUES
(1,  1,  2, 'Q1', 2026, 5, 5, 4, 'Lãnh đạo team IT xuất sắc, tối ưu hệ thống mượt mà',    '2026-04-05 10:00:00'),
(2,  2,  1, 'Q1', 2026, 4, 5, 4, 'Quản lý nhân sự và chính sách C&B rất tốt',            '2026-04-06 11:30:00'),
(3,  3,  1, 'Q1', 2026, 4, 4, 5, 'Hoàn thành đúng hạn các module trọng yếu',             '2026-04-07 09:15:00'),
(4,  4,  2, 'Q1', 2026, 5, 4, 5, 'Quyết toán sổ sách kế toán chính xác, minh bạch',      '2026-04-08 14:00:00'),
(5,  5,  2, 'Q1', 2026, 5, 5, 5, 'Vượt 120% chỉ tiêu doanh số team Sales quý 1',         '2026-04-09 16:20:00'),
(6,  6,  2, 'Q1', 2026, 4, 4, 4, 'Chiến dịch MKT đầu năm đạt hiệu ứng nhận diện cao',    '2026-04-10 10:45:00'),
(7,  7,  1, 'Q1', 2026, 4, 3, 4, 'Cần cải thiện tốc độ fix bug giao diện React',        '2026-04-11 13:10:00'),
(8,  8,  2, 'Q1', 2026, 4, 5, 4, 'Tính toán bảng lương chuẩn xác, không có sai sót',     '2026-04-12 15:00:00'),
(9,  11, 1, 'Q1', 2026, 4, 5, 4, 'Tối ưu cơ sở dữ liệu MySQL và viết API sạch đẹp',     '2026-04-13 09:40:00'),
(10, 15, 1, 'Q1', 2026, 5, 5, 4, 'Thiết lập hệ thống CI/CD giúp giảm 50% thời gian deploy', '2026-04-14 11:20:00');

-- --------------------------------------------------------
-- 5. Bảng payroll (Bảng lương đầy đủ cho 17 nhân viên)
-- --------------------------------------------------------
CREATE TABLE `payroll` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` INT NOT NULL,
  `month` INT NOT NULL,
  `year` INT NOT NULL,
  `baseSalary` DECIMAL(15,2) NOT NULL,
  `allowance_lunch` DECIMAL(15,2) DEFAULT 0,
  `allowance_transport` DECIMAL(15,2) DEFAULT 0,
  `allowance_phone` DECIMAL(15,2) DEFAULT 0,
  `deductions` DECIMAL(15,2) DEFAULT 0,
  `totalAllowance` DECIMAL(15,2) DEFAULT 0,
  `grossSalary` DECIMAL(15,2) DEFAULT 0,
  `netSalary` DECIMAL(15,2) DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payroll` (`id`, `employeeId`, `month`, `year`, `baseSalary`, `allowance_lunch`, `allowance_transport`, `allowance_phone`, `deductions`, `totalAllowance`, `grossSalary`, `netSalary`, `createdAt`) VALUES
(1,  1,  7, 2026, 28000000, 730000, 500000, 300000, 2940000, 1530000, 29530000, 26590000, NOW()),
(2,  2,  7, 2026, 25000000, 730000, 500000, 300000, 2625000, 1530000, 26530000, 23905000, NOW()),
(3,  3,  7, 2026, 22000000, 730000, 500000, 300000, 2310000, 1530000, 23530000, 21220000, NOW()),
(4,  4,  7, 2026, 24000000, 730000, 500000, 300000, 2520000, 1530000, 25530000, 23010000, NOW()),
(5,  5,  7, 2026, 20000000, 730000, 500000, 500000, 2100000, 1730000, 21730000, 19630000, NOW()),
(6,  6,  7, 2026, 21000000, 730000, 300000, 300000, 2205000, 1330000, 22330000, 20125000, NOW()),
(7,  7,  7, 2026, 17000000, 730000, 500000, 300000, 1785000, 1530000, 18530000, 16745000, NOW()),
(8,  8,  7, 2026, 16000000, 730000, 300000, 200000, 1680000, 1230000, 17230000, 15550000, NOW()),
(9,  9,  7, 2026, 14000000, 730000, 500000, 300000, 1470000, 1530000, 15530000, 14060000, NOW()),
(10, 10, 7, 2026, 13500000, 730000, 200000, 200000, 1417500, 1130000, 14630000, 13212500, NOW()),
(11, 11, 7, 2026, 18500000, 730000, 400000, 300000, 1942500, 1430000, 19930000, 17987500, NOW()),
(12, 12, 7, 2026, 13000000, 730000, 200000, 100000, 1365000, 1030000, 14030000, 12665000, NOW()),
(13, 13, 7, 2026, 12500000, 730000, 200000, 200000, 1312500, 1130000, 13630000, 12317500, NOW()),
(14, 14, 7, 2026, 15000000, 730000, 300000, 200000, 1575000, 1230000, 16230000, 14655000, NOW()),
(15, 15, 7, 2026, 26000000, 730000, 500000, 300000, 2730000, 1530000, 27530000, 24800000, NOW()),
(16, 16, 7, 2026, 11000000, 500000, 200000, 0,      1155000, 700000,  11700000, 10545000, NOW()),
(17, 17, 7, 2026, 11500000, 730000, 300000, 0,      1207500, 1030000, 12530000, 11322500, NOW());

-- --------------------------------------------------------
-- 6. Bảng announcements (Thông báo nội bộ phong phú)
-- --------------------------------------------------------
CREATE TABLE `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `createdBy` INT NOT NULL,
  `readBy` TEXT DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`id`, `title`, `content`, `createdBy`, `readBy`, `createdAt`) VALUES
(1, '🎉 Chào mừng hệ thống HR mới!',          'Hệ thống quản lý nhân sự Mini HRMS đã chính thức ra mắt. Mọi thắc mắc vui lòng liên hệ phòng Nhân sự (HR Department).', 1, '[1, 2, 3]', '2026-07-01 08:00:00'),
(2, '📅 Lịch họp toàn công ty tháng 8',        'Họp toàn thể công ty vào 09:00 sáng thứ Hai 04/08/2026 tại phòng họp lớn tầng 3. Tất cả nhân viên vui lòng tham dự đầy đủ.', 1, '[1, 2]',    '2026-07-20 09:30:00'),
(3, '💰 Thông báo điều chỉnh lương & thưởng Q3','Ban Giám Đốc quyết định điều chỉnh mức phụ cấp xăng xe và xét thưởng hiệu suất làm việc cho các nhân viên xuất sắc trong quý 3/2026.', 1, '[1]',       '2026-07-22 14:00:00'),
(4, '✈️ Thông báo Teambuilding Hạ Long 2026',  'Công ty sẽ tổ chức chương trình du lịch nghỉ dưỡng 3 ngày 2 đêm tại Hạ Long từ ngày 22/08 đến 24/08/2026. Anh chị em chuẩn bị tinh thần bung xõa nhé!', 2, '[]',      '2026-07-25 11:15:00'),
(5, '🔒 Nhắc nhở bảo mật tài khoản & dữ liệu', 'Yêu cầu toàn thể nhân viên đổi mật khẩu tài khoản nội bộ và không chia sẻ thông tin đăng nhập cho bất kỳ ai ngoài thẩm quyền.', 1, '[]',      '2026-07-26 08:30:00');
