#!/bin/bash

# WhatsApp API Test Script (Bash)
# Kullanım: chmod +x test.sh && ./test.sh

API_URL="http://localhost:3000"
API_KEY="whatsapp_web_ms_security_key345569!*!/!"  # .env dosyasındaki API_KEY ile aynı olmalı
PHONE="905538602004"  # Test için kendi numaranızı yazın

echo ""
echo "========================================"
echo "WhatsApp API Test Script"
echo "========================================"
echo ""

# 1. Health Check
echo "1. Health Check..."
HEALTH=$(curl -s "$API_URL/api/health")
READY=$(echo $HEALTH | grep -o '"ready":[^,}]*' | cut -d':' -f2)

if [ "$READY" = "true" ]; then
    echo "✓ WhatsApp istemcisi hazır"
else
    echo "✗ WhatsApp istemcisi hazır değil!"
    echo "Lütfen QR kodu tarayın ve 'ready: true' olana kadar bekleyin."
    exit 1
fi

echo ""

# 2. Mesaj Gönderme
echo "2. Mesaj gönderiliyor..."

TIMESTAMP=$(date +%H:%M:%S)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/send" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"phone\": \"$PHONE\", \"message\": \"Test mesajı - $TIMESTAMP\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Mesaj başarıyla gönderildi!"
    echo "$BODY" | grep -o '"messageId":"[^"]*' | cut -d'"' -f4 | sed 's/^/  Message ID: /'
    echo "$BODY" | grep -o '"to":"[^"]*' | cut -d'"' -f4 | sed 's/^/  To: /'
else
    echo "✗ Mesaj gönderilemedi! (HTTP $HTTP_CODE)"
    echo "$BODY" | grep -o '"error":"[^"]*' | cut -d'"' -f4 | sed 's/^/  Hata: /'
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo ""
        echo "💡 API Key yanlış. .env dosyasındaki API_KEY ile eşleşiyor mu?"
    elif [ "$HTTP_CODE" = "503" ]; then
        echo ""
        echo "💡 WhatsApp istemcisi henüz hazır değil. Biraz bekleyip tekrar deneyin."
    fi
fi

echo ""
echo "========================================"
echo ""

