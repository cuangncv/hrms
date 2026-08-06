<?php
/**
 * Đọc file .env (KEY=VALUE, không hỗ trợ nested/export) và nạp vào biến môi trường.
 * Không ghi đè biến môi trường đã có sẵn (ví dụ do server set trước).
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

        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

function env(string $key, $default = null) {
    $value = getenv($key);
    return $value === false ? $default : $value;
}
