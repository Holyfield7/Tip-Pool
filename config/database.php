<?php

class Database {
    private $host = "localhost";
    private $db_name = "tip_pool";
    private $username = "root";
    private $password = "";
    private $conn;

    public static function connect() {
        $host = "localhost";
        $db_name = "tip_pool";
        $username = "root";
        $password = "";

        try {
            $conn = new PDO(
                "mysql:host={$host};dbname={$db_name}",
                $username,
                $password
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $e) {
            die(json_encode([
                'error' => $e->getMessage()
            ]));
        }
    }
}
