# Testing the Email API

## PowerShell Commands

Since PowerShell's `curl` is an alias for `Invoke-WebRequest` with different syntax, use one of these methods:

### Method 1: Using the Test Script

Run the provided PowerShell script:

```powershell
cd server
.\test-email.ps1
```

Or with custom parameters:

```powershell
.\test-email.ps1 -Email "your-email@example.com" -ApiKey "your-api-key"
```

### Method 2: Single-Line PowerShell Command

**Test Email Status:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/email/status" -Headers @{"X-API-Key"="8cc6b609b7d8f3df0651ea73ddeb0d9f2c5a06220b9065190a40efc64d0566da"} -Method Get
```

**Send Test Email:**
```powershell
$headers = @{"Content-Type"="application/json"; "X-API-Key"="8cc6b609b7d8f3df0651ea73ddeb0d9f2c5a06220b9065190a40efc64d0566da"}; $body = '{"recipientEmail":"test@example.com","recipientName":"Test User","recipientDateNaissance":"2000-01-01","recipientFiliere":"Computer Science","recipientCodeMassar":"TEST123","recipientUserCode":"CSC-TEST-1234"}' | ConvertFrom-Json | ConvertTo-Json; Invoke-RestMethod -Uri "http://localhost:3001/api/email/welcome" -Method Post -Headers $headers -Body $body
```

**Multi-line PowerShell (easier to read):**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = "8cc6b609b7d8f3df0651ea73ddeb0d9f2c5a06220b9065190a40efc64d0566da"
}

$body = @{
    recipientEmail = "test@example.com"
    recipientName = "Test User"
    recipientDateNaissance = "2000-01-01"
    recipientFiliere = "Computer Science"
    recipientCodeMassar = "TEST123"
    recipientUserCode = "CSC-TEST-1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/email/welcome" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

### Method 3: Using curl.exe (if available)

If you have `curl.exe` installed (or git bash), you can use:

```bash
curl.exe -X POST http://localhost:3001/api/email/welcome ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: 8cc6b609b7d8f3df0651ea73ddeb0d9f2c5a06220b9065190a40efc64d0566da" ^
  -d "{\"recipientEmail\":\"test@example.com\",\"recipientName\":\"Test User\",\"recipientDateNaissance\":\"2000-01-01\",\"recipientFiliere\":\"Computer Science\",\"recipientCodeMassar\":\"TEST123\",\"recipientUserCode\":\"CSC-TEST-1234\"}"
```

### Method 4: Using Postman or Similar Tools

Import this as a POST request:
- **URL:** `http://localhost:3001/api/email/welcome`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-Key: 8cc6b609b7d8f3df0651ea73ddeb0d9f2c5a06220b9065190a40efc64d0566da`
- **Body (JSON):**
```json
{
  "recipientEmail": "test@example.com",
  "recipientName": "Test User",
  "recipientDateNaissance": "2000-01-01",
  "recipientFiliere": "Computer Science",
  "recipientCodeMassar": "TEST123",
  "recipientUserCode": "CSC-TEST-1234"
}
```

