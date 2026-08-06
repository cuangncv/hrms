<?php
/**
 * Store: Đọc/ghi dữ liệu từ CSDL MySQL (thông qua PDO)
 *
 * store_read()/store_read_one() — đọc (nhiều dòng / một dòng), tự chuẩn hoá kiểu dữ liệu
 * store_insert()/store_update()/store_delete() — ghi đúng 1 dòng bằng SQL có điều kiện
 *   (không đọc-toàn-bảng rồi ghi-đè-toàn-bảng, tránh mất dữ liệu khi có request ghi đồng thời)
 */

function get_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host    = env('DB_HOST', 'localhost');
        $db      = env('DB_NAME', 'hrms');
        $user    = env('DB_USER', 'root');
        $pass    = env('DB_PASS', '');
        $charset = 'utf8mb4';
        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
            $pdo->exec("SET NAMES utf8mb4");
        } catch (\PDOException $e) {
            json_err("Kết nối CSDL MySQL thất bại: " . $e->getMessage(), 500);
        }
    }
    return $pdo;
}

// ─── Chuẩn hoá kiểu dữ liệu 1 dòng theo từng collection ─────────────────────
function store_normalize_row(string $col, array $item): array {
    $item['id']  = (int)$item['id'];
    $item['_id'] = (string)$item['id'];

    if ($col === 'users') {
        $item['isActive'] = (bool)$item['isActive'];
    } elseif ($col === 'employees') {
        $item['isDeleted']  = (bool)$item['isDeleted'];
        $item['baseSalary'] = (float)$item['baseSalary'];
        $item['allowances'] = [
            'lunch'     => (float)($item['allowance_lunch'] ?? 0),
            'transport' => (float)($item['allowance_transport'] ?? 0),
            'phone'     => (float)($item['allowance_phone'] ?? 0),
        ];
        if (isset($item['userId']) && $item['userId'] !== null) {
            $item['userId'] = (int)$item['userId'];
        }
    } elseif ($col === 'leaves') {
        $item['employeeId'] = (int)$item['employeeId'];
        if (isset($item['reviewedBy']) && $item['reviewedBy'] !== null) {
            $item['reviewedBy'] = (int)$item['reviewedBy'];
        }
    } elseif ($col === 'kpi') {
        $item['employeeId'] = (int)$item['employeeId'];
        $item['reviewerId'] = (int)$item['reviewerId'];
        $item['scores']     = [
            'attitude' => (int)($item['score_attitude'] ?? 3),
            'skill'    => (int)($item['score_skill'] ?? 3),
            'result'   => (int)($item['score_result'] ?? 3),
        ];
        $item['avgScore'] = round(array_sum($item['scores']) / 3, 1);
        $item['rank']     = kpi_rank_from_score($item['avgScore']);
        $item['period']   = [
            'quarter' => $item['quarter'] ?? 'Q1',
            'year'    => (int)($item['year'] ?? date('Y')),
        ];
    } elseif ($col === 'payroll') {
        $item['employeeId']     = (int)$item['employeeId'];
        $item['month']          = (int)$item['month'];
        $item['year']           = (int)$item['year'];
        $item['baseSalary']     = (float)$item['baseSalary'];
        $item['deductions']     = (float)$item['deductions'];
        $item['totalAllowance'] = (float)$item['totalAllowance'];
        $item['grossSalary']    = (float)$item['grossSalary'];
        $item['netSalary']      = (float)$item['netSalary'];
        $item['allowances']     = [
            'lunch'     => (float)($item['allowance_lunch'] ?? 0),
            'transport' => (float)($item['allowance_transport'] ?? 0),
            'phone'     => (float)($item['allowance_phone'] ?? 0),
        ];
    } elseif ($col === 'announcements') {
        $item['createdBy'] = (int)$item['createdBy'];
        if (isset($item['readBy'])) {
            if (is_string($item['readBy'])) {
                $item['readBy'] = json_decode($item['readBy'], true) ?? [];
            }
        } else {
            $item['readBy'] = [];
        }
    }
    return $item;
}

// ─── Đọc toàn bộ collection từ MySQL ──────────────────────────────────────
function store_read(string $col): array {
    $db   = get_db();
    $stmt = $db->query("SELECT * FROM `$col` ORDER BY id ASC");
    $items = $stmt->fetchAll();
    foreach ($items as &$item) {
        $item = store_normalize_row($col, $item);
    }
    return $items;
}

