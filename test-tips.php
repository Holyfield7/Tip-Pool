<?php

$baseUrl = "http://localhost:8000"; // Adjust if necessary

function callApi($method, $path, $data = null) {
    global $baseUrl;
    $url = $baseUrl . $path;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'data' => json_decode($response, true)];
}

echo "1. Creating Users...\n";
$user1 = callApi('POST', '/users', ['name' => 'Alice', 'email' => 'alice@example.com']);
$user2 = callApi('POST', '/users', ['name' => 'Bob', 'email' => 'bob@example.com']);
print_r($user1);
print_r($user2);

$u1Id = $user1['data']['user_id'];
$u2Id = $user2['data']['user_id'];

echo "\n2. Crediting Alice...\n";
$credit = callApi('POST', '/wallets/credit', ['user_id' => $u1Id, 'amount' => 100]);
print_r($credit);

echo "\n3. Alice tips Bob...\n";
$tip = callApi('POST', '/tips', ['from_user_id' => $u1Id, 'to_user_id' => $u2Id, 'amount' => 10]);
print_r($tip);

echo "\n4. Checking Pending Tips...\n";
$pending = callApi('GET', '/tips/pending');
print_r($pending);

$tipId = $pending['data'][0]['id'] ?? null;

if ($tipId) {
    echo "\n5. Marking Tip as Processed...\n";
    $process = callApi('POST', '/tips/process', ['id' => $tipId]);
    print_r($process);

    echo "\n6. Verifying Pending Tips are empty...\n";
    $pendingAfter = callApi('GET', '/tips/pending');
    print_r($pendingAfter);
} else {
    echo "\nNo pending tips found to process.\n";
}
