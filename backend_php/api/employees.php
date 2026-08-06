<?php
/**
 * api/employees.php — Quản lý Nhân sự
 *
 * GET    /api/employees                → Danh sách (search, filter, paginate)
 * GET    /api/employees/trash          → Thùng rác
 * GET    /api/employees/export-excel   → Xuất CSV
 * GET    /api/employees/:id            → Chi tiết
 * POST   /api/employees                → Thêm mới (có upload avatar, tự tạo tài khoản đăng nhập)
 * PUT    /api/employees/:id            → Cập nhật (có upload avatar)
 * DELETE /api/employees/:id            → Soft delete
 * PATCH  /api/employees/:id/restore    → Khôi phục
 * DELETE /api/employees/:id/permanent  → Xóa vĩnh viễn
 */

$user = require_auth();
$action = $GLOBALS['route_action'];
$id = $GLOBALS['route_id'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function emp_gen_id(array $employees): string
{
    $existing = array_filter(array_column($employees, 'employeeId'));
    $max = 0;
    foreach ($existing as $eid) {
        if (preg_match('/^NV(\d+)$/', $eid, $m)) {
            $max = max($max, (int) $m[1]);
        }
    }
    return 'NV' . str_pad($max + 1, 4, '0', STR_PAD_LEFT);
}

function handle_avatar_upload(): ?string
{
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK)
        return null;
    $file = $_FILES['avatar'];
    if ($file['size'] > 5 * 1024 * 1024) {
        json_err('Ảnh không được vượt quá 5MB');
    }

    // Không tin Content-Type hay đuôi file do client gửi lên (dễ giả mạo) —
    // đọc thẳng nội dung file để xác nhận đây thực sự là ảnh, và tự chọn đuôi file.
    $info = @getimagesize($file['tmp_name']);
    if ($info === false) {
        json_err('File tải lên không phải là ảnh hợp lệ');
    }
    $allowedExt = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG  => 'png',
        IMAGETYPE_GIF  => 'gif',
        IMAGETYPE_WEBP => 'webp',
    ];
    if (!isset($allowedExt[$info[2]])) {
        json_err('Chỉ cho phép ảnh định dạng JPG, PNG, GIF hoặc WEBP');
    }
    $ext = $allowedExt[$info[2]];

    if (!is_dir(UPLOAD_DIR))
        mkdir(UPLOAD_DIR, 0777, true);
    $filename = 'avatar_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
    move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $filename);
    return '/uploads/avatars/' . $filename;
}

// ─── Xuất CSV ─────────────────────────────────────────────────────────────────
if ($action === 'export-excel' && $method === 'GET') {
    $emps = array_filter(store_read('employees'), fn($e) => !$e['isDeleted']);
    usort($emps, fn($a, $b) => strcmp($a['employeeId'], $b['employeeId']));

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename=danh_sach_nhan_vien.csv');
    header('Content-Type: application/json; charset=UTF-8', true); // ghi đè sau
    // Thực ra phải ghi đúng Content-Type CSV trước
    header_remove('Content-Type');
    header('Content-Type: text/csv; charset=UTF-8');

    $out = fopen('php://output', 'w');
    // BOM UTF-8 để Excel mở đúng tiếng Việt
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Mã NV', 'Họ và tên', 'Email', 'SĐT', 'Phòng ban', 'Chức vụ', 'Loại HĐ', 'Lương cơ bản', 'Ngày vào làm']);
    foreach ($emps as $e) {
        fputcsv($out, [
            $e['employeeId'],
            $e['fullName'],
            $e['email'],
            $e['phone'],
            $e['department'],
            $e['position'],
            $e['contractType'],
            $e['baseSalary'],
            $e['startDate'] ? date('d/m/Y', strtotime($e['startDate'])) : '',
        ]);
    }
    fclose($out);
    exit();
}

// ─── Thùng rác ────────────────────────────────────────────────────────────────
if ($action === 'trash' && $method === 'GET') {
    require_role($user, ['admin']);
    $trash = array_values(array_filter(store_read('employees'), fn($e) => $e['isDeleted']));
    usort($trash, fn($a, $b) => strcmp($b['deletedAt'] ?? '', $a['deletedAt'] ?? ''));
    json_raw($trash);
}

