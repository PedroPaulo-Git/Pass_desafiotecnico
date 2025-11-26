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
├── pass_backend/          # API REST
│   ├── src/
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   └── schemas/
│   └── prisma/
├── pass_frontend/         # Interface Web
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── lib/
└── docker-compose.yml     # PostgreSQL + MinIO
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

- [Backend README](./pass_backend/README.md)
- [Frontend README](./pass_frontend/README.md)
- [Contexto do Projeto](./contextStructure.md)
