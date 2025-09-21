#!/bin/bash
# Login to get session
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login-opaque \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pivotalflow.com","password":"admin123"}')

echo "Login response: $(echo $LOGIN_RESPONSE | jq -r '.success // "failed"')"

# Extract session ID
SESSION_ID=$(echo $LOGIN_RESPONSE | jq -r '.sessionId')

if [ "$SESSION_ID" != "null" ] && [ "$SESSION_ID" != "" ]; then
  echo "Session ID: ${SESSION_ID:0:20}..."
  
  # Test rate-cards with session cookie
  echo "Testing rate-cards endpoint:"
  curl -s http://localhost:3000/api/v1/rate-cards?page=1&limit=25 \
    -H "Cookie: pf-session=$SESSION_ID" | jq -r '.error // "success"'
else
  echo "Failed to get session ID"
fi
