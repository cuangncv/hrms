<?php
/**
 * JWT thuần PHP — không dùng thư viện bên ngoài
 * Dùng HMAC-SHA256 + Base64Url encoding (RFC 7515)
 */

function _b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function _b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret): string {
    $header  = _b64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = _b64url_encode(json_encode($payload));
    $sig     = _b64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    return "$header.$payload.$sig";
}

function jwt_decode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $sig] = $parts;

    // Xác minh chữ ký
    $expectedSig = _b64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($expectedSig, $sig)) return null;

    // Giải mã payload
    $data = json_decode(_b64url_decode($payload), true);
    if (!$data) return null;

    // Kiểm tra hạn token
    if (isset($data['exp']) && $data['exp'] < time()) return null;

    return $data;
}