// ─── Đọc đúng 1 dòng theo id ──────────────────────────────────────────────
function store_read_one(string $col, $id): ?array {
    $db   = get_db();
    $stmt = $db->prepare("SELECT * FROM `$col` WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) return null;
    return store_normalize_row($col, $item);
}

// ─── Thêm mới 1 dòng, trả về dòng đã có id ────────────────────────────────
function store_insert(string $col, array $item): array {
    $db = get_db();

    if ($col === 'users') {
        $stmt = $db->prepare("INSERT INTO `users` (username, password, fullName, role, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $item['username'],
            $item['password'],
            $item['fullName'],
            $item['role'] ?? 'employee',
            !empty($item['isActive']) ? 1 : 0,
            $item['createdAt'] ?? now_iso(),
        ]);
    } elseif ($col === 'employees') {
        $al = $item['allowances'] ?? [];
        $stmt = $db->prepare("INSERT INTO `employees` (employeeId, fullName, email, phone, birthday, gender, avatar, department, position, contractType, baseSalary, allowance_lunch, allowance_transport, allowance_phone, startDate, userId, isDeleted, deletedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $item['employeeId'],
            $item['fullName'],
            $item['email'],
            $item['phone'] ?? '',
            !empty($item['birthday']) ? $item['birthday'] : null,
            $item['gender'] ?? 'other',
            $item['avatar'] ?? '',
            $item['department'] ?? 'Khác',
            $item['position'] ?? 'Nhân viên',
            $item['contractType'] ?? 'official',
            $item['baseSalary'] ?? 0,
            $al['lunch'] ?? 0,
            $al['transport'] ?? 0,
            $al['phone'] ?? 0,
            !empty($item['startDate']) ? $item['startDate'] : null,
            $item['userId'] ?? null,
            !empty($item['isDeleted']) ? 1 : 0,
            !empty($item['deletedAt']) ? $item['deletedAt'] : null,
            $item['createdAt'] ?? now_iso(),
        ]);
    } elseif ($col === 'leaves') {
        $stmt = $db->prepare("INSERT INTO `leaves` (employeeId, leaveType, fromDate, toDate, reason, status, reviewedBy, reviewNote, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $item['employeeId'],
            $item['leaveType'],
            $item['fromDate'],
            $item['toDate'],
            $item['reason'] ?? '',
            $item['status'] ?? 'pending',
            $item['reviewedBy'] ?? null,
            $item['reviewNote'] ?? '',
            $item['createdAt'] ?? now_iso(),
        ]);
    } elseif ($col === 'kpi') {
        $period = $item['period'] ?? [];
        $sc     = $item['scores'] ?? [];
        $stmt = $db->prepare("INSERT INTO `kpi` (employeeId, reviewerId, quarter, year, score_attitude, score_skill, score_result, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $item['employeeId'],
            $item['reviewerId'] ?? 1,
            $period['quarter'] ?? 'Q1',
            $period['year'] ?? date('Y'),
            $sc['attitude'] ?? 3,
            $sc['skill']    ?? 3,
            $sc['result']   ?? 3,
            $item['comment'] ?? '',
            $item['createdAt'] ?? now_iso(),
        ]);
    } elseif ($col === 'payroll') {
        $item = compute_payroll($item);
        $al   = $item['allowances'] ?? [];
        $stmt = $db->prepare("INSERT INTO `payroll` (employeeId, month, year, baseSalary, allowance_lunch, allowance_transport, allowance_phone, deductions, totalAllowance, grossSalary, netSalary, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $item['employeeId'],
            $item['month'],
            $item['year'],
            $item['baseSalary'] ?? 0,
            $al['lunch'] ?? 0,
            $al['transport'] ?? 0,
            $al['phone'] ?? 0,
            $item['deductions'] ?? 0,
            $item['totalAllowance'] ?? 0,
            $item['grossSalary'] ?? 0,
            $item['netSalary'] ?? 0,
            $item['createdAt'] ?? now_iso(),
        ]);
    } elseif ($col === 'announcements') {
        $readBy = is_array($item['readBy'] ?? null) ? json_encode($item['readBy']) : '[]';
        $stmt = $db->prepare("INSERT INTO `announcements` (title, content, createdBy, readBy, createdAt) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $item['title'],
            $item['content'],
            $item['createdBy'] ?? 1,
            $readBy,
            $item['createdAt'] ?? now_iso(),
        ]);
    } else {
        throw new InvalidArgumentException("store_insert: collection không hợp lệ '$col'");
    }

    $item['id'] = (int)$db->lastInsertId();
    return store_normalize_row($col, array_merge($item, ['id' => $item['id']]));
}

