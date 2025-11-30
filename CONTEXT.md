# CONTEXTO DO PROJETO: SISTEMA DE GESTÃO DE FROTA (PASS)

## ESTACK TECNOLÓGICA
- **Root:** Monorepo (pastas separadas).
- **Backend (`pass_backend`):** Node.js, Fastify, TypeScript, Prisma ORM, Zod (validação), PostgreSQL. Arquitetura: Controller-Service-Repository pattern simplificado.
- **Frontend (`pass_frontend`):** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, TanStack Query (React Query), React Hook Form + Zod, Axios.

## ESTRUTURA DE PASTAS E RESPONSABILIDADES

### 1. Backend (`pass_backend/src`)
- **`/http/controllers`**: Apenas recebem a Request/Response, validam o body com Zod e chamam o Service. Não contém regra de negócio. Retornam HTTP Status.
  - `vehicleController.ts`, `fuelingController.ts`, `incidentController.ts`, `vehicleDocumentController.ts`, `vehicleImageController.ts`
- **`/http/routes`**: Definição das rotas do Fastify, agrupadas por entidade.
  - `vehicle.routes.ts` (inclui rotas aninhadas para fuelings, incidents, documents, images)
  - `fueling.routes.ts`, `incident.routes.ts`, `vehicleDocument.routes.ts`, `vehicleImage.routes.ts`
- **`/services`**: Contém TODA a regra de negócio. É aqui que o Prisma é chamado. Deve lançar erros customizados (AppError).
  - `vehicleServices/` (create, list, update, delete)
  - `fuelingServices/` (create, list, update, delete + atualização do currentKm do veículo)
  - `incidentServices/` (create, list, update, delete)
  - `vehicleDocumentServices/` (create, list, update, delete + lógica de alertas)
  - `vehicleImageServices/` (create, list, update, delete)
- **`/lib`**: Configurações de terceiros (instância do Prisma Client).
- **`/utils`**: Funções auxiliares puras (AppError para tratamento customizado de erros).
- **`/schemas`**: Schemas do Zod reutilizáveis para validação de entrada.
  - `vehicleSchema.ts`, `fuelingSchema.ts`, `incidentSchema.ts`, `vehicleDocumentSchema.ts`, `vehicleImageSchema.ts`
- **`/type`**: Tipos TypeScript customizados.
- **`/docs`**: Documentação do projeto.
  - `CONTEXT.md` - Contexto técnico e arquitetura
  - `EXPLAIN.md` - Especificação funcional do sistema
  - `FILTERS.md` - Guia completo de filtros e ordenação
  - `FRONTEND_INTEGRATION.md` - Guia de integração com frontend Next.js
  - `FleetManager.postman_collection.json` - Collection para testes

### 2. Frontend (`pass_frontend/src`)
Arquitetura orientada a features (Feature-First) com separação clara entre camadas visuais genéricas, componentes específicos de domínio e infraestrutura:

- **`/app`**: Estrutura de rotas Next.js (App Router). `layout.tsx` define o layout global (futuro Sidebar/Header). `page.tsx` é o Dashboard inicial. O diretório `(modules)` agrupa rotas por contexto sem afetar a URL (ex: `(modules)/vehicles`).
- **`/app/(modules)/vehicles`**: Página principal de veículos (`page.tsx`) e `layout.tsx` opcional para escopar UI específica (ex: filtros persistentes).
- **`/components/ui`**: Componentes base (Shadcn/ui) sem regra de negócio. Sempre desacoplados de dados.
- **`/components/layout`**: Estruturas visuais globais reutilizáveis (Sidebar, Topbar, PageHeader) que compõem o shell da aplicação.
- **`/components/shared`**: Abstrações reutilizáveis entre features (ex: `DataTable`, `StatusBadge`, `ModalContainer`).
- **`/features/vehicles`**: Tudo de domínio de veículos. Contém subpastas por finalidade:
  - `components/VehicleList` (tabela e definição de colunas)
  - `components/VehicleDetails` (sheet lateral com tabs e seções: abastecimentos, ocorrências, documentos)
  - `components/forms` (formulários modais de criação/edição)
  - `hooks` (React Query hooks: `useVehicles`, `useVehicleDetails`)
  - `types` (tipagens específicas do domínio de veículos)
- **`/features/fleet-events`**: Feature transversal que centraliza criação de abastecimentos, ocorrências e documentos. Reutilizada em múltiplos contextos:
  - `components/Fueling`, `components/Incident`, `components/Documents` (modais especializados)
  - `hooks` (ex: `useCreateFueling`, `useCreateIncident`)
  - `schemas` (Zod schemas para validações client-side)
