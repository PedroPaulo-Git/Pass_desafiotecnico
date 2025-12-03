#!/bin/bash

# Script de verificação da instalação Docker
echo "🔍 Verificando instalação do sistema Docker..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
    else
        echo -e "${RED}❌${NC} $1 - FALTANDO"
        ((ERRORS++))
    fi
}

check_executable() {
    if [ -x "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 (executável)"
    else
        echo -e "${YELLOW}⚠️${NC}  $1 (não executável)"
        ((WARNINGS++))
    fi
}

echo "📦 Arquivos Docker Compose:"
check_file "docker-compose.yml"
check_file "docker-compose.prod.yml"
check_file ".env.docker.example"
echo ""

echo "🚀 Scripts de Inicialização:"
check_executable "start-dev.sh"
check_executable "start-prod.sh"
check_executable "stop.sh"
check_executable "health-check.sh"
echo ""

echo "📖 Documentação:"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "DOCKER.md"
check_file "ARCHITECTURE.md"
check_file "DOCKER_STRUCTURE.md"
check_file "IMPLEMENTATION_SUMMARY.md"
check_file "DOCUMENTATION_INDEX.md"
check_file "CONTEXT.md"
echo ""

echo "🔌 Backend Docker:"
check_file "pass_backend/Dockerfile"
check_file "pass_backend/Dockerfile.dev"
check_file "pass_backend/.dockerignore"
echo ""

echo "🌐 Frontend Docker:"
check_file "pass_frontend/Dockerfile"
check_file "pass_frontend/Dockerfile.dev"
check_file "pass_frontend/.dockerignore"
echo ""

echo "⚙️  Configurações:"
check_file "pass_backend/.env.example"
check_file "pass_frontend/.env.local.example"
check_file "pass_backend/package.json"
check_file "pass_frontend/package.json"
check_file "pass_frontend/next.config.js"
echo ""

echo "🗂️  Estrutura de Pastas:"
if [ -d "pass_backend/src" ]; then
    echo -e "${GREEN}✅${NC} pass_backend/src/"
else
    echo -e "${RED}❌${NC} pass_backend/src/ - FALTANDO"
    ((ERRORS++))
fi

if [ -d "pass_frontend/src" ]; then
    echo -e "${GREEN}✅${NC} pass_frontend/src/"
else
    echo -e "${RED}❌${NC} pass_frontend/src/ - FALTANDO"
    ((ERRORS++))
fi

if [ -d "pass_backend/prisma" ]; then
    echo -e "${GREEN}✅${NC} pass_backend/prisma/"
else
    echo -e "${RED}❌${NC} pass_backend/prisma/ - FALTANDO"
    ((ERRORS++))
fi
echo ""

echo "🔧 Verificando Docker:"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker instalado"
    docker --version
else
    echo -e "${RED}❌${NC} Docker NÃO instalado"
    ((ERRORS++))
fi

if command -v docker compose &> /dev/null || command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅${NC} Docker Compose instalado"
    docker compose version 2>/dev/null || docker-compose --version
else
    echo -e "${RED}❌${NC} Docker Compose NÃO instalado"
    ((ERRORS++))
fi
echo ""

echo "📊 Resumo:"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Instalação PERFEITA!${NC}"
    echo ""
    echo "🎉 Sistema pronto para uso!"
    echo ""
    echo "Próximos passos:"
    echo "1. Execute: ./start-dev.sh"
    echo "2. Acesse: http://localhost:3000"
    echo "3. Leia: QUICKSTART.md"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Instalação OK com avisos${NC}"
    echo "Avisos: $WARNINGS"
    echo ""
    echo "Corrija as permissões:"
    echo "chmod +x *.sh"
else
    echo -e "${RED}❌ Instalação INCOMPLETA${NC}"
    echo "Erros: $ERRORS"
    echo "Avisos: $WARNINGS"
    echo ""
    echo "Verifique os arquivos faltantes acima."
fi
echo "=========================================="
echo ""

if [ $WARNINGS -gt 0 ]; then
    echo "💡 Dica: Execute 'chmod +x *.sh' para corrigir permissões"
    echo ""
fi

exit $ERRORS
