<?php

return [
    'dsn' => getenv('DB_DSN') ?: 'sqlite:' . __DIR__ . '/../database.sqlite',
    'user' => getenv('DB_USER') ?: 'root',
    'pass' => getenv('DB_PASS') ?: '',
];
