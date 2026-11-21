<?php
/**
 * ZipperLock contact endpoint for cPanel / PHP hosting.
 * Set CONTACT_TO below (or an env var) and set NEXT_PUBLIC_PHP_CONTACT=1 at build time to show the form.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$CONTACT_TO = getenv('ZL_CONTACT_TO') ?: 'saghajani989@gmail.com';
$FROM       = getenv('ZL_CONTACT_FROM') ?: 'no-reply@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'zipperlock.net');

function out(bool $ok, string $message, int $code = 200): void {
  http_response_code($code);
  echo json_encode(['ok' => $ok, 'message' => $message]);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(false, 'Method not allowed.', 405);

// same-origin check
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== $host) out(false, 'Bad origin.', 403);

// honeypot
if (!empty($_POST['website'])) out(true, 'Thanks! We will reply soon.');

// simple rate limit: 1 message / 60s per IP
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$file = sys_get_temp_dir() . '/zl_contact_' . md5($ip);
if (is_file($file) && time() - (int)@file_get_contents($file) < 60) out(false, 'Please wait a minute before sending another message.', 429);

$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 120) out(false, 'Please enter a valid email address.', 422);
if (mb_strlen($message) < 10 || mb_strlen($message) > 3000) out(false, 'Message must be between 10 and 3000 characters.', 422);

// prevent header injection
$email = str_replace(["\r", "\n"], '', $email);
$body = "From: $email\nIP: $ip\n\n" . $message;
$headers = "From: ZipperLock <$FROM>\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8";

if (@mail($CONTACT_TO, 'ZipperLock contact message', $body, $headers)) {
  @file_put_contents($file, (string)time());
  out(true, 'Thanks! We will reply soon.');
}
out(false, 'The message could not be sent. Please email us directly.', 500);
