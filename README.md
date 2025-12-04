# Pass - Sistema de Gestão de Frota 🚗

Monorepo contendo backend (Fastify + Prisma) e frontend (Next.js) para gerenciamento de frota de veículos.

## ⚡ Início Rápido no Windows (Sem Docker)

**Para usuários Windows que preferem rodar localmente sem Docker:**

### Passo 1: Certifique-se que PostgreSQL está rodando

**Opção A - PostgreSQL local (nativo):**
```powershell
# Se você tem PostgreSQL instalado no Windows, certifique-se que está rodando
# Verifique em Services ou abra pgAdmin
```

**Opção B - Apenas infraestrutura no Docker:**
```powershell
# Use Docker apenas para PostgreSQL e MinIO (infraestrutura)
docker compose up postgres minio -d
```

### Passo 2: Execute o script de automação

```powershell
.\run-dev.ps1
```

### Executar projeto compilado (Windows)

Se você já compilou o backend e o frontend (build de produção) e quer executar os artefatos compilados localmente no Windows, use o script `run.ps1`. Esse script inicia o backend e o frontend em modo de produção executando `npm run start` em novas janelas do PowerShell.

Exemplo de uso:

```powershell
# A partir da raiz do repositório: compile cada workspace primeiro
cd pass_backend
npm install
npm run build

cd ..\pass_frontend
npm install
npm run build

# Volte para a raiz do repositório e execute os servidores compilados
cd ..
.\run.ps1
```

Observações:
- O `run.ps1` destina-se a executar os servidores já compilados (produção) usando `npm run start`.
- Para desenvolvimento com hot-reload, continue usando o `run-dev.ps1`.


**🎯 O script `run-dev.ps1` automatiza TUDO:**
- ✅ Instala dependências (`npm install`) nos 3 pacotes (schemas, backend, frontend)
- ✅ Compila o `pass_schemas` (TypeScript → dist/)
- ✅ Copia arquivos `.env.example` → `.env` (se não existirem)
- ✅ Executa `prisma generate` + `prisma migrate dev`
- ✅ Inicia **backend** (porta 3333) e **frontend** (porta 3000) em janelas separadas

**💡 Sem precisar entrar em cada pasta e rodar `npm install` manualmente!**

**Parâmetros disponíveis:**
```powershell
.\run-dev.ps1              # Setup completo + iniciar dev servers
.\run-dev.ps1 -SkipSetup   # Pular verificações (reruns rápidos)
.\run-dev.ps1 -NoNewWindow # Rodar tudo na mesma janela
```

⚠️ **Pré-requisitos:**
- ✅ Node.js 24+ instalado
- ✅ PostgreSQL rodando em `localhost:5432` (nativo OU via Docker)
- ✅ MinIO rodando em `localhost:9000` (nativo OU via Docker: `docker compose up minio -d`)

---

## 🚀 Stack Tecnológica

### Backend (`pass_backend/`)
- Node.js 24+ com Fastify
- TypeScript
- Prisma ORM 7
- Zod (validação)
- PostgreSQL

### Frontend (`pass_frontend/`)
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- TanStack Query (React Query)
- React Hook Form + Zod
- Axios

## 🐳 Início Rápido com Docker (RECOMENDADO)

### Sistema Completo em 1 Comando 🎯

```bash
# Iniciar TUDO (Postgres + MinIO + Backend + Frontend)
./start-dev.sh

# Pronto! Acesse:
# 🌐 Frontend: http://localhost:3000
# 🔌 Backend API: http://localhost:3333
# 📦 MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
```

**Isso inicia automaticamente:**
- ✅ PostgreSQL com migrations aplicadas
- ✅ MinIO para storage de arquivos
- ✅ Backend API com hot reload
- ✅ Frontend Next.js com hot reload

**Comandos úteis:**
```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs apenas do backend
docker compose logs -f backend

# Ver logs apenas do frontend
docker compose logs -f frontend

# Parar todos os serviços
./stop.sh
# ou
docker compose down

# Limpar volumes (apaga dados)
docker compose down -v
```

📖 **[Ver documentação completa do Docker →](./DOCKER.md)**

### Modo Produção

```bash
# Build otimizado para produção
./start-prod.sh

# ou manualmente
docker compose -f docker-compose.prod.yml up --build
```

## 🛠️ Desenvolvimento Manual (Alternativa)

Se preferir rodar backend/frontend localmente (útil para debugging):

### 1. Inicie apenas a infraestrutura

```bash
# Apenas PostgreSQL + MinIO
docker compose up postgres minio -d
```

### 2. Configure e rode o Backend

```bash
cd pass_backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend rodando em: `http://localhost:3333`

