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
- **`/app`**: Páginas do Next.js (App Router).
  - `vehicles/` - Lista, criação, edição e detalhes de veículos
    - `[id]/fuelings/`, `[id]/incidents/`, `[id]/documents/`, `[id]/images/` - Módulos aninhados
  - `fuelings/`, `incidents/`, `documents/`, `images/` - Listas globais de cada módulo
- **`/components/ui`**: Componentes bases do Shadcn (Button, Input, Table, Form, etc). NÃO alterar a lógica deles, apenas estilo se necessário.
- **`/components/features`**: Componentes complexos de negócio organizados por módulo.
  - `vehicles/` - VehicleList, VehicleForm, VehicleDetail, VehicleFilters, VehicleTabs
  - `fuelings/` - FuelingList, FuelingForm, FuelingDetail, FuelingFilters
  - `incidents/` - IncidentList, IncidentForm, IncidentDetail, IncidentFilters
  - `documents/` - DocumentList, DocumentForm, DocumentDetail, DocumentAlerts
  - `images/` - ImageGallery, ImageCard, ImageForm
  - `shared/` - DataTable, Pagination, FilterBar, ErrorAlert, LoadingSpinner, EmptyState
- **`/lib`**: Utilitários e configurações.
  - `api.ts` - Instância do Axios configurada com interceptors
  - `utils.ts` - Funções auxiliares do Tailwind (cn)
- **`/hooks/queries`**: Custom hooks do React Query por módulo (ex: `useVehicles`, `useCreateVehicle`). NENHUM fetch deve ser feito direto no componente, sempre via hook.
  - `vehicles.ts`, `fuelings.ts`, `incidents.ts`, `documents.ts`, `images.ts`
- **`/services`**: Funções que fazem a chamada direta ao Axios.
  - `vehicles.ts`, `fuelings.ts`, `incidents.ts`, `documents.ts`, `images.ts`
- **`/schemas`**: Schemas Zod para validação de formulários.
  - `vehicle.schema.ts`, `fueling.schema.ts`, `incident.schema.ts`, `document.schema.ts`, `image.schema.ts`
- **`/types`**: Tipagem global.
  - `vehicle.ts`, `fueling.ts`, `incident.ts`, `document.ts`, `image.ts`, `pagination.ts`, `errors.ts`
- **`/providers`**: Providers do React (ex: ReactQueryProvider)

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