- **`/lib`**: Infraestrutura global compartilhada:
  - `axios.ts` (instância configurada de Axios, interceptors futuros)
  - `query-client.ts` (configuração do TanStack Query Client)
  - `utils.ts` (funções utilitárias: `cn`, formatadores de data/moeda)
- **`/store`**: Estado global leve via Zustand. Ex: `use-modal-store.ts` para orquestrar qual modal/sheet está aberto.

#### Fluxo de Dados (Frontend)
1. Componente da feature dispara hook (React Query) para buscar/mutar dados.
2. Hook chama camada HTTP (Axios) configurada em `lib`.
3. Backend aplica regras de negócio e retorna dados normalizados.
4. Componentes exibem estado derivado (loading, error, sucesso) sem lógica de domínio.

#### Regras de Implementação (Frontend)
1. Formulários sempre com React Hook Form + Zod.
2. Nenhum fetch direto dentro de componentes visuais (usar hooks em `features/*/hooks`).
3. Código em inglês (variáveis, funções); textos visíveis em português.
4. Componentes em `components/ui` e `components/shared` não conhecem Axios/Query.
5. Somente hooks em `features/*/hooks` interagem com Query Client.
6. Evitar prop drilling excessivo usando pequenas stores em `store/` quando necessário.

#### Integração com Backend
- Query params e filtros seguem guia de `FILTERS.md` (validação replicada via Zod no frontend para UX imediata).
- Erros mapeados de `AppError` no backend para mensagens amigáveis em modais/toasts.
- Paginação mantém formato `{ items, page, limit, total, totalPages }` para facilitar composição em DataTable.

Essa estrutura facilita a evolução incremental: novas entidades adicionam uma nova pasta em `features`, mantendo o núcleo estável.

## MÓDULOS IMPLEMENTADOS

### ✅ Vehicle (Veículos)
- CRUD completo com paginação e filtros (status, categoria, marca, modelo, placa)
- Validações de unicidade (placa, renavam, chassis, internalId)
- Ordenação personalizável com tie-breakers
- Rotas aninhadas para fuelings, incidents, documents, images

### ✅ Fueling (Abastecimentos)
- CRUD completo com filtros avançados (data, odômetro, litros, preço unitário)
- Regras de negócio: validação de data, odômetro crescente, tipo de combustível compatível
- Transação atômica: criação do abastecimento + atualização do currentKm do veículo
- Cálculo automático do valor total (litros × preço unitário)

### ✅ Incident (Ocorrências)
- CRUD completo com filtros (severidade, classificação, data, veículo)
- Níveis de severidade: BAIXA, MEDIA, ALTA, GRAVE
- Validações de data e vínculo com veículo

### ✅ VehicleDocument (Documentos)
- CRUD completo com sistema de alertas de vencimento
- Filtros: nome, veículo, data de vencimento, alertas ativos, vencendo em X dias
- Lógica de alerta: expiringWithinDays calcula janela futura de vencimentos

### ✅ VehicleImage (Imagens)
- CRUD completo (metadados apenas, sem storage de arquivos)
- Criação via rota aninhada (POST /vehicles/:id/images)
- Listagem global e por veículo
- Ordenação por id ou url

## PADRÕES IMPLEMENTADOS

### Paginação
- Query params: `?page=1&limit=10`
- Response: `{ items, page, limit, total, totalPages }`

### Filtros
- Construção dinâmica do `where` do Prisma
- Intervalos numéricos: `minX`, `maxX`
- Intervalos de data: `dateFrom`, `dateTo`
- Validação via Zod `superRefine` (min ≤ max)

### Ordenação
- Query params: `?sortBy=field&sortOrder=asc|desc`
- Tie-breakers para ordenação estável (ex: quando sortBy=date, adiciona createdAt como segundo critério)

### Tratamento de Erros
- `AppError` customizado para erros de domínio
- Handler global: ZodError → 400, AppError → response estruturado, outros → 500
- Formato de resposta: `{ error, code, status, details }`

## REGRAS DE OURO
1. Sempre use **TypeScript** estrito.
2. No Backend, use **Zod** para validar dados antes de processar.
3. No Frontend, use **React Hook Form** para formulários.
4. Nunca exponha lógica de banco de dados (Prisma) diretamente no Controller.
5. Use **English** para código (variáveis, funções) e **Português** para textos de UI/Erros visíveis ao usuário.
6. Todos os services retornam apenas dados ou lançam AppError - nunca retornam HTTP responses.
7. Filtros e ordenação sempre validados via Zod schemas antes de chegar no service.
8. Transações do Prisma para operações que afetam múltiplas tabelas (ex: criar fueling + atualizar vehicle).