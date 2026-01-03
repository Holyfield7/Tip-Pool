# Tip-Pool API Test Script
$BaseUrl = "http://localhost:9000"

function Test-Endpoint {
    param($Method, $Uri, $Body)
    Write-Host "[$Method] $Uri" -ForegroundColor Cyan
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Method $Method -Uri "$BaseUrl/$Uri" -Body ($Body | ConvertTo-Json) -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Method $Method -Uri "$BaseUrl/$Uri"
        }
        $response | ConvertTo-Json -Depth 5 | Write-Host
        return $response
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
             $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
             $reader.ReadToEnd() | Write-Host -ForegroundColor Red
        }
    }
}

Write-Host "--- 1. Check Server Health ---" -ForegroundColor Green
Test-Endpoint "GET" ""

Write-Host "`n--- 2. Create Alice ---" -ForegroundColor Green
$alice = Test-Endpoint "POST" "users" @{ name = "Alice"; email = "alice@example.com" }
$aliceId = $alice.user_id

Write-Host "`n--- 3. Create Bob ---" -ForegroundColor Green
$bob = Test-Endpoint "POST" "users" @{ name = "Bob"; email = "bob@example.com" }
$bobId = $bob.user_id

if (!$aliceId -or !$bobId) {
    Write-Host "`nStop: Could not create users." -ForegroundColor Red
    exit
}

Write-Host "`n--- 4. Credit Alice ($100) ---" -ForegroundColor Green
Test-Endpoint "POST" "wallets/credit" @{ user_id = $aliceId; amount = 100 }

Write-Host "`n--- 5. Alice Tips Bob ($25) ---" -ForegroundColor Green
Test-Endpoint "POST" "tips" @{ from_user_id = $aliceId; to_user_id = $bobId; amount = 25 }

Write-Host "`n--- 6. Check Balances ---" -ForegroundColor Green
Write-Host "Alice (Should be 75):"
Test-Endpoint "GET" "wallets/$aliceId"
Write-Host "Bob (Should be 25):"
Test-Endpoint "GET" "wallets/$bobId"
