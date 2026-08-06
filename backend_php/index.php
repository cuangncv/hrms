<?php
/**
 * index.php — Central Router
 * Tất cả AJAX request từ Frontend đến /api/* đều qua đây
 * Chạy bằng: php -S localhost:5000 index.php
 */

// Serve file tĩnh (ảnh avatar, v.v.) — trả về false để PHP built-in server tự phục vụ
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (!str_starts_with($uri, '/api')) {
    // Phục vụ file tĩnh (ảnh trong /uploads/...)
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath) && is_file($filePath)) {
        return false;
    }
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Not found']);
    exit();
}

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// PHP chỉ tự parse $_POST/$_FILES cho method POST — request PUT gửi
// multipart/form-data (vd sửa nhân viên kèm ảnh) sẽ không có $_POST nào cả.
// Nên frontend gửi dạng POST kèm field _method để "giả" thành PUT ở đây,
// vừa được PHP parse đúng, vừa vẫn khớp route PUT bên dưới.
if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$path   = substr($uri, 4);              // bỏ '/api'
$path   = trim($path, '/');
$segs   = $path !== '' ? explode('/', $path) : [];

$resource = $segs[0] ?? '';            // auth, employees, leaves, kpi, payroll, announcements, dashboard, users
$seg1     = $segs[1] ?? null;          // keyword hoặc :id
$seg2     = $segs[2] ?? null;          // action (restore/approve/reject/read/permanent) hoặc sub-id

// ─── Từ khoá tĩnh theo resource ───────────────────────────────────────────────
// Ưu tiên từ khoá trước khi coi là :id
$staticKeywords = [
    'employees'     => ['trash', 'export-excel'],
    'payroll'       => ['generate', 'export-excel'],
    'kpi'           => ['employee'],
    'auth'          => ['login', 'me'],
    'dashboard'     => ['stats'],
];

$keywords = $staticKeywords[$resource] ?? [];

if ($seg1 !== null && in_array($seg1, $keywords, true)) {
    // Route: /api/{resource}/{keyword}[/{sub}]
    $GLOBALS['route_action'] = $seg1;   // e.g. 'trash', 'generate', 'employee', 'login', 'me'
    $GLOBALS['route_id']     = null;
    $GLOBALS['route_sub']    = $seg2;   // e.g. empId khi /api/kpi/employee/:empId
} elseif ($seg1 !== null) {
    // Route: /api/{resource}/{id}[/{action}]
    $GLOBALS['route_id']     = $seg1;   // e.g. '5'
    $GLOBALS['route_action'] = $seg2;   // e.g. 'restore', 'approve', 'reject', 'read', 'permanent'
    $GLOBALS['route_sub']    = null;
} else {
    // Route: /api/{resource}
    $GLOBALS['route_action'] = null;
    $GLOBALS['route_id']     = null;
    $GLOBALS['route_sub']    = null;
}

// ─── Dispatch tới file xử lý ─────────────────────────────────────────────────
$apiFile = __DIR__ . "/api/{$resource}.php";
if (!$resource || !file_exists($apiFile)) {
    json_err("Route /api/{$resource} không tồn tại", 404);
}

require $apiFile;