// ─── Khôi phục /:id/restore ───────────────────────────────────────────────────
if ($id && $action === 'restore' && $method === 'PATCH') {
    require_role($user, ['admin']);
    $emp = store_read_one('employees', $id);
    if (!$emp)
        json_err('Không tìm thấy nhân viên', 404);
    $emp['isDeleted'] = false;
    $emp['deletedAt'] = null;
    store_update('employees', $id, $emp);
    json_raw(['message' => 'Đã khôi phục nhân viên']);
}

// ─── Xóa vĩnh viễn /:id/permanent ────────────────────────────────────────────
if ($id && $action === 'permanent' && $method === 'DELETE') {
    require_role($user, ['admin']);
    $emp = store_read_one('employees', $id);
    if (!$emp)
        json_err('Không tìm thấy nhân viên', 404);
    store_delete('employees', $id);
    // Xóa luôn tài khoản đăng nhập gắn với nhân viên này (nếu có) — tránh còn
    // sót tài khoản "mồ côi" trong Quản lý User sau khi đã xóa vĩnh viễn hồ sơ
    if (!empty($emp['userId'])) {
        store_delete('users', $emp['userId']);
    }
    json_ok(null, 'Đã xóa vĩnh viễn nhân viên');
}

// ─── Danh sách nhân viên (GET /) ──────────────────────────────────────────────
if (!$id && !$action && $method === 'GET') {
    require_role($user, ['admin', 'manager']);
    $search = strtolower($_GET['search'] ?? '');
    $department = $_GET['department'] ?? '';
    $contractType = $_GET['contractType'] ?? '';
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = max(1, (int) ($_GET['limit'] ?? 10));
    $sortField = $_GET['sortField'] ?? 'createdAt';
    $sortOrder = $_GET['sortOrder'] ?? 'desc';

    $employees = array_filter(store_read('employees'), fn($e) => !$e['isDeleted']);

    // Lọc
    if ($search) {
        $employees = array_filter($employees, function ($e) use ($search) {
            return str_contains(strtolower($e['fullName'] ?? ''), $search)
                || str_contains(strtolower($e['email'] ?? ''), $search)
                || str_contains(strtolower($e['employeeId'] ?? ''), $search);
        });
    }
    if ($department)
        $employees = array_filter($employees, fn($e) => $e['department'] === $department);
    if ($contractType)
        $employees = array_filter($employees, fn($e) => $e['contractType'] === $contractType);

    $employees = array_values($employees);
    $total = count($employees);

    // Sắp xếp
    usort($employees, function ($a, $b) use ($sortField, $sortOrder) {
        $va = $a[$sortField] ?? '';
        $vb = $b[$sortField] ?? '';
        $cmp = strcmp((string) $va, (string) $vb);
        return $sortOrder === 'asc' ? $cmp : -$cmp;
    });

    // Phân trang
    $totalPages = (int) ceil($total / $limit);
    $slice = array_slice($employees, ($page - 1) * $limit, $limit);

    json_raw(['employees' => $slice, 'total' => $total, 'page' => $page, 'totalPages' => $totalPages]);
}

// ─── Chi tiết nhân viên (GET /:id) ───────────────────────────────────────────
if ($id && !$action && $method === 'GET') {
    require_role($user, ['admin', 'manager']);
    $emp = store_find_by_id(store_read('employees'), $id);
    if (!$emp)
        json_err('Không tìm thấy nhân viên', 404);
    json_raw($emp);
}

