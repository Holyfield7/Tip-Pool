<?php
// setup_sqlite.php

$dbFile = __DIR__ . '/database.sqlite';

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Creating users table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )");

    echo "Creating wallets table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    echo "Creating tips table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS tips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status TEXT CHECK(status IN ('pending', 'processed')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
    )");

    echo "Database initialization complete!\n";

    // Add dummy data for the demo
    echo "Adding dummy data...\n";

    // Check if Alice exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['alice@example.com']);
    $alice = $stmt->fetch();

    if (!$alice) {
        $db->exec("INSERT INTO users (name, email) VALUES ('Alice Agent', 'alice@example.com')");
        $aliceId = $db->lastInsertId();
        $db->exec("INSERT INTO wallets (user_id, balance) VALUES ($aliceId, 1000.00)");

        $db->exec("INSERT INTO users (name, email) VALUES ('Bob builder', 'bob@example.com')");
        $bobId = $db->lastInsertId();
        $db->exec("INSERT INTO wallets (user_id, balance) VALUES ($bobId, 50.00)");

        $db->exec("INSERT INTO tips (from_user_id, to_user_id, amount, status) VALUES ($aliceId, $bobId, 15.00, 'processed')");
        $db->exec("INSERT INTO tips (from_user_id, to_user_id, amount, status) VALUES ($aliceId, $bobId, 10.00, 'pending')");

        echo "Dummy data added!\n";
    } else {
        echo "Database already has data, skipping dummy data insertion.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
