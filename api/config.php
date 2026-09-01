<?php
// ==============================================================================
// LAQUMO - MySQL Database Configuration (api/config.php)
// GoDaddy cPanel MySQL Settings
// ==============================================================================

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'laqumo_quantum_db');
define('DB_USER', 'laqumo_admin');
define('DB_PASS', 'Quantum2026Secure!');
define('DB_CHARSET', 'utf8mb4');

// JWT / Session Secret Key
define('JWT_SECRET', 'laqumo_quantum_super_secure_secret_key_2026');
define('OTP_EXPIRY_MINUTES', 15);
define('SESSION_EXPIRY_DAYS', 7);
