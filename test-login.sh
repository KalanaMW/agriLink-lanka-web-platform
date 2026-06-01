#!/bin/bash

echo "Testing AgriLink API Login Endpoint"
echo "===================================="
echo ""

echo "Testing with Admin credentials..."
curl -s -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrilink.lk","password":"admin123"}' | jq '.'

echo ""
echo ""
echo "Testing with Farmer credentials..."
curl -s -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@agrilink.lk","password":"farmer123"}' | jq '.'

echo ""
echo ""
echo "Testing with Exporter credentials..."
curl -s -X POST http://localhost:5189/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"exporter@keells.com","password":"exporter123"}' | jq '.'
