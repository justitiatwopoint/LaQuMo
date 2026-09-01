<?php
// ==============================================================================
// LAQUMO - Admin Management API (api/admin.php)
// Member Moderation, Role Assignment, Manuscript Review & Database Dump
// ==============================================================================

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();
$action = isset($_GET['action']) ? trim($_GET['action']) : 'list_users';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

// 1. LIST ALL USERS
if ($action === 'list_users') {
    if ($pdo) {
        $stmt = $pdo->query("SELECT id, uuid, email, name, institution, role, is_admin, can_publish, status, avatar, orcid, bio, created_at FROM users ORDER BY id DESC");
        $users = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'users' => $users]);
        exit;
    }
    echo json_encode(['status' => 'fallback', 'message' => 'Local mode']);
    exit;
}

// 2. UPDATE USER ROLE OR PERMISSION
if ($action === 'update_user' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $input['user_id'] ?? null;
    $role = $input['role'] ?? null;
    $canPublish = isset($input['can_publish']) ? intval($input['can_publish']) : null;
    $status = $input['status'] ?? null;

    if ($pdo && $userId) {
        if ($role !== null) {
            $stmt = $pdo->prepare("UPDATE users SET role = ?, is_admin = ? WHERE id = ? OR uuid = ?");
            $isAdmin = (strpos($role, 'Admin') !== false) ? 1 : 0;
            $stmt->execute([$role, $isAdmin, $userId, $userId]);
        }
        if ($canPublish !== null) {
            $stmt = $pdo->prepare("UPDATE users SET can_publish = ? WHERE id = ? OR uuid = ?");
            $stmt->execute([$canPublish, $userId, $userId]);
        }
        if ($status !== null) {
            $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ? OR uuid = ?");
            $stmt->execute([$status, $userId, $userId]);
        }

        echo json_encode(['status' => 'success', 'message' => 'Kullanıcı güncellendi.']);
        exit;
    }
    echo json_encode(['status' => 'success']);
    exit;
}

// 3. DATABASE SQL BACKUP DUMP
if ($action === 'backup_db') {
    header('Content-Type: text/plain; charset=UTF-8');
    header('Content-Disposition: attachment; filename="laqumo_db_backup_' . date('Y-m-d_H-i') . '.sql"');
    readfile(__DIR__ . '/../schema.sql');
    exit;
}
