<?php
/**
 * api/auth.php
 * POST /api/auth/login  — Đăng nhập
 * GET  /api/auth/me     — Lấy thông tin user hiện tại
 */

$action = $GLOBALS['route_action'];

// POST /api/auth/login
if ($action === 'login' && $method === 'POST') {
    $input    = get_input();
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$username || !$password) {
        json_err('Vui lòng nhập username và password');
    }

    $users = store_read('users');
    $user  = null;
    foreach ($users as $u) {
        if ($u['username'] === $username && $u['isActive']) {
            $user = $u;
            break;
        }
    }

    if (!$user || !password_verify($password, $user['password'])) {
        json_err('Sai tài khoản hoặc mật khẩu', 401);
    }

    $token = jwt_encode([
        'id'  => $user['id'],
        'exp' => time() + JWT_EXPIRES,
    ], JWT_SECRET);

    // Trả về đúng format mà Frontend expect: res.data.token, res.data.user
    http_response_code(200);
    echo json_encode([
        'token' => $token,
        'user'  => [
            '_id'      => $user['id'],
            'username' => $user['username'],
            'fullName' => $user['fullName'],
            'role'     => $user['role'],
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/auth/me
if ($action === 'me' && $method === 'GET') {
    $user = require_auth();
    // Trả thẳng user object — Frontend đọc res.data._id, res.data.role...
    http_response_code(200);
    echo json_encode([
        '_id'      => $user['id'],
        'username' => $user['username'],
        'fullName' => $user['fullName'],
        'role'     => $user['role'],
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

json_err('Method không hỗ trợ', 405);
