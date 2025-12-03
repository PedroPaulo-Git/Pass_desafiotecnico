# 🐳 Docker - Guia Completo

## Início Rápido

```bash
# 1. Dar permissão (primeira vez)
chmod +x start-dev.sh stop.sh

# 2. Iniciar tudo
./start-dev.sh

# Pronto! Acesse:
# http://localhost:3000 - Frontend
# http://localhost:3333 - Backend API
# http://localhost:9001 - MinIO Console
```

## O que está rodando?

```
PostgreSQL   → Banco de dados (porta 5432)
MinIO        → Storage de arquivos (porta 9000/9001)
Backend      → API REST (porta 3333)
Frontend     → Interface Web (porta 3000)
```

## Comandos Úteis

### Iniciar/Parar

```bash
# Desenvolvimento (hot reload)
./start-dev.sh

# Produção (otimizado)
./start-prod.sh

# Parar tudo
./stop.sh
# ou
docker compose down

# Parar e limpar dados
docker compose down -v
```

### Ver Logs

```bash
# Todos os serviços
docker compose logs -f

# Apenas backend
docker compose logs -f backend

# Apenas frontend
docker compose logs -f frontend

# Últimas 100 linhas
docker compose logs --tail=100 -f backend
```

### Status e Debug

```bash
# Ver status
docker compose ps

# Recursos (CPU, RAM)
docker stats

# Reiniciar serviço
docker compose restart backend

# Executar comando no container
docker compose exec backend sh
docker compose exec backend npx prisma studio
```

## Variáveis de Ambiente

Já estão configuradas no `docker-compose.yml`:

**Backend**:
- `DATABASE_URL`: postgresql://pass_user:pass_password@postgres:5432/pass_db
- `PORT`: 3333
- `MINIO_ENDPOINT`: minio

**Frontend**:
- `NEXT_PUBLIC_API_URL`: http://localhost:3333

## Credenciais (Desenvolvimento)

| Serviço | Usuário | Senha |
|---------|---------|-------|
| PostgreSQL | pass_user | pass_password |
| MinIO | minioadmin | minioadmin123 |

⚠️ **Alterar para produção!**

## Estrutura Docker

```
docker-compose.yml              # Desenvolvimento
docker-compose.prod.yml         # Produção
├── pass_backend/
│   ├── Dockerfile              # Build produção
│   └── Dockerfile.dev          # Build desenvolvimento
└── pass_frontend/
    ├── Dockerfile              # Build produção
    └── Dockerfile.dev          # Build desenvolvimento
```

## Diferenças Dev vs Prod

| Item | Desenvolvimento | Produção |
|------|----------------|----------|
| Build | Dockerfile.dev | Dockerfile |
| Comando | npm run dev | npm start |
| Hot Reload | ✅ Sim | ❌ Não |
| Volumes | ✅ Código montado | ❌ Sem volumes |
| NODE_ENV | development | production |

## Troubleshooting

### Porta ocupada

```bash
# Ver o que está na porta
sudo lsof -i :3000

# Parar tudo
docker compose down
```

### Limpar tudo e recomeçar

```bash
# Parar containers
docker compose down

# Remover volumes (APAGA DADOS!)
docker compose down -v

# Remover imagens
docker compose down --rmi all

# Rebuild completo
docker compose up --build --force-recreate
```

### Backend não conecta no banco

```bash
# Ver logs do postgres
docker compose logs postgres

# Verificar se está saudável
docker compose ps

# Reiniciar apenas backend
docker compose restart backend
```

### Erros de permissão

```bash
# Scripts
chmod +x start-dev.sh stop.sh

# Volumes (se necessário)
sudo chown -R $USER:$USER .
```

## Arquitetura

```
Docker Network: pass-network (bridge)
├── postgres (healthcheck)
│   └── Volume: postgres_data
├── minio (healthcheck)
│   └── Volume: minio_data
├── backend (depends_on: postgres, minio)
│   └── Aplica migrations no start
└── frontend (depends_on: backend)
```

**Fluxo de inicialização**:
1. PostgreSQL inicia → healthcheck (pg_isready)
2. MinIO inicia → healthcheck (curl /minio/health/live)
3. Backend aguarda postgres/minio → aplica migrations → inicia API
4. Frontend aguarda backend → inicia Next.js

## Docker Compose Avançado

### Apenas infraestrutura

```bash
docker compose up postgres minio -d
# Rode backend/frontend localmente
```

### Build paralelo

```bash
docker compose build --parallel
```

### Forçar rebuild

```bash
docker compose build --no-cache
```

### Ver logs de erro

```bash
docker compose logs --tail=50 backend | grep -i error
```

### Entrar no container

```bash
# Backend
docker compose exec backend sh
node -v
npm -v

# Frontend
docker compose exec frontend sh
```

## Performance

### Cache Docker

O Docker usa cache de layers. Se mudar código:
```bash
docker compose up --build backend
```

Se mudar dependências (package.json):
```bash
docker compose build --no-cache backend
```

### Limpar espaço

```bash
# Ver uso
docker system df

# Limpar containers parados
docker container prune

# Limpar imagens não usadas
docker image prune -a

# Limpar tudo (cuidado!)
docker system prune -a --volumes
```

## Produção

### Build otimizado

```bash
./start-prod.sh
```

Isso usa:
- Multi-stage builds
- `npm ci --only=production`
- Sem volumes de código
- NODE_ENV=production

### Deploy

```bash
# Build
docker compose -f docker-compose.prod.yml build

# Subir
docker compose -f docker-compose.prod.yml up -d

# Verificar
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

## Volumes

### Listar

```bash
docker volume ls
```

### Inspecionar

```bash
docker volume inspect pass_desafiotecnico_postgres_data
```

### Backup

```bash
# Exportar dados postgres
docker compose exec postgres pg_dump -U pass_user pass_db > backup.sql

# Importar
docker compose exec -T postgres psql -U pass_user pass_db < backup.sql
```

## Network

### Inspecionar

```bash
docker network inspect pass_desafiotecnico_pass-network
```

### Testar conectividade

```bash
# Do backend para postgres
docker compose exec backend nc -zv postgres 5432

# Do backend para minio
docker compose exec backend nc -zv minio 9000
```

## Customização

### Alterar portas

```yaml
# docker-compose.yml
backend:
  ports:
    - "3334:3333"  # Host:Container
```

### Adicionar serviço

```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
  networks:
    - pass-network
```

### Variáveis personalizadas

```yaml
backend:
  environment:
    - CUSTOM_VAR=value
```

## Próximos Passos

1. **Criar bucket no MinIO**
   - Acesse http://localhost:9001
   - Login: minioadmin / minioadmin123
   - Crie bucket: `pass-vehicles`

2. **Testar API**
   ```bash
   curl http://localhost:3333/vehicles
   ```

3. **Acessar Frontend**
   - http://localhost:3000

4. **Ver documentação**
   - [CONTEXT.md](./CONTEXT.md) - Como funciona
   - [QUICKSTART.md](./QUICKSTART.md) - Início rápido
   - [README.md](./README.md) - Guia completo
