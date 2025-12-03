# 📋 Como Funciona o Sistema Pass

Sistema para gerenciar frota de veículos (carros, motos, caminhões). Você cadastra veículos, registra abastecimentos, ocorrências, documentos e fotos.

## 🎯 O que ele faz?

- **Cadastro de Veículos**: Placa, marca, modelo, cor, ano, quilometragem
- **Abastecimentos**: Registra combustível, litros, valor, posto
- **Ocorrências**: Multas, manutenções, acidentes, revisões
- **Documentos**: CRLV, seguro, contratos (PDFs)
- **Fotos**: Imagens do veículo

## 🏗️ Como está organizado?

### 3 Pastas Principais

```
pass_backend/     → API (servidor que processa dados)
pass_frontend/    → Site (interface visual)
pass_schemas/     → Validações (regras compartilhadas)
```

### Backend (API REST)

**Tecnologias**: Node.js, Fastify, Prisma, PostgreSQL

**Como funciona**:
- Recebe requisições HTTP (GET, POST, PUT, DELETE)
- Valida os dados com Zod
- Salva/busca no banco PostgreSQL via Prisma
- Retorna JSON

**Estrutura**:
```
src/
├── http/
│   ├── controllers/    → Recebe requisição, valida, chama service
│   └── routes/         → Define URLs (/vehicles, /fuelings)
├── services/           → Lógica de negócio e Prisma
├── lib/                → Conexão Prisma
└── utils/              → Erros customizados
```

**Exemplo de fluxo**:
1. Frontend faz `POST /vehicles` com dados do veículo
2. Controller valida com Zod
3. Service salva no banco via Prisma
4. Retorna veículo criado ou erro

### Frontend (Interface Web)

**Tecnologias**: Next.js 15, React, TanStack Query, Shadcn/ui

**Como funciona**:
- Páginas Next.js (App Router)
- Componentes React para UI
- TanStack Query busca dados do backend
- React Hook Form para formulários

**Estrutura**:
```
src/
├── app/                → Páginas (rotas)
│   └── (modules)/
│       └── vehicles/   → Página de veículos
├── components/
│   ├── ui/             → Botões, inputs, modais (Shadcn)
│   └── layout/         → Sidebar, header
├── features/
│   ├── vehicles/       → Tudo de veículos (tabela, modal, hooks)
│   └── fleet-events/   → Abastecimentos, ocorrências
└── lib/                → Axios, React Query config
```

**Exemplo de fluxo**:
1. Usuário abre http://localhost:3000/vehicles
2. Hook do React Query busca dados: `useQuery(['vehicles'])`
3. Axios chama backend: `GET http://localhost:3333/vehicles`
4. Tabela exibe veículos retornados

### Schemas (Validações)

**Tecnologias**: Zod, TypeScript

**O que faz**:
- Define regras: "placa é obrigatória", "ano entre 1900-2100"
- Compartilhado entre backend e frontend
- Evita duplicação de código

**Exemplo**:
```typescript
// pass_schemas/src/vehicleSchema.ts
z.object({
  plate: z.string().min(7, "Placa inválida"),
  year: z.number().min(1900).max(2100)
})
```

Usado em:
- Backend: Valida requisições
- Frontend: Valida formulários antes de enviar

## 🔄 Fluxo Completo (Cadastro de Veículo)

1. **Usuário preenche formulário** no frontend
2. **React Hook Form valida** com schema do `pass_schemas`
3. **Se válido**, Axios envia `POST /vehicles` para backend
4. **Backend valida novamente** com mesmo schema
5. **Prisma salva** no PostgreSQL
6. **Backend retorna** veículo criado
7. **React Query atualiza** cache e tabela

## 🐳 Docker (Rodar tudo junto)

O sistema usa Docker Compose para subir 4 serviços:

```
PostgreSQL   → Banco de dados (porta 5432)
MinIO        → Armazena arquivos (porta 9000/9001)
Backend      → API REST (porta 3333)
Frontend     → Interface Web (porta 3000)
```

**Comando mágico**:
```bash
./start-dev.sh
```

Isso sobe tudo automaticamente e você acessa http://localhost:3000

## 📊 Banco de Dados

**PostgreSQL** com Prisma ORM:

```
Vehicle          → Veículos (placa, marca, modelo...)
  ├── Fueling    → Abastecimentos
  ├── Incident   → Ocorrências
  ├── Document   → Documentos
  └── Image      → Fotos
```

Cada veículo pode ter vários abastecimentos, ocorrências, documentos e fotos.

## 🚀 Rodar o Sistema

### Com Docker (Fácil)
```bash
./start-dev.sh
# Abre http://localhost:3000
```

### Manual (Para debug)
```bash
# Terminal 1: Banco
docker compose up postgres minio -d

# Terminal 2: Backend
cd pass_backend
npm install
npm run dev

# Terminal 3: Frontend
cd pass_frontend
npm install
npm run dev
```

## 🔐 Credenciais (Desenvolvimento)

- **PostgreSQL**: `pass_user` / `pass_password`
- **MinIO**: `minioadmin` / `minioadmin123`

## 📝 Resumo Técnico

- **Linguagem**: TypeScript
- **Backend**: Fastify + Prisma ORM
- **Frontend**: Next.js 15 + React 19
- **Banco**: PostgreSQL 16
- **Storage**: MinIO (S3-compatible)
- **Validação**: Zod
- **Query**: TanStack Query
- **UI**: Shadcn/ui + Tailwind CSS

## 🎯 Para Desenvolvedores

**Adicionar nova funcionalidade**:
1. Criar schema em `pass_schemas/src/`
2. Criar migration no Prisma
3. Criar service/controller no backend
4. Criar feature/components no frontend
5. Testar!

**Arquitetura**:
- Backend: Controller → Service → Prisma
- Frontend: Page → Feature → Hook → API

Simples assim! 🚀
