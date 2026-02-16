#!/bin/bash

echo "🧪 Testing AgriLink API Login Endpoints"
echo "========================================"
echo ""

# Test Admin
echo "1️⃣  Testing Admin Login (admin@agrilink.lk / admin123)..."
response=$(curl -s -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrilink.lk","password":"admin123"}')

if echo "$response" | grep -q '"token"'; then
  echo "✅ Admin login SUCCESS!"
  echo "Response: $response" | head -c 200
  echo "..."
else
  echo "❌ Admin login FAILED!"
  echo "Response: $response"
fi

echo ""
echo ""

# Test Farmer
echo "2️⃣  Testing Farmer Login (farmer@agrilink.lk / farmer123)..."
response=$(curl -s -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@agrilink.lk","password":"farmer123"}')

if echo "$response" | grep -q '"token"'; then
  echo "✅ Farmer login SUCCESS!"
  echo "Response: $response" | head -c 200
  echo "..."
else
  echo "❌ Farmer login FAILED!"
  echo "Response: $response"
fi

echo ""
echo ""

# Test Exporter
echo "3️⃣  Testing Exporter Login (exporter@keells.com / exporter123)..."
response=$(curl -s -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"exporter@keells.com","password":"exporter123"}')

if echo "$response" | grep -q '"token"'; then
  echo "✅ Exporter login SUCCESS!"
  echo "Response: $response" | head -c 200
  echo "..."
else
  echo "❌ Exporter login FAILED!"
  echo "Response: $response"
fi

echo ""
echo ""
echo "========================================="
echo "✨ Test Complete!"
echo ""
echo "If all tests passed, you can now login at:"
echo "http://localhost:3001/login"