### 3. Configure e rode o Frontend

```bash
cd pass_frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend rodando em: `http://localhost:3000`

### 4. Configure o MinIO (primeira vez)

Acesse: http://localhost:9001
- Usuário: `minioadmin`
- Senha: `minioadmin123`
- Crie o bucket: `pass-vehicles`

## 📦 Comandos Docker Úteis

```bash
# Ver status dos containers
docker compose ps

# Executar comando no backend
docker compose exec backend npx prisma studio

# Executar migrations
docker compose exec backend npx prisma migrate dev

# Acessar shell do container
docker compose exec backend sh

# Ver recursos (CPU, memória)
docker stats

# Rebuild completo
docker compose up --build --force-recreate
```

## 🗂️ Estrutura do Projeto

```
pass_desafiotecnico/
├── 🐳 docker-compose.yml           # Desenvolvimento
├── 🐳 docker-compose.prod.yml      # Produção
├── 🚀 start-dev.sh                 # Script start dev
├── 🚀 start-prod.sh                # Script start prod
├── 🛑 stop.sh                      # Script stop all
├── 📖 QUICKSTART.md                # Início rápido
├── 📖 DOCKER.md                    # Guia Docker completo
├── 📖 CONTEXT.md                   # Como funciona o sistema
│
├── pass_backend/                   # 🔌 API REST
│   ├── Dockerfile                  # Build produção
│   ├── Dockerfile.dev              # Build desenvolvimento
│   ├── docs/                       # 📚 Documentação completa
│   │   ├── CONTEXT.md
│   │   ├── EXPLAIN.md
│   │   ├── FILTERS.md
│   │   ├── FRONTEND_INTEGRATION.md
│   │   └── FleetManager.postman_collection.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── http/
│       │   ├── controllers/        # Validação e HTTP
│       │   └── routes/             # Rotas Fastify
│       ├── services/               # Lógica de negócio
│       │   ├── vehicleServices/
│       │   ├── fuelingServices/
│       │   ├── incidentServices/
│       │   ├── vehicleDocumentServices/
│       │   └── vehicleImageServices/
│       └── lib/                    # Prisma client
│
├── pass_frontend/                  # 🌐 Interface Web
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── (modules)/
│       │       └── vehicles/
│       ├── components/
│       │   ├── ui/                 # Shadcn UI
│       │   └── layout/             # Sidebar, Header
│       ├── features/               # Features por domínio
│       │   ├── vehicles/
│       │   └── fleet-events/
│       └── lib/                    # Axios, React Query
│
└── pass_schemas/                   # 📋 Schemas compartilhados
    └── src/
        └── *.ts                    # Validações Zod
```

## 🔒 Portas e Acessos

| Serviço | Porta | URL | Credenciais |
|---------|-------|-----|-------------|
| Frontend | 3000 | http://localhost:3000 | - |
| Backend API | 3333 | http://localhost:3333 | - |
| PostgreSQL | 5432 | localhost:5432 | pass_user / pass_password |
| MinIO API | 9000 | http://localhost:9000 | minioadmin / minioadmin123 |
| MinIO Console | 9001 | http://localhost:9001 | minioadmin / minioadmin123 |

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="postgresql://pass_user:pass_password@localhost:5432/pass_db?schema=public"
PORT=3333
NODE_ENV=development
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=pass-vehicles
MINIO_USE_SSL=false
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## 📚 Documentação

- 📖 [QUICKSTART.md](./QUICKSTART.md) - Início em 2 minutos
- 📖 [DOCKER.md](./DOCKER.md) - Guia Docker completo
- 📖 [CONTEXT.md](./CONTEXT.md) - Como funciona o sistema
- 📖 [Backend Docs](./pass_backend/docs/) - Documentação técnica da API
- 📋 [EXPLAIN.md](./pass_backend/docs/EXPLAIN.md) - Regras de negócio
- 🔍 [FILTERS.md](./pass_backend/docs/FILTERS.md) - Filtros e ordenação
- 🔗 [FRONTEND_INTEGRATION.md](./pass_backend/docs/FRONTEND_INTEGRATION.md) - Integração frontend
- 📮 [Postman Collection](./pass_backend/docs/FleetManager.postman_collection.json) - Testes de API

## 🚀 Deploy na Vercel (Frontend)

### Configuração Automática

O projeto está configurado como **monorepo npm workspaces** para deploy na Vercel:

1. **Importe o repositório** na Vercel
2. **Configuração será detectada automaticamente** via `vercel.json`
3. **Adicione variável de ambiente**:
   ```env
   NEXT_PUBLIC_API_URL=https://seu-backend.com
   ```

