Write-Host "🚀 Starting Pass Fleet Management System (PostgreSQL Version)"
Write-Host ""

# Check if Docker is available
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed or not in PATH"
    exit 1
}

# Stop any running containers from this project
Write-Host "🛑 Stopping Pass containers..."
docker compose -f docker-compose.postgres.yml down 2>$null
docker compose -f docker-compose.mysql.yml down 2>$null # Cleanup old one
docker compose down 2>$null

# Build and start services
Write-Host "🏗️  Building and starting services with PostgreSQL..."
docker compose -f docker-compose.postgres.yml up --build -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be ready..."
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:"
docker compose -f docker-compose.postgres.yml ps

# Show logs hint
Write-Host ""
Write-Host "✅ Services are starting!"
Write-Host ""
Write-Host "📝 Useful commands:"
Write-Host "  - View logs: docker compose -f docker-compose.postgres.yml logs -f"
Write-Host "  - Stop all: docker compose -f docker-compose.postgres.yml down"
Write-Host "  - Restart: docker compose -f docker-compose.postgres.yml restart"
Write-Host ""
Write-Host "🌐 Services:"
Write-Host "  - Frontend: http://localhost:3000"
Write-Host "  - Backend API: http://localhost:3333"
Write-Host "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
Write-Host "  - Postgres: localhost:5432 (pass_user/pass_password)"
Write-Host ""
Write-Host '🔍 To view logs: docker compose -f docker-compose.postgres.yml logs -f [service-name]'
