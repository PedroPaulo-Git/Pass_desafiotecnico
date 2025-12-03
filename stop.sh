#!/bin/bash

# Script to stop all services
echo "🛑 Stopping Pass Fleet Management System"
echo ""

# Stop development environment
if docker compose ps -q &> /dev/null; then
    echo "Stopping development environment..."
    docker compose down
fi

# Stop production environment
if docker compose -f docker-compose.prod.yml ps -q &> /dev/null; then
    echo "Stopping production environment..."
    docker compose -f docker-compose.prod.yml down
fi

echo ""
echo "✅ All services stopped!"
echo ""
echo "💾 To remove volumes (database data): docker compose down -v"
