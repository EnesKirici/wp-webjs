# WhatsApp API Test Script (PowerShell)
# Kullanim: .\test.ps1

$API_URL = "http://localhost:3000"
$API_KEY = "#"
$PHONE = "#"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WhatsApp API Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/health" -Method Get
    Write-Host "Status: $($response.status)" -ForegroundColor Green
    Write-Host "Ready: $($response.ready)" -ForegroundColor Green
    
    if (-not $response.ready) {
        Write-Host ""
        Write-Host "WhatsApp istemcisi henuz hazir degil!" -ForegroundColor Yellow
        Write-Host "Lutfen QR kodu tarayin ve 'ready: true' olana kadar bekleyin." -ForegroundColor Yellow
        exit
    }
} catch {
    Write-Host "Health check basarisiz: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Sunucu calisiyor mu? npm start ile baslattiniz mi?" -ForegroundColor Red
    exit
}

Write-Host ""

# 2. Mesaj Gonderme
Write-Host "2. Mesaj gonderiliyor..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $API_KEY
}

$body = @{
    phone = $PHONE
    message = "Test Mesajı `nMerhaba Firdez - $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/send" -Method Post -Headers $headers -Body $body
    Write-Host "Mesaj basariyla gonderildi!" -ForegroundColor Green
    Write-Host "  Message ID: $($response.messageId)" -ForegroundColor Gray
    Write-Host "  To: $($response.to)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    
    Write-Host "Mesaj gonderilemedi!" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Hata: $($errorBody.error)" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host ""
        Write-Host "API Key yanlis. .env dosyasindaki API_KEY ile eslesmiyor!" -ForegroundColor Yellow
    } elseif ($statusCode -eq 503) {
        Write-Host ""
        Write-Host "WhatsApp istemcisi henuz hazir degil. Biraz bekleyip tekrar deneyin." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
