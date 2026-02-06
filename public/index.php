<?php
// ===============================
// Basic API bootstrap
// ===============================
ob_start(); // Start output buffering to catch BOMs

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../src/controllers/UserController.php';
require_once __DIR__ . '/../src/controllers/WalletController.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($path, '/');

if ($method === 'OPTIONS') {
    exit(0);
}

$routeKey = "$method /$uri";

// ===============================
// DB TEST
// ===============================
if ($method === 'GET' && $uri === 'db-test') {
    try {
        require_once __DIR__ . '/../app/Services/Database.php';
        $db = Database::connect();
        echo json_encode(['db' => 'connected']);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

// ===============================
// Root health check
// ===============================
if ($uri === '') {
    echo json_encode(["status" => "Tip Pool API is alive"]);
    exit;
}

// ===============================
// ROUTES
// ===============================

// ---- USERS ----
if ($method === 'POST' && $uri === 'users') {
    (new UserController())->create();
    exit;
}

if ($method === 'GET' && $uri === 'users') {
    (new UserController())->index();
    exit;
}

// ---- WALLETS ----
if ($method === 'GET' && preg_match('#^wallets/(\d+)$#', $uri, $matches)) {
    $userId = (int)$matches[1];
    (new WalletController())->balance($userId);
    exit;
}

if ($method === 'POST' && $uri === 'wallets/credit') {
    (new WalletController())->credit();
    exit;
}

// ---- TIPS ----
if ($method === 'POST' && $uri === 'tips') {
    (new WalletController())->tip();
    exit;
}

if ($method === 'GET' && $uri === 'tips') {
    (new WalletController())->index();
    exit;
}

if ($method === 'GET' && $uri === 'tips/pending') {
    (new WalletController())->pendingTips();
    exit;
}

if ($method === 'POST' && $uri === 'tips/process') {
    (new WalletController())->markTipProcessed();
    exit;
}

// ===============================
// 404 fallback
// ===============================
http_response_code(404);
echo json_encode([
    "error" => "Route not found",
    "method" => $method,
    "uri" => "/" . $uri
]);
exit;
