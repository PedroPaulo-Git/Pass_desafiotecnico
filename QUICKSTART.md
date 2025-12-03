# 🚀 Quick Start Guide - Pass Fleet Management

## Opção 1: Docker (Recomendado) - 2 comandos

```bash
# 1. Dar permissão (apenas primeira vez)
chmod +x start-dev.sh stop.sh

# 2. Iniciar tudo
./start-dev.sh
```

**Pronto!** Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3333
- MinIO: http://localhost:9001

## Opção 2: Manual

```bash
# Terminal 1: Infraestrutura
docker compose up postgres minio -d

# Terminal 2: Backend
cd pass_backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Terminal 3: Frontend
cd pass_frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Parar Tudo

```bash
./stop.sh
# ou
docker compose down
```

## Comandos Úteis

```bash
# Ver logs
docker compose logs -f backend

# Limpar volumes
docker compose down -v

# Rebuild
docker compose up --build

# Executar migrations
docker compose exec backend npx prisma migrate dev

# Prisma Studio
docker compose exec backend npx prisma studio
```

---

📖 Documentação completa: [README.md](./README.md)
