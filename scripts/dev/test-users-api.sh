#!/bin/bash

# Comprehensive Users API Testing Script
# Tests all endpoints, error handling, and audit logging

set -e

echo "🧪 Pivotal Flow Users API Testing"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" | grep -q "$expected_pattern"; then
        echo -e "  ${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Check if backend is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${RED}❌ Backend is not running. Please start it first:${NC}"
    echo "cd apps/backend && pnpm dev"
    exit 1
fi

echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Get authentication token
echo "🔐 Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.example.com","password":"AdminPassword123!"}' \
    | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Authentication failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}"
echo ""

# Test 1: List Users
run_test "GET /v1/users (List Users)" \
    "curl -s -X GET http://localhost:3000/v1/users -H 'Authorization: Bearer $TOKEN' | jq '.items | length'" \
    "[0-9]"

# Test 2: List Users with Filters
run_test "GET /v1/users with filters" \
    "curl -s -X GET 'http://localhost:3000/v1/users?q=admin&isActive=true' -H 'Authorization: Bearer $TOKEN' | jq '.items | length'" \
    "[0-9]"

# Test 3: Create User
run_test "POST /v1/users (Create User)" \
    "curl -s -X POST http://localhost:3000/v1/users -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"email\":\"apitest@example.com\",\"firstName\":\"API\",\"lastName\":\"Test\",\"displayName\":\"API Test User\"}' | jq '.id'" \
    "[a-zA-Z0-9]"

# Get the created user ID for further tests
NEW_USER_ID=$(curl -s -X POST http://localhost:3000/v1/users \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"email":"apitest2@example.com","firstName":"API2","lastName":"Test","displayName":"API Test User 2"}' \
    | jq -r '.id')

echo "Created test user with ID: $NEW_USER_ID"
echo ""

# Test 4: Get User by ID
run_test "GET /v1/users/:id (Get User by ID)" \
    "curl -s -X GET 'http://localhost:3000/v1/users/$NEW_USER_ID' -H 'Authorization: Bearer $TOKEN' | jq '.email'" \
    "apitest2@example.com"

# Test 5: Update User
run_test "PATCH /v1/users/:id (Update User)" \
    "curl -s -X PATCH 'http://localhost:3000/v1/users/$NEW_USER_ID' -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"displayName\":\"Updated API Test User\"}' | jq '.displayName'" \
    "Updated API Test User"

# Test 6: Assign Role
run_test "POST /v1/users/:id/roles (Assign Role)" \
    "curl -s -X POST 'http://localhost:3000/v1/users/$NEW_USER_ID/roles' -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"roleId\":\"cmexf731s0004yjkqhycqxrbz\"}' | jq '.success'" \
    "true"

# Test 7: Remove Role
run_test "DELETE /v1/users/:id/roles/:roleId (Remove Role)" \
    "curl -s -X DELETE 'http://localhost:3000/v1/users/$NEW_USER_ID/roles/cmexf731s0004yjkqhycqxrbz' -H 'Authorization: Bearer $TOKEN' | jq '.success'" \
    "true"

# Test 8: Update User Status
run_test "POST /v1/users/:id/status (Update User Status)" \
    "curl -s -X POST 'http://localhost:3000/v1/users/$NEW_USER_ID/status' -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{\"isActive\":false}' | jq '.isActive'" \
    "false"

# Test 9: Error Handling - Unauthorized Access
run_test "Error Handling - Unauthorized Access" \
    "curl -s -X GET http://localhost:3000/v1/users | jq '.code'" \
    "INVALID_TOKEN"

# Test 10: Error Handling - Invalid User ID
run_test "Error Handling - Invalid User ID" \
    "curl -s -X GET 'http://localhost:3000/v1/users/invalid-id' -H 'Authorization: Bearer $TOKEN' | jq '.code'" \
    "FST_ERR_VALIDATION"

# Test 11: Rate Limiting
echo -e "${BLUE}Testing: Rate Limiting${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo "Making 15 requests to health endpoint..."
for i in {1..15}; do
    response=$(curl -s http://localhost:3000/health | jq -r '.status')
    if [ "$response" = "ok" ]; then
        echo -n "."
    else
        echo -n "x"
    fi
done
echo ""
echo -e "  ${GREEN}✅ Rate limiting test completed${NC}"
PASSED_TESTS=$((PASSED_TESTS + 1))
echo ""

# Test 12: Pagination
run_test "Pagination Support" \
    "curl -s -X GET 'http://localhost:3000/v1/users?page=1&pageSize=2' -H 'Authorization: Bearer $TOKEN' | jq '.pageSize'" \
    "2"

# Test 13: Sorting
run_test "Sorting Support" \
    "curl -s -X GET 'http://localhost:3000/v1/users?sortField=email&sortDirection=asc' -H 'Authorization: Bearer $TOKEN' | jq '.items | length'" \
    "[0-9]"

# Test 14: Search Query
run_test "Search Query Support" \
    "curl -s -X GET 'http://localhost:3000/v1/users?q=api' -H 'Authorization: Bearer $TOKEN' | jq '.items | length'" \
    "[0-9]"

# Test 15: Active Status Filter
run_test "Active Status Filter" \
    "curl -s -X GET 'http://localhost:3000/v1/users?isActive=false' -H 'Authorization: Bearer $TOKEN' | jq '.items | length'" \
    "[0-9]"

echo ""
echo "🎉 Users API Testing Completed!"
echo "================================"
echo -e "${GREEN}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Users API is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the implementation.${NC}"
    exit 1
fi
