<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * ABSOLUTE PATH — no guessing
 */
$databasePath = dirname(__DIR__) . '/config/database.php';

/**
 * Force-load the file
 */
require $databasePath;

/**
 * Verify class existence
 */
if (!class_exists('Database')) {
    die(json_encode([
        'error' => 'Database class NOT loaded AFTER require',
        'checked_path' => $databasePath,
        'file_exists' => file_exists($databasePath),
        'declared_classes' => get_declared_classes()
    ]));
}

/**
 * Try connection
 */
$db = new Database();
$conn = $db->connect();

echo json_encode([
    'success' => true,
    'message' => 'Database connected successfully'
]);
