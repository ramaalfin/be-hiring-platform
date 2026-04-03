#!/bin/bash

# Test Magic Link Backend Endpoints
# Usage: ./test-magic-link.sh <verification_code>

CODE=$1

if [ -z "$CODE" ]; then
    echo "Usage: ./test-magic-link.sh <verification_code>"
    echo "Example: ./test-magic-link.sh abc123xyz"
    exit 1
fi

API_BASE="http://localhost:5001/api/v1"

echo "========================================="
echo "Testing Magic Register Verify Endpoint"
echo "========================================="
echo ""
echo "Request: GET $API_BASE/auth/magic-register/verify?code=$CODE"
echo ""

curl -v -X GET "$API_BASE/auth/magic-register/verify?code=$CODE" \
  -H "Content-Type: application/json" \
  2>&1 | tee /tmp/magic-register-response.txt

echo ""
echo ""
echo "========================================="
echo "Testing Magic Login Verify Endpoint"
echo "========================================="
echo ""
echo "Request: GET $API_BASE/auth/magic-login/verify?code=$CODE"
echo ""

curl -v -X GET "$API_BASE/auth/magic-login/verify?code=$CODE" \
  -H "Content-Type: application/json" \
  2>&1 | tee /tmp/magic-login-response.txt

echo ""
echo ""
echo "========================================="
echo "Test Complete"
echo "========================================="
echo "Responses saved to:"
echo "  - /tmp/magic-register-response.txt"
echo "  - /tmp/magic-login-response.txt"