// ─── Thêm nhân viên (POST /) ─────────────────────────────────────────────────
if (!$id && !$action && $method === 'POST') {
    require_role($user, ['admin']);

    // Lấy dữ liệu từ FormData hoặc JSON
    $data = !empty($_POST) ? $_POST : get_input();
    if (isset($data['allowances']) && is_string($data['allowances'])) {
        $data['allowances'] = json_decode($data['allowances'], true);
    }
    if (!isset($data['allowances'])) {
        $data['allowances'] = ['lunch' => 0, 'transport' => 0, 'phone' => 0];
    }

    if (empty($data['fullName']))
        json_err('Họ tên không được để trống');
    if (empty($data['email']))
        json_err('Email không được để trống');
    if (empty($data['username']))
        json_err('Tên đăng nhập không được để trống');
    if (empty($data['password']))
        json_err('Mật khẩu không được để trống');

    $employees = store_read('employees');
    // Check trùng email
    foreach ($employees as $e) {
        if (!$e['isDeleted'] && strtolower($e['email']) === strtolower($data['email'])) {
            json_err('Email đã tồn tại', 409);
        }
    }

    $users = store_read('users');
    // Check trùng username
    foreach ($users as $u) {
        if ($u['username'] === $data['username']) {
            json_err('Tên đăng nhập đã tồn tại', 409);
        }
    }

    $avatarPath = handle_avatar_upload();

    // Tạo tài khoản đăng nhập cho nhân viên mới (đặt sau khi mọi validation đã qua)
    $newUser = store_insert('users', [
        'username'  => $data['username'],
        'password'  => password_hash($data['password'], PASSWORD_BCRYPT),
        'fullName'  => $data['fullName'],
        'role'      => 'employee',
        'isActive'  => true,
        'createdAt' => now_iso(),
    ]);

    $newEmp = store_insert('employees', [
        'employeeId' => emp_gen_id($employees),
        'fullName' => $data['fullName'],
        'email' => strtolower($data['email']),
        'phone' => $data['phone'] ?? '',
        'birthday' => $data['birthday'] ?? null,
        'gender' => $data['gender'] ?? 'other',
        'avatar' => $avatarPath ?? '',
        'department' => $data['department'] ?? 'Khác',
        'position' => $data['position'] ?? 'Nhân viên',
        'contractType' => $data['contractType'] ?? 'official',
        'baseSalary' => (int) ($data['baseSalary'] ?? 0),
        'allowances' => [
            'lunch' => (int) ($data['allowances']['lunch'] ?? 0),
            'transport' => (int) ($data['allowances']['transport'] ?? 0),
            'phone' => (int) ($data['allowances']['phone'] ?? 0),
        ],
        'startDate' => $data['startDate'] ?? null,
        'userId' => $newUser['id'],
        'isDeleted' => false,
        'deletedAt' => null,
        'createdAt' => now_iso(),
    ]);
    json_raw($newEmp, 201);
}

// ─── Cập nhật nhân viên (PUT /:id) ───────────────────────────────────────────
if ($id && !$action && $method === 'PUT') {
    require_role($user, ['admin']);

    $data = !empty($_POST) ? $_POST : get_input();
    if (isset($data['allowances']) && is_string($data['allowances'])) {
        $data['allowances'] = json_decode($data['allowances'], true);
    }

    $e = store_read_one('employees', $id);
    if (!$e)
        json_err('Không tìm thấy nhân viên', 404);

    $avatarPath = handle_avatar_upload();
    if ($avatarPath)
        $e['avatar'] = $avatarPath;

    $fields = ['fullName', 'email', 'phone', 'birthday', 'gender', 'department', 'position', 'contractType', 'baseSalary', 'startDate', 'userId'];
    foreach ($fields as $f) {
        if (isset($data[$f]))
            $e[$f] = $data[$f];
    }
    if (isset($data['allowances'])) {
        $e['allowances'] = [
            'lunch' => (int) ($data['allowances']['lunch'] ?? $e['allowances']['lunch']),
            'transport' => (int) ($data['allowances']['transport'] ?? $e['allowances']['transport']),
            'phone' => (int) ($data['allowances']['phone'] ?? $e['allowances']['phone']),
        ];
    }

    store_update('employees', $id, $e);
    json_raw($e);
}

// ─── Soft delete (DELETE /:id) ────────────────────────────────────────────────
if ($id && !$action && $method === 'DELETE') {
    require_role($user, ['admin']);
    $e = store_read_one('employees', $id);
    if (!$e)
        json_err('Không tìm thấy nhân viên', 404);
    $e['isDeleted'] = true;
    $e['deletedAt'] = now_iso();
    store_update('employees', $id, $e);
    json_ok(['emp' => $e], 'Đã chuyển vào thùng rác');
}

json_err('Route hoặc method không hỗ trợ', 405);