### Configuração Manual (se necessário)

Se a Vercel não detectar automaticamente, configure:

- **Framework Preset**: Next.js
- **Root Directory**: *(deixe vazio - usa raiz do monorepo)*
- **Build Command**: `npm run build`
- **Output Directory**: `pass_frontend/.next`
- **Install Command**: `npm install`

### Como Funciona o Build na Vercel

O monorepo está configurado com **npm workspaces**:

1. ✅ `npm install` na raiz instala `pass_frontend` e `pass_schemas`
2. ✅ `pass_schemas` é linkado automaticamente (via `file:../pass_schemas`)
3. ✅ Build command executa:
   - Primeiro: `npm run build --workspace=pass_schemas` (compila TypeScript → `dist/`)
   - Depois: `npm run build --workspace=pass_frontend` (Next.js build)
4. ✅ Frontend importa schemas via `import { vehicleSchema } from '@pass/schemas'`

**💡 Funciona local e na Vercel:**
- **Local**: `file:../pass_schemas` resolve para pasta local
- **Docker**: Copia todo o monorepo, resolve normalmente
- **Vercel**: `npm install` na raiz resolve workspaces automaticamente

### Arquivos de Configuração

- **`package.json`** (raiz) - Define workspaces npm (apenas frontend + schemas)
- **`vercel.json`** - Configuração de build otimizada
- **`.npmrc`** - Configuração de hoisting para workspaces

### Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy produção
vercel --prod
```

### Troubleshooting Vercel

**❌ Erro: "Cannot find module '@pass/schemas'"**

Verifique:
1. `pass_schemas/package.json` tem `"main": "dist/index.js"`
2. `pass_schemas` tem script `"build": "tsc"`
3. `pass_frontend/package.json` tem `"@pass/schemas": "file:../pass_schemas"`
4. Build command está executando schemas primeiro: `npm run build`

**❌ Build lento**

Normal. Vercel compila TypeScript do zero. Cache é gerenciado automaticamente.

**❌ Deploy triggering em mudanças no backend**

Não deve acontecer. `vercel.json` tem `ignoreCommand` configurado para ignorar mudanças em `pass_backend/`.

### Após o Deploy

✅ Frontend estará acessível em `https://seu-projeto.vercel.app`  
✅ Schemas compilados automaticamente durante build  
✅ Hot reload funciona em desenvolvimento local (`npm run dev`)

## 🎯 Funcionalidades

### Backend (API REST) ✅
- ✅ **Veículos**: CRUD completo com filtros (status, categoria, marca, placa)
- ✅ **Abastecimentos**: CRUD com validação de odômetro e atualização automática
- ✅ **Ocorrências**: CRUD com filtros de severidade
- ✅ **Documentos**: CRUD com sistema de alertas de vencimento
- ✅ **Imagens**: CRUD de metadados (rotas aninhadas)
- ✅ **Paginação**: `page` e `limit` em todas as listagens
- ✅ **Ordenação**: `sortBy` e `sortOrder` com tie-breakers
- ✅ **Tratamento de Erros**: AppError customizado

### Frontend 📋
- 📋 Estrutura de features definida
- 📋 Componentes Shadcn/ui configurados
- 📋 React Query hooks
- 📋 Páginas App Router
- 📋 Formulários com validação

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :3000
sudo lsof -i :3333

# Parar containers
./stop.sh
```

### Limpar tudo e recomeçar
```bash
# Parar e limpar volumes
docker compose down -v

# Rebuild completo
docker compose up --build --force-recreate
```

### Ver logs de erro
```bash
# Backend
docker compose logs backend --tail=50

# Frontend
docker compose logs frontend --tail=50

# Banco de dados
docker compose logs postgres --tail=50
```

### Executar migrations manualmente
```bash
docker compose exec backend npx prisma migrate dev
```

## 🚀 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `./start-dev.sh` | Inicia tudo em modo desenvolvimento |
| `./start-prod.sh` | Inicia tudo em modo produção |
| `./stop.sh` | Para todos os serviços |

## 💡 Dicas de Performance

```bash
# Build paralelo (mais rápido)
docker compose build --parallel

# Apenas serviços específicos
docker compose up postgres minio backend

# Modo detached (background)
docker compose up -d

# Seguir logs em tempo real
docker compose logs -f backend frontend
```

## 🆘 Suporte

Em caso de problemas:
1. Ver logs: `docker compose logs -f`
2. Status: `docker compose ps`
3. Reiniciar: `./stop.sh && ./start-dev.sh`
4. Limpar: `docker compose down -v`

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando Docker Compose + Fastify + Next.js**
