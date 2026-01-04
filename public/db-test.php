<?php

header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

try {
    $db = getDBConnection();
    echo json_encode(["db" => "connected"]);
} catch (Exception $e) {
    echo json_encode([
        "db" => "failed",
        "error" => $e->getMessage()
    ]);
}
