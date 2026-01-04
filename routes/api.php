<?php

require_once __DIR__ . '/../app/Services/Database.php';

return [
    'GET /db-test' => function () {
        try {
            $db = Database::connect();
            return ['db' => 'connected'];
        } catch (Throwable $e) {
            return [
                'error' => true,
                'message' => $e->getMessage()
            ];
        }
    }
];
