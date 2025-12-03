#!/bin/bash

# Script to start the production environment
echo "🚀 Starting Pass Fleet Management System (Production Mode)"
echo ""

# Check if docker compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Stop any running containers
echo "🛑 Stopping any existing containers..."
docker compose -f docker-compose.prod.yml down

# Build and start services
echo "🏗️  Building and starting services..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.prod.yml ps

# Show logs hint
echo ""
echo "✅ Services are running in production mode!"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  - Stop all: docker compose -f docker-compose.prod.yml down"
echo "  - Restart: docker compose -f docker-compose.prod.yml restart"
echo ""
echo "🌐 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3333"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "  - PostgreSQL: localhost:5432 (pass_user/pass_password)"
