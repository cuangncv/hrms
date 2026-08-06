<?php
/**
 * api/users.php — Quản lý tài khoản người dùng (Admin only)
 *
 * GET    /api/users      → Danh sách tài khoản
 * POST   /api/users      → Tạo tài khoản
 * PUT    /api/users/:id  → Cập nhật tài khoản
 * DELETE /api/users/:id  → Xóa tài khoản
 */

$user   = require_auth();
require_role($user, ['admin']); // Toàn bộ route này chỉ Admin

$action = $GLOBALS['route_action'];
$id     = $GLOBALS['route_id'];

// GET /api/users
if (!$id && !$action && $method === 'GET') {
    $users = store_read('users');
    usort($users, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    // Ẩn password
    $result = array_map(function ($u) {
        unset($u['password']);
        return $u;
    }, $users);
    json_raw($result);
}

// POST /api/users
if (!$id && !$action && $method === 'POST') {
    $input    = get_input();
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $fullName = trim($input['fullName'] ?? '');
    $role     = $input['role'] ?? 'employee';

    if (!$username || !$password || !$fullName) {
        json_err('Vui lòng điền đầy đủ username, password và họ tên');
    }

    $users = store_read('users');
    // Kiểm tra trùng username
    foreach ($users as $u) {
        if ($u['username'] === $username) json_err('Username đã tồn tại', 409);
    }

    $new = store_insert('users', [
        'username'  => $username,
        'password'  => password_hash($password, PASSWORD_BCRYPT),
        'fullName'  => $fullName,
        'role'      => $role,
        'isActive'  => true,
        'createdAt' => now_iso(),
    ]);

    $output = $new;
    unset($output['password']);
    json_raw($output, 201);
}

// PUT /api/users/:id
if ($id && !$action && $method === 'PUT') {
    $input = get_input();
    $u     = store_read_one('users', $id);
    if (!$u) json_err('Không tìm thấy tài khoản', 404);
    if (isset($input['fullName']))  $u['fullName'] = $input['fullName'];
    if (isset($input['role']))      $u['role']     = $input['role'];
    if (isset($input['isActive']))  $u['isActive'] = (bool)$input['isActive'];
    if (!empty($input['password'])) $u['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
    store_update('users', $id, $u);
    unset($u['password']);
    json_raw($u);
}

// DELETE /api/users/:id
if ($id && !$action && $method === 'DELETE') {
    if ((string)$id === (string)$user['id']) {
        json_err('Không thể tự xóa tài khoản của mình');
    }
    if (!store_delete('users', $id)) json_err('Không tìm thấy tài khoản', 404);
    json_ok(null, 'Đã xóa tài khoản');
}

json_err('Route hoặc method không hỗ trợ', 405);
