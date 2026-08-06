<?php
/**
 * api/kpi.php — Quản lý đánh giá KPI
 *
 * GET    /api/kpi                      → Danh sách đánh giá
 * GET    /api/kpi/employee/:empId      → KPI theo nhân viên
 * POST   /api/kpi                      → Tạo đánh giá (manager/admin)
 * PUT    /api/kpi/:id                  → Sửa đánh giá (manager/admin)
 * DELETE /api/kpi/:id                  → Xóa đánh giá (manager/admin)
 */

$user   = require_auth();
$action = $GLOBALS['route_action'];   // 'employee' | null
$id     = $GLOBALS['route_id'];       // numeric id
$sub    = $GLOBALS['route_sub'];      // empId khi action='employee'

// Gắn thông tin nhân viên và reviewer vào review
function populate_kpi(array $r): array {
    $employees = store_read('employees');
    $users     = store_read('users');
    $emp      = store_find_by_id($employees, $r['employeeId']);
    $reviewer = store_find_by_id($users, $r['reviewerId']);
    $r['employee'] = $emp ? ['id'=>$emp['id'],'employeeId'=>$emp['employeeId'],'fullName'=>$emp['fullName'],'department'=>$emp['department']] : null;
    $r['reviewer'] = $reviewer ? ['id'=>$reviewer['id'],'fullName'=>$reviewer['fullName']] : null;
    return $r;
}

// GET /api/kpi/employee/:empId
if ($action === 'employee' && $sub && $method === 'GET') {
    // Nhân viên chỉ xem được KPI của chính mình
    if ($user['role'] === 'employee') {
        $myEmp = store_find_employee_by_user($user['id']);
        if (!$myEmp || (string)$myEmp['id'] !== (string)$sub) {
            json_err('Bạn không có quyền xem KPI của nhân viên này', 403);
        }
    }
    $reviews = array_filter(store_read('kpi'), fn($r) => (string)$r['employeeId'] === (string)$sub);
    $reviews = array_values(array_map('populate_kpi', $reviews));
    usort($reviews, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    json_raw($reviews);
}

// GET /api/kpi
if (!$id && !$action && $method === 'GET') {
    $employeeId = $_GET['employeeId'] ?? '';
    $quarter    = $_GET['quarter'] ?? '';
    $year       = $_GET['year'] ?? '';
    $page       = max(1, (int)($_GET['page'] ?? 1));
    $limit      = max(1, (int)($_GET['limit'] ?? 20));

    $reviews = store_read('kpi');

    // Nhân viên chỉ thấy KPI của chính mình, bất kể employeeId truyền lên là gì
    if ($user['role'] === 'employee') {
        $myEmp = store_find_employee_by_user($user['id']);
        $employeeId = $myEmp ? $myEmp['id'] : -1;
    }

    if ($employeeId) $reviews = array_filter($reviews, fn($r) => (string)$r['employeeId'] === (string)$employeeId);
    if ($quarter)    $reviews = array_filter($reviews, fn($r) => ($r['period']['quarter'] ?? '') === $quarter);
    if ($year)       $reviews = array_filter($reviews, fn($r) => (string)($r['period']['year'] ?? '') === (string)$year);

    $reviews = array_values($reviews);
    usort($reviews, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    $total = count($reviews);
    $slice = array_map('populate_kpi', array_slice($reviews, ($page - 1) * $limit, $limit));

    json_raw(['reviews' => $slice, 'total' => $total, 'page' => $page, 'totalPages' => (int)ceil($total / $limit)]);
}

// POST /api/kpi
if (!$id && !$action && $method === 'POST') {
    require_role($user, ['admin', 'manager']);
    $input = get_input();
    if (empty($input['employeeId'])) json_err('Thiếu employeeId');
    $new = store_insert('kpi', [
        'employeeId' => $input['employeeId'],
        'reviewerId' => $user['id'],
        'period'     => $input['period'] ?? ['quarter' => 'Q1', 'year' => (int)date('Y')],
        'scores'     => $input['scores'] ?? ['attitude' => 3, 'skill' => 3, 'result' => 3],
        'comment'    => $input['comment'] ?? '',
        'createdAt'  => now_iso(),
    ]);
    json_raw(populate_kpi($new), 201);
}

// PUT /api/kpi/:id
if ($id && !$action && $method === 'PUT') {
    require_role($user, ['admin', 'manager']);
    $input = get_input();
    $r     = store_read_one('kpi', $id);
    if (!$r) json_err('Không tìm thấy phiếu đánh giá', 404);
    foreach (['scores', 'comment', 'period'] as $f) {
        if (isset($input[$f])) $r[$f] = $input[$f];
    }
    store_update('kpi', $id, $r);
    json_raw(populate_kpi($r));
}

// DELETE /api/kpi/:id
if ($id && !$action && $method === 'DELETE') {
    require_role($user, ['admin', 'manager']);
    if (!store_delete('kpi', $id)) json_err('Không tìm thấy phiếu đánh giá', 404);
    json_ok(null, 'Đã xóa phiếu đánh giá');
}

json_err('Route hoặc method không hỗ trợ', 405);
