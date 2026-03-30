#!/bin/bash

# TaskFlow - Run Playwright E2E Tests
# This script runs Playwright tests for your TaskFlow application

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎭 TaskFlow Playwright E2E Tests${NC}"
echo "===================================="
echo ""

# Check if services are running
check_services() {
    local frontend_ok=false
    local backend_ok=false
    
    # Check frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
        frontend_ok=true
        echo -e "${GREEN}✓${NC} Frontend is running (port 5173)"
    else
        echo -e "${YELLOW}⚠${NC} Frontend not running on port 5173"
    fi
    
    # Check backend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/healthcheck | grep -q "200"; then
        backend_ok=true
        echo -e "${GREEN}✓${NC} Backend is running (port 4000)"
    else
        echo -e "${YELLOW}⚠${NC} Backend not running on port 4000"
    fi
    
    echo ""
    
    if [ "$frontend_ok" = true ] && [ "$backend_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

# Main menu
echo "Select test mode:"
echo "  1) Quick Test (Chromium only)"
echo "  2) Full Test (All browsers)"
echo "  3) Headed Mode (See browser)"
echo "  4) Check Services Only"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Running Quick Test (Chromium)...${NC}"
        npx playwright test --project=chromium --reporter=list
        ;;
    2)
        echo ""
        echo -e "${BLUE}Running Full Test (All browsers)...${NC}"
        npx playwright test --reporter=list
        ;;
    3)
        echo ""
        echo -e "${BLUE}Running in Headed Mode (visible browser)...${NC}"
        npx playwright test --project=chromium --headed
        ;;
    4)
        check_services
        exit $?
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All Playwright tests passed!${NC}"
    echo ""
    echo "📊 View HTML report:"
    echo "   npx playwright show-report"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "📊 View HTML report to see details:"
    echo "   npx playwright show-report"
    echo ""
    echo "📹 Check test-results/ folder for screenshots and videos"
    exit 1
fi
