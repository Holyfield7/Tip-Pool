<?php

return [
    'dsn' => getenv('DB_DSN') ?: 'sqlite:' . __DIR__ . '/../database.sqlite',
    'user' => null,
    'pass' => null,
];
