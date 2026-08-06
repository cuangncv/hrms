<?php
/**
 * api/leaves.php — Quản lý Đơn xin nghỉ phép
 *
 * GET    /api/leaves                → Danh sách (nhân viên thấy đơn của mình)
 * POST   /api/leaves                → Tạo đơn
 * PATCH  /api/leaves/:id/approve   → Duyệt đơn (manager/admin)
 * PATCH  /api/leaves/:id/reject    → Từ chối đơn (manager/admin)
 * DELETE /api/leaves/:id           → Xóa đơn (chỉ khi pending)
 */

$user   = require_auth();
$action = $GLOBALS['route_action'];
$id     = $GLOBALS['route_id'];

// Gắn thêm thông tin nhân viên vào mỗi đơn
function populate_leave(array $leave): array {
    $employees = store_read('employees');
    $users     = store_read('users');
    $emp = store_find_by_id($employees, $leave['employeeId']);
    if ($emp) {
        $leave['employee'] = [
            'id'         => $emp['id'],
            'employeeId' => $emp['employeeId'],
            'fullName'   => $emp['fullName'],
            'department' => $emp['department'],
        ];
    }
    if ($leave['reviewedBy']) {
        $reviewer = store_find_by_id($users, $leave['reviewedBy']);
        $leave['reviewer'] = $reviewer ? ['id' => $reviewer['id'], 'fullName' => $reviewer['fullName']] : null;
    }
    // Số ngày nghỉ (tính cả ngày đầu và ngày cuối)
    $from = strtotime($leave['fromDate']);
    $to   = strtotime($leave['toDate']);
    $leave['days'] = ($from !== false && $to !== false) ? (int)round(($to - $from) / 86400) + 1 : null;
    return $leave;
}

// GET /api/leaves
if (!$id && !$action && $method === 'GET') {
    $status     = $_GET['status'] ?? '';
    $employeeId = $_GET['employeeId'] ?? '';
    $page       = max(1, (int)($_GET['page'] ?? 1));
    $limit      = max(1, (int)($_GET['limit'] ?? 20));

    $leaves = store_read('leaves');

    // Nhân viên chỉ thấy đơn của mình; admin/manager lọc theo employeeId nếu có truyền
    if ($user['role'] === 'employee') {
        $myEmp = store_find_employee_by_user($user['id']);
        $leaves = $myEmp
            ? array_filter($leaves, fn($l) => (string)$l['employeeId'] === (string)$myEmp['id'])
            : [];
    } elseif ($employeeId) {
        $leaves = array_filter($leaves, fn($l) => (string)$l['employeeId'] === (string)$employeeId);
    }

    if ($status) $leaves = array_filter($leaves, fn($l) => $l['status'] === $status);

    $leaves = array_values($leaves);
    usort($leaves, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    $total = count($leaves);
    $slice = array_map('populate_leave', array_slice($leaves, ($page - 1) * $limit, $limit));

    json_raw(['leaves' => $slice, 'total' => $total, 'page' => $page, 'totalPages' => (int)ceil($total / $limit)]);
}

// POST /api/leaves
if (!$id && !$action && $method === 'POST') {
    $input = get_input();

    // Nhân viên chỉ được tạo đơn cho chính mình — bỏ qua employeeId client gửi lên (nếu có)
    if ($user['role'] === 'employee') {
        $myEmp = store_find_employee_by_user($user['id']);
        if (!$myEmp) json_err('Tài khoản này chưa gắn với hồ sơ nhân viên nào', 403);
        $employeeId = $myEmp['id'];
    } else {
        if (empty($input['employeeId'])) json_err('Thiếu employeeId');
        $employeeId = $input['employeeId'];
    }

    if (empty($input['fromDate']))   json_err('Thiếu fromDate');
    if (empty($input['toDate']))     json_err('Thiếu toDate');

    $new = store_insert('leaves', [
        'employeeId' => $employeeId,
        'leaveType'  => $input['leaveType'] ?? 'annual',
        'fromDate'   => $input['fromDate'],
        'toDate'     => $input['toDate'],
        'reason'     => $input['reason'] ?? '',
        'status'     => 'pending',
        'reviewedBy' => null,
        'reviewNote' => '',
        'createdAt'  => now_iso(),
    ]);
    json_raw($new, 201);
}

// PATCH /api/leaves/:id/approve
if ($id && $action === 'approve' && $method === 'PATCH') {
    require_role($user, ['admin', 'manager']);
    $input = get_input();
    $l     = store_read_one('leaves', $id);
    if (!$l) json_err('Không tìm thấy đơn', 404);
    $l['status']     = 'approved';
    $l['reviewedBy'] = $user['id'];
    $l['reviewNote'] = $input['reviewNote'] ?? '';
    store_update('leaves', $id, $l);
    json_raw(populate_leave($l));
}

// PATCH /api/leaves/:id/reject
if ($id && $action === 'reject' && $method === 'PATCH') {
    require_role($user, ['admin', 'manager']);
    $input = get_input();
    $l     = store_read_one('leaves', $id);
    if (!$l) json_err('Không tìm thấy đơn', 404);
    $l['status']     = 'rejected';
    $l['reviewedBy'] = $user['id'];
    $l['reviewNote'] = $input['reviewNote'] ?? '';
    store_update('leaves', $id, $l);
    json_raw(populate_leave($l));
}

// DELETE /api/leaves/:id
if ($id && !$action && $method === 'DELETE') {
    $leave = store_read_one('leaves', $id);
    if (!$leave) json_err('Không tìm thấy đơn', 404);

    // Employee chỉ được xóa đơn của chính mình; admin/manager xóa được mọi đơn
    if ($user['role'] === 'employee') {
        $myEmp = store_find_employee_by_user($user['id']);
        if (!$myEmp || (string)$leave['employeeId'] !== (string)$myEmp['id']) {
            json_err('Bạn không có quyền xóa đơn này', 403);
        }
    }

    if ($leave['status'] !== 'pending') json_err('Chỉ xóa được đơn đang chờ duyệt');
    store_delete('leaves', $id);
    json_ok(null, 'Đã xóa đơn');
}

json_err('Route hoặc method không hỗ trợ', 405);
