<?php
/**
 * api/payroll.php — Quản lý Phiếu lương
 *
 * GET  /api/payroll               → Danh sách (nhân viên chỉ thấy của mình)
 * POST /api/payroll/generate      → Tạo phiếu lương cho NV chưa có phiếu tháng đó (admin)
 * PUT  /api/payroll/:id           → Sửa phiếu lương (admin)
 * GET  /api/payroll/export-excel  → Xuất CSV (admin)
 */

$user   = require_auth();
$action = $GLOBALS['route_action'];
$id     = $GLOBALS['route_id'];

function populate_payroll(array $p): array {
    $emp = store_find_by_id(store_read('employees'), $p['employeeId']);
    $p['employee'] = $emp ? [
        'id'         => $emp['id'],
        'employeeId' => $emp['employeeId'],
        'fullName'   => $emp['fullName'],
        'department' => $emp['department'],
        'position'   => $emp['position'],
    ] : null;
    return compute_payroll($p);
}

// GET /api/payroll/export-excel → xuất CSV
if ($action === 'export-excel' && $method === 'GET') {
    require_role($user, ['admin']);
    $month = (int)($_GET['month'] ?? date('n'));
    $year  = (int)($_GET['year']  ?? date('Y'));

    $payrolls = array_filter(store_read('payroll'), fn($p) => $p['month'] === $month && $p['year'] === $year);
    $payrolls = array_map('populate_payroll', array_values($payrolls));

    header_remove('Content-Type');
    header('Content-Type: text/csv; charset=UTF-8');
    header("Content-Disposition: attachment; filename=bang_luong_T{$month}_{$year}.csv");
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Mã NV','Họ và tên','Phòng ban','Lương cơ bản','PC Ăn trưa','PC Xăng xe','PC ĐT','Tổng phụ cấp','Gross','Khấu trừ','Thực nhận']);
    foreach ($payrolls as $p) {
        fputcsv($out, [
            $p['employee']['employeeId'] ?? '',
            $p['employee']['fullName']   ?? '',
            $p['employee']['department'] ?? '',
            $p['baseSalary'],
            $p['allowances']['lunch']     ?? 0,
            $p['allowances']['transport'] ?? 0,
            $p['allowances']['phone']     ?? 0,
            $p['totalAllowance'],
            $p['grossSalary'],
            $p['deductions'],
            $p['netSalary'],
        ]);
    }
    fclose($out);
    exit();
}

// POST /api/payroll/generate
if ($action === 'generate' && $method === 'POST') {
    require_role($user, ['admin']);
    $input = get_input();
    $month = (int)($input['month'] ?? 0);
    $year  = (int)($input['year']  ?? 0);
    if (!$month || !$year) json_err('Vui lòng cung cấp tháng và năm');

    $employees = array_filter(store_read('employees'), fn($e) => !$e['isDeleted']);
    $existingEmpIds = array_column(
        array_filter(store_read('payroll'), fn($p) => $p['month'] === $month && $p['year'] === $year),
        'employeeId'
    );

    // Chỉ tạo phiếu cho nhân viên CHƯA có phiếu lương tháng/năm này —
    // không đụng tới phiếu đã tồn tại (kể cả đã bị sửa tay trước đó)
    $db = get_db();
    $db->beginTransaction();
    try {
        $count = 0;
        foreach ($employees as $e) {
            if (in_array($e['id'], $existingEmpIds, true)) continue;
            $deduction = round($e['baseSalary'] * 0.105);
            store_insert('payroll', [
                'employeeId' => $e['id'],
                'month'      => $month,
                'year'       => $year,
                'baseSalary' => $e['baseSalary'],
                'allowances' => $e['allowances'],
                'deductions' => $deduction,
                'createdAt'  => now_iso(),
            ]);
            $count++;
        }
        $db->commit();
    } catch (\Throwable $ex) {
        $db->rollBack();
        json_err('Tạo bảng lương thất bại: ' . $ex->getMessage(), 500);
    }
    json_raw(['message' => "Đã tạo $count phiếu lương mới (giữ nguyên phiếu đã có sẵn)", 'count' => $count], 201);
}

// GET /api/payroll
if (!$id && !$action && $method === 'GET') {
    $month      = $_GET['month'] ?? '';
    $year       = $_GET['year']  ?? '';
    $employeeId = $_GET['employeeId'] ?? '';
    $page       = max(1, (int)($_GET['page'] ?? 1));
    $limit      = max(1, (int)($_GET['limit'] ?? 20));

    $payrolls = store_read('payroll');

    if ($month)      $payrolls = array_filter($payrolls, fn($p) => (string)$p['month'] === (string)$month);
    if ($year)       $payrolls = array_filter($payrolls, fn($p) => (string)$p['year']  === (string)$year);
    if ($employeeId) $payrolls = array_filter($payrolls, fn($p) => (string)$p['employeeId'] === (string)$employeeId);

    // Nhân viên chỉ thấy của mình
    if ($user['role'] === 'employee') {
        $myEmp = store_find_employee_by_user($user['id']);
        $myEmpId = $myEmp ? $myEmp['id'] : -1;
        $payrolls = array_filter($payrolls, fn($p) => (string)$p['employeeId'] === (string)$myEmpId);
    }

    $payrolls = array_values($payrolls);
    usort($payrolls, fn($a, $b) => $b['year'] !== $a['year'] ? $b['year'] - $a['year'] : $b['month'] - $a['month']);
    $total = count($payrolls);
    $slice = array_map('populate_payroll', array_slice($payrolls, ($page - 1) * $limit, $limit));

    json_raw(['payrolls' => $slice, 'total' => $total, 'page' => $page, 'totalPages' => (int)ceil($total / $limit)]);
}

// PUT /api/payroll/:id
if ($id && !$action && $method === 'PUT') {
    require_role($user, ['admin']);
    $input = get_input();
    $p     = store_read_one('payroll', $id);
    if (!$p) json_err('Không tìm thấy phiếu lương', 404);
    foreach (['baseSalary', 'allowances', 'deductions'] as $f) {
        if (isset($input[$f])) $p[$f] = $input[$f];
    }
    store_update('payroll', $id, $p);
    json_raw(populate_payroll($p));
}

json_err('Route hoặc method không hỗ trợ', 405);
