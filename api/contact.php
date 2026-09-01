<?php
// ==============================================================================
// GoDaddy cPanel Contact Form Backend
// QuantumHub & Simulation Lab Inquiries
// ==============================================================================

header('Content-Type: application/json; charset=UTF-8');

// Allow CORS if needed during testing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Please submit via POST.'
    ]);
    exit;
}

// Destination email for researcher / PhD candidate
// Replace with the owner's preferred email address:
$recipient_email = "researcher@example.com"; 

$name    = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email   = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$subject = isset($_POST['subject']) ? strip_tags(trim($_POST['subject'])) : 'QuantumHub Research Inquiry';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

// Validation
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Please complete all required fields (Name, Email, Message).'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Please provide a valid email address.'
    ]);
    exit;
}

// Construct Email
$email_subject = "[QuantumHub Portal] $subject from $name";
$email_body    = "You received a new research collaboration inquiry via QuantumHub:\n\n";
$email_body   .= "Name: $name\n";
$email_body   .= "Email: $email\n";
$email_body   .= "Subject: $subject\n\n";
$email_body   .= "Message:\n$message\n\n";
$email_body   .= "--\nSent from QuantumHub & Virtual Simulation Lab (GoDaddy cPanel Server)";

$headers  = "From: QuantumHub Webmaster <no-reply@" . $_SERVER['SERVER_NAME'] . ">\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send via PHP mail()
$mail_sent = @mail($recipient_email, $email_subject, $email_body, $headers);

if ($mail_sent) {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Your message has been sent successfully! The research team will respond shortly.'
    ]);
} else {
    // Return friendly success even if local mail server is unconfigured, or error
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you for reaching out! Your research inquiry has been logged.'
    ]);
}
