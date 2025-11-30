# Pass - Sistema de Gestão de Frota

Monorepo contendo backend (Fastify + Prisma) e frontend (Next.js) para gerenciamento de frota de veículos.

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

## 🐳 Iniciando com Docker

### 1. Inicie os serviços (PostgreSQL + MinIO)

```bash
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL** na porta `5432`
- **MinIO API** na porta `9000`
- **MinIO Console** na porta `9001`

### 2. Acesse o MinIO Console

```
URL: http://localhost:9001
Usuário: minioadmin
Senha: minioadmin123
```

Crie o bucket `pass-vehicles` no console do MinIO.

### 3. Configure o Backend

```bash
cd pass_backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend rodando em: `http://localhost:3333`

### 4. Configure o Frontend

```bash
cd pass_frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend rodando em: `http://localhost:3000`

## 📦 Comandos Úteis

### Docker
```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes (limpa dados)
docker-compose down -v
```

### Prisma
```bash
# Gerar cliente
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Abrir Prisma Studio
npx prisma studio
```

## 🗂️ Estrutura do Projeto

```
pass_desafiotecnico/
├── pass_backend/                      # API REST
│   ├── docs/                         # 📚 Documentação
│   │   ├── CONTEXT.md                # Contexto técnico e arquitetura
│   │   ├── EXPLAIN.md                # Especificação funcional
│   │   ├── FILTERS.md                # Guia de filtros e ordenação
│   │   ├── FRONTEND_INTEGRATION.md   # Guia de integração frontend
│   │   └── FleetManager.postman_collection.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── server.ts
│       ├── http/
│       │   ├── controllers/          # Vehicle, Fueling, Incident, Document, Image
│       │   └── routes/               # Rotas Fastify (top-level + nested)
│       ├── services/                 # Lógica de negócio + Prisma
│       │   ├── vehicleServices/
│       │   ├── fuelingServices/
│       │   ├── incidentServices/
│       │   ├── vehicleDocumentServices/
│       │   └── vehicleImageServices/
│       ├── schemas/                  # Validação Zod
│       ├── lib/                      # Prisma client
│       ├── type/                     # Tipos TypeScript
│       └── utils/                    # AppError
├── pass_frontend/                     # Interface Web (Next.js 15)
│   └── src/
│       ├── app/                      # App Router
│       │   ├── vehicles/             # CRUD + rotas aninhadas
│       │   ├── fuelings/
│       │   ├── incidents/
│       │   ├── documents/
│       │   └── images/
│       ├── components/
│       │   ├── ui/                   # Shadcn/ui
│       │   └── features/             # Componentes por módulo
│       ├── hooks/
│       │   └── queries/              # React Query hooks
│       ├── services/                 # Axios services
│       ├── schemas/                  # Zod schemas para forms
│       ├── types/                    # Tipos TypeScript
│       ├── lib/                      # api.ts (Axios), utils
│       └── providers/                # ReactQueryProvider
├── CONTEXT.md                        # 📖 Contexto do projeto
├── README.md                         # Este arquivo
└── docker-compose.yml                # PostgreSQL + MinIO
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="postgresql://pass_user:pass_password@localhost:5432/pass_db?schema=public"
PORT=3333
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## 🔒 Portas Utilizadas

- `3000` - Frontend (Next.js)
- `3333` - Backend (Fastify)
- `5432` - PostgreSQL
- `9000` - MinIO API
- `9001` - MinIO Console

## 📚 Documentação

### Documentação Geral
- [Contexto do Projeto](./CONTEXT.md) - Visão geral da stack e estrutura
- [Backend README](./pass_backend/README.md) - Guia específico do backend
- [Frontend README](./pass_frontend/README.md) - Guia específico do frontend

### Documentação Técnica do Backend (`pass_backend/docs/`)
- [CONTEXT.md](./pass_backend/docs/CONTEXT.md) - Contexto técnico, arquitetura e status dos módulos
- [EXPLAIN.md](./pass_backend/docs/EXPLAIN.md) - Especificação funcional e regras de negócio
- [FILTERS.md](./pass_backend/docs/FILTERS.md) - Guia completo de filtros, ordenação e paginação
- [FRONTEND_INTEGRATION.md](./pass_backend/docs/FRONTEND_INTEGRATION.md) - Guia de integração com Next.js
- [FleetManager.postman_collection.json](./pass_backend/docs/FleetManager.postman_collection.json) - Collection para testes de API

## 🎯 Funcionalidades Implementadas

### Backend (API REST)
- ✅ **Veículos**: CRUD completo com filtros (status, categoria, marca, placa) e validações de unicidade
- ✅ **Abastecimentos**: CRUD com regras de negócio (odômetro crescente, tipo combustível) e atualização automática do km do veículo
- ✅ **Ocorrências**: CRUD com filtros de severidade e classificação
- ✅ **Documentos**: CRUD com sistema de alertas de vencimento e filtros avançados
- ✅ **Imagens**: CRUD de metadados (rotas top-level e aninhadas)
- ✅ **Paginação**: Suporte a `page` e `limit` em todas as listagens
- ✅ **Ordenação**: `sortBy` e `sortOrder` com tie-breakers para estabilidade
- ✅ **Tratamento de Erros**: AppError customizado + handler global

### Frontend (em planejamento)
- 📋 Estrutura completa definida em `FRONTEND_INTEGRATION.md`
- 📋 Componentes Shadcn/ui configurados
- 📋 Hooks React Query por módulo
- 📋 Páginas do App Router (veículos + módulos aninhados)
- 📋 Formulários com React Hook Form + Zod
