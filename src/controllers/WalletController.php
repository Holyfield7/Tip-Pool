<?php

require_once __DIR__ . '/../../app/Services/Database.php';

class WalletController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * GET BALANCE
     * Route: GET /wallets/{user_id}
     */
    public function balance($userId)
    {
        try {
            $stmt = $this->db->prepare("SELECT user_id, balance FROM wallets WHERE user_id = ?");
            $stmt->execute([$userId]);
            $wallet = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$wallet) {
                http_response_code(404);
                echo json_encode(["error" => "Wallet not found for user ID " . $userId]);
                return;
            }

            echo json_encode([
                "user_id" => (int)$wallet['user_id'],
                "balance" => (float)$wallet['balance']
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    /**
     * CREDIT WALLET
     * Route: POST /wallets/credit
     * Body: { "user_id": 1, "amount": 100 }
     */
    public function credit()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id']) || !isset($data['amount'])) {
            http_response_code(400);
            echo json_encode(["error" => "user_id and amount are required"]);
            return;
        }

        $userId = $data['user_id'];
        $amount = $data['amount'];

        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Amount must be positive"]);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE wallets SET balance = balance + ? WHERE user_id = ?");
            $stmt->execute([$amount, $userId]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["error" => "Wallet not found"]);
                return;
            }

            echo json_encode([
                "status" => "credited",
                "user_id" => $userId,
                "amount_added" => $amount
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    /**
     * TIP USER
     * Route: POST /tips
     * Body: { "from_user_id": 1, "to_user_id": 2, "amount": 10 }
     */
    public function tip()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['from_user_id']) || !isset($data['to_user_id']) || !isset($data['amount'])) {
            http_response_code(400);
            echo json_encode(["error" => "from_user_id, to_user_id, and amount are required"]);
            return;
        }

        $fromId = $data['from_user_id'];
        $toId   = $data['to_user_id'];
        $amount = $data['amount'];

        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Amount must be positive"]);
            return;
        }

        if ($fromId == $toId) {
            http_response_code(400);
            echo json_encode(["error" => "Cannot tip yourself"]);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Check sender balance
            $stmt = $this->db->prepare("SELECT balance FROM wallets WHERE user_id = ? FOR UPDATE");
            $stmt->execute([$fromId]);
            $sender = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$sender) {
                throw new Exception("Sender wallet not found");
            }
            if ($sender['balance'] < $amount) {
                throw new Exception("Insufficient funds");
            }

            // Deduct from sender
            $stmt = $this->db->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ?");
            $stmt->execute([$amount, $fromId]);

            // Add to receiver
            $stmt = $this->db->prepare("UPDATE wallets SET balance = balance + ? WHERE user_id = ?");
            $stmt->execute([$amount, $toId]);

            if ($stmt->rowCount() === 0) {
                throw new Exception("Receiver wallet not found");
            }

            // Record tip
            $stmt = $this->db->prepare("INSERT INTO tips (from_user_id, to_user_id, amount, status) VALUES (?, ?, ?, 'pending')");
            $stmt->execute([$fromId, $toId, $amount]);

            $this->db->commit();

            echo json_encode([
                "status" => "tip_success",
                "from_user_id" => $fromId,
                "to_user_id" => $toId,
                "amount" => $amount
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    /**
     * GET PENDING TIPS
     * Route: GET /tips/pending
     */
    public function pendingTips()
    {
        try {
            $stmt = $this->db->query("SELECT * FROM tips WHERE status = 'pending'");
            $tips = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tips);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    /**
     * MARK TIP AS PROCESSED
     * Route: POST /tips/process
     * Body: { "id": 1 }
     */
    public function markTipProcessed()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "tip id is required"]);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE tips SET status = 'processed' WHERE id = ?");
            $stmt->execute([$data['id']]);

            echo json_encode(["status" => "processed", "id" => $data['id']]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    /**
     * LIST TIPS
     * Route: GET /tips
     */
    public function index()
    {
        try {
            $stmt = $this->db->query("
                SELECT t.*, u1.name as from_name, u2.name as to_name
                FROM tips t
                JOIN users u1 ON t.from_user_id = u1.id
                JOIN users u2 ON t.to_user_id = u2.id
                ORDER BY t.created_at DESC
            ");
            $tips = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tips);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}
