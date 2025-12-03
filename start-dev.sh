#!/bin/bash

# Script to start the development environment
echo "🚀 Starting Pass Fleet Management System (Development Mode)"
echo ""

# Check if docker compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Kill processes and stop containers using our ports
echo "🔍 Freeing ports (3000, 3333, 5432, 9000, 9001)..."

# Function to stop containers using specific ports
stop_containers_on_ports() {
    local ports=("3000" "3333" "5432" "9000" "9001")
    
    for port in "${ports[@]}"; do
        # Find containers using this port
        containers=$(sudo docker ps --format '{{.ID}} {{.Ports}}' | grep ":${port}->" | awk '{print $1}')
        
        if [ ! -z "$containers" ]; then
            echo "  ⚠️  Stopping containers using port ${port}..."
            echo "$containers" | xargs -r sudo docker stop
        fi
    done
}

# Stop containers on our ports
stop_containers_on_ports

# Kill any remaining processes on ports
sudo lsof -ti:3000 | xargs -r sudo kill -9 2>/dev/null || true
sudo lsof -ti:3333 | xargs -r sudo kill -9 2>/dev/null || true
sudo lsof -ti:5432 | xargs -r sudo kill -9 2>/dev/null || true
sudo lsof -ti:9000 | xargs -r sudo kill -9 2>/dev/null || true
sudo lsof -ti:9001 | xargs -r sudo kill -9 2>/dev/null || true

# Stop any running containers from this project
echo "🛑 Stopping Pass containers..."
sudo docker compose down 2>/dev/null || true

# Build and start services
echo "🏗️  Building and starting services..."
sudo docker compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
sudo  docker compose ps

# Show logs hint
echo ""
echo "✅ Services are starting!"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop all: docker compose down"
echo "  - Restart: docker compose restart"
echo ""
echo "🌐 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3333"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "  - PostgreSQL: localhost:5432 (pass_user/pass_password)"
echo ""
echo "🔍 To view logs: docker compose logs -f [service-name]"
echo "   Services: backend, frontend, postgres, minio"
