#!/bin/bash

# TaskFlow - Development Testing Script
# Run this to test locally without Docker

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 TaskFlow Development Test Suite"
echo "==================================="
echo ""

# Check if services are running
check_service() {
    local name=$1
    local url=$2
    local timeout=5
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $timeout "$url" 2>/dev/null || echo "000")
    if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "201" ] || [ "$RESPONSE" == "404" ]; then
        echo -e "${GREEN}✓${NC} $name is running (HTTP $RESPONSE)"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not running (HTTP $RESPONSE)"
        return 1
    fi
}

# Test counters
PASSED=0
FAILED=0

section() {
    echo ""
    echo "=== $1 ==="
}

# Check if backend is running
section "Backend Tests (Port 4000)"
if check_service "Backend API" "http://localhost:4000/api/v1/healthcheck"; then
    ((PASSED++))
    
    # Test API response
    HEALTH=$(curl -s http://localhost:4000/api/v1/healthcheck 2>/dev/null)
    if echo "$HEALTH" | grep -q "healthy\|ok\|success"; then
        echo -e "${GREEN}✓${NC} Backend health check passed"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Backend responded but health status unclear"
        ((FAILED++))
    fi
else
    ((FAILED++))
    echo ""
    echo -e "${YELLOW}To start backend:${NC}"
    echo "  cd backend"
    echo "  npm install"
    echo "  npm start"
fi

# Check if frontend is running
section "Frontend Tests (Port 5173)"
if check_service "Frontend Dev Server" "http://localhost:5173"; then
    ((PASSED++))
else
    ((FAILED++))
    echo ""
    echo -e "${YELLOW}To start frontend:${NC}"
    echo "  cd frontend"
    echo "  npm install"
    echo "  npm run dev"
fi

# Test API endpoints
section "API Endpoint Tests"

if curl -s http://localhost:4000/api/v1/healthcheck > /dev/null 2>&1; then
    # Test registration endpoint
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/v1/auth/register \
        -H "Content-Type: application/json" \
        -d '{"username":"testdev","fullname":"Test Dev","email":"test@dev.com","password":"Test123!"}' 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" == "201" ] || [ "$RESPONSE" == "400" ] || [ "$RESPONSE" == "409" ]; then
        echo -e "${GREEN}✓${NC} Registration endpoint working (HTTP $RESPONSE)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Registration endpoint failed (HTTP $RESPONSE)"
        ((FAILED++))
    fi
    
    # Test login endpoint (400/401 is OK - means endpoint works)
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@dev.com","password":"Test123!"}' 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "400" ] || [ "$RESPONSE" == "401" ]; then
        echo -e "${GREEN}✓${NC} Login endpoint working (HTTP $RESPONSE)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Login endpoint failed (HTTP $RESPONSE)"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping API tests (backend not running)"
    ((FAILED++))
fi

# Summary
section "Summary"
echo ""
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Your development environment is ready!"
    echo ""
    echo "Access points:"
    echo "  - Frontend: http://localhost:5173"
    echo "  - Backend API: http://localhost:4000/api/v1"
    echo "  - API Health: http://localhost:4000/api/v1/healthcheck"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo ""
    echo "Make sure both services are running:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  npm start"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend"
    echo "  npm run dev"
    exit 1
fi
