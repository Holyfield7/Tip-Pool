<?php

require_once __DIR__ . '/../../app/Services/Database.php';

class UserController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * CREATE USER
     * Route: POST /users
     * Body: { "name": "", "email": "" }
     */
    public function create()
    {
        // Read raw JSON input
        $data = json_decode(file_get_contents("php://input"), true);

        // Basic validation
        if (
            !isset($data['name']) || empty(trim($data['name'])) ||
            !isset($data['email']) || empty(trim($data['email']))
        ) {
            http_response_code(400);
            echo json_encode([
                "error" => "Name and email are required"
            ]);
            return;
        }

        $name  = trim($data['name']);
        $email = trim($data['email']);

        try {
            // Start transaction (VERY IMPORTANT)
            $this->db->beginTransaction();

            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (name, email)
                VALUES (?, ?)
            ");
            $stmt->execute([$name, $email]);

            // Get new user ID
            $userId = $this->db->lastInsertId();

            // Create wallet with balance = 0
            $stmt = $this->db->prepare("
                INSERT INTO wallets (user_id, balance)
                VALUES (?, 0)
            ");
            $stmt->execute([$userId]);

            // Commit transaction
            $this->db->commit();

            http_response_code(201);
            echo json_encode([
                "status" => "user_created",
                "user_id" => (int)$userId,
                "wallet_balance" => 0
            ]);
        } catch (Exception $e) {
            // Rollback on failure
            $this->db->rollBack();

            http_response_code(500);
            echo json_encode([
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * LIST USERS
     * Route: GET /users
     */
    public function index()
    {
        try {
            $stmt = $this->db->query("
                SELECT u.id, u.name, u.email, w.balance
                FROM users u
                LEFT JOIN wallets w ON u.id = w.user_id
                ORDER BY u.id DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($users);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "error" => $e->getMessage()
            ]);
        }
    }
}
