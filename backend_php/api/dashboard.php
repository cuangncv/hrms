<?php
/**
 * api/dashboard.php — Thống kê tổng quan
 *
 * GET /api/dashboard/stats → Trả về tất cả số liệu cho Dashboard
 */

$user   = require_auth();
$action = $GLOBALS['route_action']; // 'stats'

if ($action === 'stats' && $method === 'GET') {
    $employees = store_read('employees');
    $leaves    = store_read('leaves');

    $activeEmps = array_filter($employees, fn($e) => !$e['isDeleted']);

    // ─── Số liệu tổng quan ────────────────────────────────────────────────────
    $totalEmployees = count($activeEmps);

    // Nhân viên mới trong tháng này
    $startOfMonth = date('Y-m-01');
    $endOfMonth   = date('Y-m-t');
    $newThisMonth = count(array_filter($activeEmps, function ($e) use ($startOfMonth, $endOfMonth) {
        $d = $e['createdAt'] ?? '';
        return $d >= $startOfMonth && $d <= $endOfMonth . 'T23:59:59';
    }));

    // Đơn đang chờ duyệt
    $pendingLeaves = count(array_filter($leaves, fn($l) => $l['status'] === 'pending'));

    // Đang nghỉ phép hôm nay
    $today = date('Y-m-d');
    $onLeaveToday = count(array_filter($leaves, function ($l) use ($today) {
        return $l['status'] === 'approved'
            && ($l['fromDate'] ?? '') <= $today
            && ($l['toDate']   ?? '') >= $today;
    }));

    // ─── Phân bổ theo phòng ban ───────────────────────────────────────────────
    $deptCount = [];
    foreach ($activeEmps as $e) {
        $dept = $e['department'] ?? 'Khác';
        $deptCount[$dept] = ($deptCount[$dept] ?? 0) + 1;
    }
    arsort($deptCount);
    $departmentStats = array_map(fn($dept, $count) => ['department' => $dept, 'count' => $count],
        array_keys($deptCount), array_values($deptCount));

    // ─── Đơn nghỉ theo 6 tháng gần nhất ─────────────────────────────────────
    $leaveByMonth = [];
    for ($i = 5; $i >= 0; $i--) {
        $ts      = strtotime("-$i months");
        $key     = date('n/Y', $ts);
        $yearM   = date('Y-m', $ts);
        $count   = count(array_filter($leaves, fn($l) => str_starts_with($l['createdAt'] ?? '', $yearM)));
        $leaveByMonth[] = ['month' => $key, 'count' => $count];
    }

    json_raw([
        'totalEmployees'  => $totalEmployees,
        'newThisMonth'    => $newThisMonth,
        'pendingLeaves'   => $pendingLeaves,
        'onLeaveToday'    => $onLeaveToday,
        'departmentStats' => $departmentStats,
        'leaveByMonth'    => $leaveByMonth,
    ]);
}

json_err('Route hoặc method không hỗ trợ', 405);
