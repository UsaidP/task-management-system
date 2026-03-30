#!/bin/bash

# TaskFlow - Quick Start Script
# This script helps you set up and run TaskFlow with Docker

set -e

echo "🚀 TaskFlow - Docker Quick Start"
echo "================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please update the .env file with your configuration before continuing."
    echo "   Required variables:"
    echo "   - JWT_SECRET"
    echo "   - REFRESH_TOKEN_SECRET"
    echo "   - HASH_PEPPER"
    echo "   - MONGO_PASSWORD"
    echo "   - IMAGEKIT_PUBLIC_KEY"
    echo "   - IMAGEKIT_PRIVATE_KEY"
    echo "   - IMAGEKIT_URL_ENDPOINT"
    echo "   - MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Generate secure secrets if not set
if [ "$(grep -c '^JWT_SECRET=your-super-secret' .env)" -gt 0 ]; then
    echo "🔐 Generating secure JWT secrets..."
    sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -base64 32)|g" .env
    sed -i.bak "s|^REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)|g" .env
    sed -i.bak "s|^HASH_PEPPER=.*|HASH_PEPPER=$(openssl rand -base64 32)|g" .env
    rm -f .env.bak
    echo "✅ Secrets generated"
    echo ""
fi

echo "📦 Building Docker images..."
if docker compose version &> /dev/null; then
    docker compose build
else
    docker-compose build
fi

echo ""
echo "🚀 Starting services..."
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo ""
echo "✅ TaskFlow is now running!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost/api/v1"
echo "   - Health Check: http://localhost/health"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose logs -f"
echo "   - Stop services: docker compose down"
echo "   - Restart services: docker compose restart"
echo ""
echo "📖 For more information, see DOCKER.md"
