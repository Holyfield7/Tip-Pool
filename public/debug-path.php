<?php
echo json_encode([
    "current_file" => __FILE__,
    "current_dir" => __DIR__,
    "parent_dir" => dirname(__DIR__),
    "config_exists" => file_exists(dirname(__DIR__) . "/config/database.php"),
    "config_path" => dirname(__DIR__) . "/config/database.php"
], JSON_PRETTY_PRINT);
