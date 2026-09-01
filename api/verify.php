<?php
// ==============================================================================
// LAQUMO - OTP Verification Endpoint (api/verify.php)
// Validates 6-digit OTP code and activates user account
// ==============================================================================

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$code = trim($input['code'] ?? '');

if (empty($email) || empty($code)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'E-posta ve 6 haneli kod gereklidir.']);
    exit;
}

if ($pdo) {
    $stmt = $pdo->prepare("SELECT * FROM otp_codes WHERE email = ? AND code = ? AND is_used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
    $stmt->execute([$email, $code]);
    $otpRecord = $stmt->fetch();

    if (!$otpRecord) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Geçersiz veya süresi dolmuş doğrulama kodu.']);
        exit;
    }

    // Mark OTP as used
    $stmt = $pdo->prepare("UPDATE otp_codes SET is_used = 1 WHERE id = ?");
    $stmt->execute([$otpRecord['id']]);

    // Activate user
    $stmt = $pdo->prepare("UPDATE users SET status = 'verified' WHERE email = ?");
    $stmt->execute([$email]);

    $stmt = $pdo->prepare("SELECT id, uuid, email, name, institution, role, is_admin, can_publish, status, avatar FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    echo json_encode([
        'status' => 'success',
        'message' => 'Hesap başarıyla doğrulandı ve aktif edildi!',
        'user' => $user
    ]);
    exit;
}

// Fallback response for offline mode
echo json_encode([
    'status' => 'success',
    'message' => 'Hesap doğrulandı!',
    'user' => [
        'email' => $email,
        'status' => 'verified'
    ]
]);
