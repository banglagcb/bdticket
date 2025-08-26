#!/bin/bash

# Get login token
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' https://d0cd9a40514a4114b7186230a28d0dba-cc332001-5971-4ef2-a7d6-6cc101.fly.dev/api/auth/login)

echo "Login Response: $LOGIN_RESPONSE"

# Extract token using basic string manipulation (more compatible)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Extracted Token: ${TOKEN:0:50}..."

if [ -z "$TOKEN" ]; then
    echo "Failed to extract token"
    exit 1
fi

echo "Testing /api/tickets/dashboard/stats..."
curl -X GET -H "Authorization: Bearer $TOKEN" https://d0cd9a40514a4114b7186230a28d0dba-cc332001-5971-4ef2-a7d6-6cc101.fly.dev/api/tickets/dashboard/stats

echo -e "\n\nTesting /api/bookings..."
curl -X GET -H "Authorization: Bearer $TOKEN" https://d0cd9a40514a4114b7186230a28d0dba-cc332001-5971-4ef2-a7d6-6cc101.fly.dev/api/bookings
