<?php
/**
 * api/announcements.php — Thông báo nội bộ
 *
 * GET   /api/announcements          → Danh sách (có trạng thái isRead của user hiện tại)
 * POST  /api/announcements          → Tạo thông báo (admin)
 * PATCH /api/announcements/:id/read → Đánh dấu đã đọc
 * DELETE /api/announcements/:id     → Xóa thông báo (admin)
 */

$user   = require_auth();
$action = $GLOBALS['route_action'];
$id     = $GLOBALS['route_id'];

// GET /api/announcements
if (!$id && !$action && $method === 'GET') {
    $anns = store_read('announcements');
    usort($anns, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));

    $users = store_read('users');
    $result = array_map(function ($a) use ($user, $users) {
        $creator = store_find_by_id($users, $a['createdBy']);
        $a['createdByUser'] = $creator ? ['id' => $creator['id'], 'fullName' => $creator['fullName']] : null;
        $a['isRead']        = in_array($user['id'], (array)($a['readBy'] ?? []));
        return $a;
    }, $anns);

    json_raw($result);
}

// POST /api/announcements
if (!$id && !$action && $method === 'POST') {
    require_role($user, ['admin']);
    $input = get_input();
    if (empty($input['title']))   json_err('Thiếu tiêu đề thông báo');
    if (empty($input['content'])) json_err('Thiếu nội dung thông báo');

    $new = store_insert('announcements', [
        'title'     => $input['title'],
        'content'   => $input['content'],
        'createdBy' => $user['id'],
        'readBy'    => [],
        'createdAt' => now_iso(),
    ]);
    json_raw($new, 201);
}

// PATCH /api/announcements/:id/read
if ($id && $action === 'read' && $method === 'PATCH') {
    $a = store_read_one('announcements', $id);
    if (!$a) json_err('Không tìm thấy thông báo', 404);
    $readBy = (array)($a['readBy'] ?? []);
    if (!in_array($user['id'], $readBy)) {
        $readBy[] = $user['id'];
    }
    $a['readBy'] = $readBy;
    store_update('announcements', $id, $a);
    json_ok(null, 'Đã đánh dấu đã đọc');
}

// DELETE /api/announcements/:id
if ($id && !$action && $method === 'DELETE') {
    require_role($user, ['admin']);
    if (!store_delete('announcements', $id)) json_err('Không tìm thấy thông báo', 404);
    json_ok(null, 'Đã xóa thông báo');
}

json_err('Route hoặc method không hỗ trợ', 405);
