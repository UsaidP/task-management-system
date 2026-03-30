#!/bin/bash

# TaskFlow - Start Development Environment
# This script starts both backend and frontend for local development

set -e

echo "🚀 TaskFlow Development Server"
echo "==============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root"
    echo "   cd /Volumes/E/Projects/task-management-system"
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

echo "📋 Checking ports..."

# Check backend port
if check_port 4000; then
    echo "✓ Backend already running on port 4000"
else
    echo "⚠ Backend not running on port 4000"
fi

# Check frontend port
if check_port 5173; then
    echo "✓ Frontend already running on port 5173"
else
    echo "⚠ Frontend not running on port 5173"
fi

echo ""
echo "Instructions:"
echo ""
echo "1. Open Terminal 1 for Backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. Open Terminal 2 for Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. After both are running, test with:"
echo "   ./test-dev.sh"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:4000/api/v1"
echo "   - API Health: http://localhost:4000/api/v1/healthcheck"
echo ""

# Optional: Auto-start in background (uncomment to enable)
# echo "Starting services in background..."
# cd backend && npm start > ../logs/backend.log 2>&1 &
# cd frontend && npm run dev > ../logs/frontend.log 2>&1 &
# echo "✅ Services started!"
# echo "View logs with: tail -f logs/backend.log"
