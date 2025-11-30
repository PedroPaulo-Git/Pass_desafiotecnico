# Pass Backend

API REST para Sistema de Gestão de Frota usando Fastify, TypeScript e Prisma.

## Stack

- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno
- **Zod** - Validação de schemas
- **PostgreSQL** - Banco de dados

## Configuração

1. Copie o arquivo `.env.example` para `.env` e configure as variáveis:
   ```bash
   cp .env.example .env
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Prisma (quando criar o schema):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## Desenvolvimento

```bash
npm run dev
```

O servidor irá rodar em `http://localhost:3333`

## Scripts

- `npm run dev` - Inicia o servidor em modo desenvolvimento com watch
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor em produção

## Endpoints

- `GET /health` - Health check
