<?php
// Load .env
$env = file(__DIR__ . '/../.env');
foreach ($env as $line) {
    if (trim($line) && !str_starts_with(trim($line), '#')) {
        putenv(trim($line));
    }
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

$routes = require __DIR__ . '/../routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$key = "$method $path";

if (isset($routes[$key])) {
    $response = $routes[$key]();
    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

