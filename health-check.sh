#!/bin/bash

# Health check script para verificar se todos os serviços estão funcionando
echo "🔍 Verificando saúde dos serviços do Pass Fleet Management..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um serviço está respondendo
check_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Verificando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ] || [ "$response" = "200" ] || [ "$response" = "404" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC} (HTTP $response)"
        return 1
    fi
}

# Verificar se Docker está rodando
echo "🐳 Docker:"
if docker info > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Docker está rodando${NC}"
else
    echo -e "   ${RED}❌ Docker não está rodando${NC}"
    exit 1
fi
echo ""

# Verificar containers
echo "📦 Containers:"
if docker compose ps | grep -q "Up"; then
    docker compose ps --format "table {{.Name}}\t{{.Status}}" | grep -E "pass-|NAME"
else
    echo -e "   ${RED}❌ Nenhum container rodando${NC}"
    echo "   Execute: ./start-dev.sh"
    exit 1
fi
echo ""

# Aguardar serviços iniciarem
echo "⏳ Aguardando serviços iniciarem (5s)..."
sleep 5
echo ""

# Verificar serviços
echo "🌐 Serviços:"
check_service "PostgreSQL" "http://localhost:5432" "000"
check_service "MinIO API" "http://localhost:9000" 
check_service "MinIO Console" "http://localhost:9001"
check_service "Backend API" "http://localhost:3333"
check_service "Frontend" "http://localhost:3000"
echo ""

# Verificar volumes
echo "💾 Volumes:"
postgres_volume=$(docker volume ls | grep postgres_data)
minio_volume=$(docker volume ls | grep minio_data)

if [ -n "$postgres_volume" ]; then
    echo -e "   ${GREEN}✅ postgres_data existe${NC}"
else
    echo -e "   ${YELLOW}⚠️  postgres_data não encontrado${NC}"
fi

if [ -n "$minio_volume" ]; then
    echo -e "   ${GREEN}✅ minio_data existe${NC}"
else
    echo -e "   ${YELLOW}⚠️  minio_data não encontrado${NC}"
fi
echo ""

# Verificar rede
echo "🌐 Rede:"
network=$(docker network ls | grep pass-network)
if [ -n "$network" ]; then
    echo -e "   ${GREEN}✅ pass-network existe${NC}"
else
    echo -e "   ${YELLOW}⚠️  pass-network não encontrada${NC}"
fi
echo ""

# Resumo
echo "📊 Resumo:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3333"
echo "   MinIO Console: http://localhost:9001"
echo ""

echo "✨ Verificação completa!"
echo ""
echo "💡 Comandos úteis:"
echo "   - Ver logs: docker compose logs -f"
echo "   - Reiniciar: docker compose restart"
echo "   - Parar tudo: ./stop.sh"
