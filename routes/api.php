<?php

require_once __DIR__ . '/../app/Services/Database.php';
require_once __DIR__ . '/../src/controllers/UserController.php';
require_once __DIR__ . '/../src/controllers/WalletController.php';

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
    },
    'GET /tips' => function () {
        // Placeholder: return pending tips
        return ['tips' => []];
    },
    'POST /users' => function () {
        (new UserController())->create();
    },
    'GET /wallets/:id' => function ($id) {
        (new WalletController())->getBalance($id);
    },
    'POST /wallets/credit' => function () {
        (new WalletController())->credit();
    },
    'POST /tips' => function () {
        // Placeholder for sending tip
        echo json_encode(['status' => 'tip sent']);
    }
];