// ─── Cập nhật 1 dòng theo id (chỉ đúng dòng đó, không đụng dòng khác) ─────
function store_update(string $col, $id, array $item): void {
    $db = get_db();

    if ($col === 'users') {
        $stmt = $db->prepare("UPDATE `users` SET username=?, password=?, fullName=?, role=?, isActive=? WHERE id=?");
        $stmt->execute([
            $item['username'],
            $item['password'],
            $item['fullName'],
            $item['role'] ?? 'employee',
            !empty($item['isActive']) ? 1 : 0,
            $id,
        ]);
    } elseif ($col === 'employees') {
        $al = $item['allowances'] ?? [];
        $stmt = $db->prepare("UPDATE `employees` SET employeeId=?, fullName=?, email=?, phone=?, birthday=?, gender=?, avatar=?, department=?, position=?, contractType=?, baseSalary=?, allowance_lunch=?, allowance_transport=?, allowance_phone=?, startDate=?, userId=?, isDeleted=?, deletedAt=? WHERE id=?");
        $stmt->execute([
            $item['employeeId'],
            $item['fullName'],
            $item['email'],
            $item['phone'] ?? '',
            !empty($item['birthday']) ? $item['birthday'] : null,
            $item['gender'] ?? 'other',
            $item['avatar'] ?? '',
            $item['department'] ?? 'Khác',
            $item['position'] ?? 'Nhân viên',
            $item['contractType'] ?? 'official',
            $item['baseSalary'] ?? 0,
            $al['lunch'] ?? 0,
            $al['transport'] ?? 0,
            $al['phone'] ?? 0,
            !empty($item['startDate']) ? $item['startDate'] : null,
            $item['userId'] ?? null,
            !empty($item['isDeleted']) ? 1 : 0,
            !empty($item['deletedAt']) ? $item['deletedAt'] : null,
            $id,
        ]);
    } elseif ($col === 'leaves') {
        $stmt = $db->prepare("UPDATE `leaves` SET employeeId=?, leaveType=?, fromDate=?, toDate=?, reason=?, status=?, reviewedBy=?, reviewNote=? WHERE id=?");
        $stmt->execute([
            $item['employeeId'],
            $item['leaveType'],
            $item['fromDate'],
            $item['toDate'],
            $item['reason'] ?? '',
            $item['status'] ?? 'pending',
            $item['reviewedBy'] ?? null,
            $item['reviewNote'] ?? '',
            $id,
        ]);
    } elseif ($col === 'kpi') {
        $period = $item['period'] ?? [];
        $sc     = $item['scores'] ?? [];
        $stmt = $db->prepare("UPDATE `kpi` SET employeeId=?, reviewerId=?, quarter=?, year=?, score_attitude=?, score_skill=?, score_result=?, comment=? WHERE id=?");
        $stmt->execute([
            $item['employeeId'],
            $item['reviewerId'] ?? 1,
            $period['quarter'] ?? 'Q1',
            $period['year'] ?? date('Y'),
            $sc['attitude'] ?? 3,
            $sc['skill']    ?? 3,
            $sc['result']   ?? 3,
            $item['comment'] ?? '',
            $id,
        ]);
    } elseif ($col === 'payroll') {
        $item = compute_payroll($item);
        $al   = $item['allowances'] ?? [];
        $stmt = $db->prepare("UPDATE `payroll` SET employeeId=?, month=?, year=?, baseSalary=?, allowance_lunch=?, allowance_transport=?, allowance_phone=?, deductions=?, totalAllowance=?, grossSalary=?, netSalary=? WHERE id=?");
        $stmt->execute([
            $item['employeeId'],
            $item['month'],
            $item['year'],
            $item['baseSalary'] ?? 0,
            $al['lunch'] ?? 0,
            $al['transport'] ?? 0,
            $al['phone'] ?? 0,
            $item['deductions'] ?? 0,
            $item['totalAllowance'] ?? 0,
            $item['grossSalary'] ?? 0,
            $item['netSalary'] ?? 0,
            $id,
        ]);
    } elseif ($col === 'announcements') {
        $readBy = is_array($item['readBy'] ?? null) ? json_encode($item['readBy']) : '[]';
        $stmt = $db->prepare("UPDATE `announcements` SET title=?, content=?, createdBy=?, readBy=? WHERE id=?");
        $stmt->execute([
            $item['title'],
            $item['content'],
            $item['createdBy'] ?? 1,
            $readBy,
            $id,
        ]);
    } else {
        throw new InvalidArgumentException("store_update: collection không hợp lệ '$col'");
    }
}

// ─── Xoá 1 dòng theo id ────────────────────────────────────────────────────
function store_delete(string $col, $id): bool {
    $db   = get_db();
    $stmt = $db->prepare("DELETE FROM `$col` WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->rowCount() > 0;
}

function now_iso(): string {
    return date('Y-m-d H:i:s');
}

function store_find_by_id(array $items, $id): ?array {
    foreach ($items as $item) {
        if ((string)$item['id'] === (string)$id) return $item;
    }
    return null;
}

// Tìm hồ sơ nhân viên gắn với 1 tài khoản đăng nhập (dùng để giới hạn quyền xem/tạo dữ liệu của chính mình)
function store_find_employee_by_user($userId): ?array {
    foreach (store_read('employees') as $e) {
        if ((string)($e['userId'] ?? '') === (string)$userId) return $e;
    }
    return null;
}

function kpi_rank_from_score(float $avg): string {
    if ($avg >= 4.5) return 'Xuất sắc';
    if ($avg >= 3.5) return 'Tốt';
    if ($avg >= 2.5) return 'Khá';
    if ($avg >= 1.5) return 'Trung bình';
    return 'Yếu';
}

function compute_payroll(array $p): array {
    $al = $p['allowances'] ?? [];
    $total = ($al['lunch'] ?? 0) + ($al['transport'] ?? 0) + ($al['phone'] ?? 0);
    $p['totalAllowance'] = $total;
    $p['grossSalary']    = $p['baseSalary'] + $total;
    $p['netSalary']      = $p['grossSalary'] - ($p['deductions'] ?? 0);
    return $p;
}
