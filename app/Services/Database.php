<?php

class Database
{
    private static $connection;

    public static function connect()
    {
        if (!self::$connection) {
            $config = require __DIR__ . '/../../config/database.php';

            $dsn = "mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4";

            self::$connection = new PDO($dsn, $config['user'], $config['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        }

        return self::$connection;
    }
}
