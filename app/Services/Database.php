<?php

class Database
{
    private static $connection;

    public static function connect()
    {
        if (!self::$connection) {
            $config = require __DIR__ . '/../../config/database.php';

            self::$connection = new PDO($config['dsn'], $config['user'], $config['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        }

        return self::$connection;
    }
}
