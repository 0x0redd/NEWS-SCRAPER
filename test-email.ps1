# PowerShell script to test the email API endpoint
# Usage: .\test-email.ps1

param(
    [string]$ApiKey = "8cc6b609b7d8f3df0651ea73ddeb0d9f2c5a06220b9065190a40efc64d0566da",
    [string]$ServerUrl = "http://localhost:3001",
    [string]$Email = "test@example.com"
)

$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = $ApiKey
}

$body = @{
    recipientEmail = $Email
    recipientName = "Test User"
    recipientDateNaissance = "2000-01-01"
    recipientFiliere = "Computer Science"
    recipientCodeMassar = "TEST123"
    recipientUserCode = "CSC-TEST-1234"
} | ConvertTo-Json

Write-Host "Testing email API endpoint..." -ForegroundColor Cyan
Write-Host "Server: $ServerUrl" -ForegroundColor Gray
Write-Host "Email: $Email" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$ServerUrl/api/email/welcome" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop

    Write-Host "Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host ($_.Exception.Message) -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body:" -ForegroundColor Yellow
            Write-Host ($responseBody)
        } catch {
            Write-Host "(Could not read error response body)" -ForegroundColor Yellow
        }
    }
}

