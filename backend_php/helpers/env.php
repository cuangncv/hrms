<?php
/**
 * Đọc file .env (KEY=VALUE, không hỗ trợ nested/export) và nạp vào $GLOBALS['__env'].
 * Cố tình không dùng putenv()/getenv() để nạp — nhiều shared hosting (InfinityFree...)
 * disable 2 hàm này vì lý do bảo mật (tránh 1 site ảnh hưởng biến môi trường site khác
 * dùng chung server), khiến việc nạp .env âm thầm thất bại mà không báo lỗi gì.
 */

function load_env(string $path): void {
    if (!is_file($path)) return;

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;

        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);
        if (strlen($value) >= 2 && $value[0] === $value[-1] && in_array($value[0], ['"', "'"], true)) {
            $value = substr($value, 1, -1);
        }

        if (!isset($GLOBALS['__env'][$key])) {
            $GLOBALS['__env'][$key] = $value;
        }
    }
}

function env(string $key, $default = null) {
    if (isset($GLOBALS['__env'][$key])) return $GLOBALS['__env'][$key];
    $value = getenv($key);
    return $value === false ? $default : $value;
}
