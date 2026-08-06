<?php
require_once __DIR__ . '/helpers/env.php';
load_env(__DIR__ . '/.env');

// ─── Cấu hình JWT ────────────────────────────────────────────────────────────
// Lấy từ file .env (xem .env.example) — không hardcode secret thật trong source code
define('JWT_SECRET',  env('JWT_SECRET', 'hrms_super_secret_change_me'));
define('JWT_EXPIRES', (int)env('JWT_EXPIRES', 7 * 24 * 3600)); // 7 ngày

// ─── Đường dẫn ───────────────────────────────────────────────────────────────
define('UPLOAD_DIR', __DIR__ . '/uploads/avatars/');

// ─── CORS Headers ────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── Load helpers ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/helpers/jwt.php';
require_once __DIR__ . '/data/store.php';

function ensure_ids($data) {
    if (is_array($data)) {
        if (isset($data['id']) && !isset($data['_id'])) {
            $data['_id'] = (string)$data['id'];
        }
        foreach ($data as $k => $v) {
            if (is_array($v)) {
                $data[$k] = ensure_ids($v);
            }
        }
    }
    return $data;
}

// Trả JSON có envelope (dùng cho thông báo đơn giản)
function json_ok($data = null, string $message = 'Thành công', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => true, 'message' => $message, 'data' => ensure_ids($data)], JSON_UNESCAPED_UNICODE);
    exit();
}

// Trả JSON thẳng (không wrap) — dùng khi Frontend expect res.data = object/array trực tiếp
function json_raw($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(ensure_ids($data), JSON_UNESCAPED_UNICODE);
    exit();
}

function json_err(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

// Đọc body JSON từ request AJAX 
function get_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    return json_decode($raw, true) ?? [];
}

// Xác thực JWT từ AJAX request
function require_auth(): array {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$auth) {
        // Một số server PHP truyền qua header này
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }
    if (!$auth || stripos($auth, 'Bearer ') !== 0) {
        json_err('Không có token xác thực', 401);
    }
    $token   = trim(substr($auth, 7));
    $payload = jwt_decode($token, JWT_SECRET);
    if (!$payload) {
        json_err('Token không hợp lệ hoặc đã hết hạn', 401);
    }
    $users = store_read('users');
    $user  = null;
    foreach ($users as $u) {
        if ((string)$u['id'] === (string)$payload['id']) {
            $user = $u;
            break;
        }
    }
    if (!$user || !$user['isActive']) {
        json_err('Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa', 401);
    }
    unset($user['password']);
    return $user;
}

// Kiểm tra quyền 
function require_role(array $user, array $roles): void {
    if (!in_array($user['role'], $roles, true)) {
        json_err('Bạn không có quyền thực hiện thao tác này', 403);
    }
}
