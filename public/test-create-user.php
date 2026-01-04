<?php
$data = [
    "name" => "Holyfield",
    "email" => "holyfield@test.com"
];

$options = [
    "http" => [
        "header"  => "Content-Type: application/json",
        "method"  => "POST",
        "content" => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents("http://localhost:9000/users", false, $context);

echo $response;
