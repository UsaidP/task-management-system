#!/bin/bash

# TaskFlow - Automated Production Test Script
# Run this script to verify your deployment is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Base URL
BASE_URL="${BASE_URL:-http://localhost}"

echo "🧪 TaskFlow Production Test Suite"
echo "=================================="
echo ""
echo "Testing: $BASE_URL"
echo ""

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

section() {
    echo ""
    echo "=== $1 ==="
}

# Test 1: Frontend is accessible
section "Frontend Tests"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" 2>/dev/null || echo "000")
if [ "$RESPONSE" == "200" ]; then
    pass "Frontend is accessible (HTTP $RESPONSE)"
else
    fail "Frontend is not accessible (HTTP $RESPONSE)"
fi

# Test 2: Health endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" 2>/dev/null || echo "000")
if [ "$RESPONSE" == "200" ]; then
    pass "Health endpoint is working (HTTP $RESPONSE)"
else
    fail "Health endpoint failed (HTTP $RESPONSE)"
fi

# Test 3: SPA routing (any route should return 200)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/some-random-route" 2>/dev/null || echo "000")
if [ "$RESPONSE" == "200" ]; then
    pass "SPA routing is working (HTTP $RESPONSE)"
else
    warn "SPA routing may not be configured correctly (HTTP $RESPONSE)"
fi

# Test 4: Security headers
section "Security Tests"

HEADERS=$(curl -s -I "$BASE_URL/" 2>/dev/null)
if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    pass "X-Frame-Options header present"
else
    warn "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    pass "X-Content-Type-Options header present"
else
    warn "X-Content-Type-Options header missing"
fi

# Test 5: Backend API health
section "Backend API Tests"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/healthcheck" 2>/dev/null || echo "000")
if [ "$RESPONSE" == "200" ]; then
    pass "Backend health check passed (HTTP $RESPONSE)"
    
    # Get detailed health status
    HEALTH_DATA=$(curl -s "$BASE_URL/api/v1/healthcheck" 2>/dev/null)
    if echo "$HEALTH_DATA" | grep -q "healthy"; then
        pass "Backend reports healthy status"
    else
        warn "Backend health status unclear"
    fi
else
    fail "Backend health check failed (HTTP $RESPONSE)"
fi

# Test 6: API endpoint exists
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/" 2>/dev/null || echo "000")
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "404" ]; then
    pass "API endpoint is responding (HTTP $RESPONSE)"
else
    fail "API endpoint not responding (HTTP $RESPONSE)"
fi

# Test 7: Authentication endpoints
section "Authentication Tests"

# Test registration endpoint exists
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"username":"test","fullname":"Test","email":"test@test.com","password":"Test123!"}' 2>/dev/null || echo "000")
if [ "$RESPONSE" == "201" ] || [ "$RESPONSE" == "400" ] || [ "$RESPONSE" == "409" ]; then
    pass "Registration endpoint is working (HTTP $RESPONSE)"
else
    fail "Registration endpoint failed (HTTP $RESPONSE)"
fi

# Test login endpoint exists
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Test123!"}' 2>/dev/null || echo "000")
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "401" ]; then
    pass "Login endpoint is working (HTTP $RESPONSE)"
else
    fail "Login endpoint failed (HTTP $RESPONSE)"
fi

# Test 8: Response time
section "Performance Tests"

RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/" 2>/dev/null || echo "999")
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "999")
RESPONSE_TIME_MS=${RESPONSE_TIME_MS%.*}

if [ "$RESPONSE_TIME_MS" -lt 500 ]; then
    pass "Homepage response time: ${RESPONSE_TIME_MS}ms (<500ms)"
elif [ "$RESPONSE_TIME_MS" -lt 1000 ]; then
    warn "Homepage response time: ${RESPONSE_TIME_MS}ms (<1000ms)"
else
    fail "Homepage response time: ${RESPONSE_TIME_MS}ms (>1000ms)"
fi

API_RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/v1/healthcheck" 2>/dev/null || echo "999")
API_RESPONSE_TIME_MS=$(echo "$API_RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "999")
API_RESPONSE_TIME_MS=${API_RESPONSE_TIME_MS%.*}

if [ "$API_RESPONSE_TIME_MS" -lt 200 ]; then
    pass "API response time: ${API_RESPONSE_TIME_MS}ms (<200ms)"
elif [ "$API_RESPONSE_TIME_MS" -lt 500 ]; then
    warn "API response time: ${API_RESPONSE_TIME_MS}ms (<500ms)"
else
    fail "API response time: ${API_RESPONSE_TIME_MS}ms (>500ms)"
fi

# Test 9: Docker container health
section "Docker Tests (if running locally)"

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    CONTAINER_STATUS=$(docker-compose ps 2>/dev/null | grep -c "Up" || echo "0")
    if [ "$CONTAINER_STATUS" -gt 0 ]; then
        pass "Docker containers are running ($CONTAINER_STATUS services up)"
    else
        warn "Could not verify Docker container status"
    fi
else
    warn "Docker Compose not available for container checks"
fi

# Summary
section "Test Summary"
echo ""
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Your deployment looks healthy!"
    echo ""
    echo "Next steps:"
    echo "  1. Run full API test suite (see TESTING.md)"
    echo "  2. Configure SSL/TLS for production"
    echo "  3. Set up monitoring and alerting"
    echo "  4. Run load testing"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo ""
    echo "Please check the failures above and review:"
    echo "  - Docker logs: docker-compose logs -f"
    echo "  - Service health: docker-compose ps"
    echo "  - Configuration: docker-compose config"
    exit 1
fi
