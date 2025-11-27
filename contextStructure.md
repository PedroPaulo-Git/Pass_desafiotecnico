# CONTEXTO DO PROJETO: SISTEMA DE GESTÃO DE FROTA (PASS)

## ESTACK TECNOLÓGICA
- **Root:** Monorepo (pastas separadas).
- **Backend (`pass_backend`):** Node.js, Fastify, TypeScript, Prisma ORM, Zod (validação), PostgreSQL. Arquitetura: Controller-Service-Repository pattern simplificado.
- **Frontend (`pass_frontend`):** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, TanStack Query (React Query), React Hook Form + Zod, Axios.

## ESTRUTURA DE PASTAS E RESPONSABILIDADES

### 1. Backend (`pass_backend/src`)
- **`/http/controllers`**: Apenas recebem a Request/Response, validam o body com Zod e chamam o Service. Não contém regra de negócio. Retornam HTTP Status.
- **`/http/routes`**: Definição das rotas do Fastify, agrupadas por entidade (ex: `vehicles.routes.ts`).
- **`/services`**: Contém TODA a regra de negócio (ex: `create-vehicles.service.ts`). É aqui que o Prisma é chamado. Deve lançar erros customizados (AppError).
- **`/lib`**: Configurações de terceiros (instância do Prisma Client, instância do Axios, configuração do MinIO/Upload).
- **`/utils`**: Funções auxiliares puras (formatadores, validadores de CPF/CNPJ).
- **`/schemas`**: Schemas do Zod reutilizáveis para validação de entrada.

### 2. Frontend (`pass_frontend/src`)
- **`/app`**: Páginas do Next.js (App Router).
- **`/components/ui`**: Componentes bases do Shadcn (Button, Input, etc). NÃO alterar a lógica deles, apenas estilo se necessário.
- **`/components/features`**: Componentes complexos de negócio (ex: `VehicleForm.tsx`, `FleetTable.tsx`).
- **`/lib`**: Utilitários e configurações (instância do Axios configurada como `api`, utils do tailwind `cn`).
- **`/hooks`**:
    - `/queries`: Custom hooks do React Query (ex: `useVehicles`, `useCreateVehicle`). NENHUM fetch deve ser feito direto no componente, sempre via hook.
- **`/services`**: Funções que fazem a chamada direta ao Axios (ex: `vehicleService.ts` com métodos `getAll`, `create`).
- **`/types`**: Tipagem global ou espelhada do Prisma.

## REGRAS DE OURO
1. Sempre use **TypeScript** estrito.
2. No Backend, use **Zod** para validar dados antes de processar.
3. No Frontend, use **React Hook Form** para formulários.
4. Nunca exponha lógica de banco de dados (Prisma) diretamente no Controller.
5. Use **English** para código (variáveis, funções) e **Português** para textos de UI/Erros visíveis ao usuário.