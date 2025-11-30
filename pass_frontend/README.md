# Pass Frontend

Frontend do Sistema de Gestão de Frota usando Next.js 14 (App Router).

## Stack

- **Next.js 14+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **TanStack Query** - Gerenciamento de estado servidor
- **React Hook Form + Zod** - Formulários e validação
- **Axios** - Cliente HTTP

## Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                   ✅
│   ├── page.tsx                     ✅
│   └── (modules)/
│       └── vehicles/
│           ├── page.tsx             ✅
│           └── layout.tsx           ✅
│
├── components/
│   ├── ui/                          ✅ (para Shadcn UI)
│   ├── layout/                      ✅ (Sidebar, Topbar, PageHeader)
│   └── shared/                      ✅ (DataTable, StatusBadge)
│
├── features/
│   ├── vehicles/                    ✅
│   │   ├── components/
│   │   │   ├── VehicleList/         ✅ (columns.tsx, VehicleTable.tsx)
│   │   │   ├── VehicleDetails/      ✅ (VehicleSheet, VehicleInfo, VehicleTabs)
│   │   │   │   └── sections/        ✅ (FuelingList, IncidentList, DocumentList)
│   │   │   └── forms/               ✅ (VehicleFormModal)
│   │   ├── hooks/                   ✅ (useVehicles, useVehicleDetails)
│   │   └── types/                   ✅
│   │
│   └── fleet-events/                ✅
│       ├── components/
│       │   ├── Fueling/             ✅ (FuelingModal)
│       │   ├── Incident/            ✅ (IncidentModal)
│       │   └── Documents/           ✅ (DocumentModal)
│       ├── hooks/                   ✅ (useCreateFueling, useCreateIncident)
│       └── schemas/                 ✅ (fueling.schema, incident.schema)
│
├── lib/                             ✅
│   ├── api.ts                       ✅
│   ├── axios.ts                     ✅
│   ├── query-client.ts              ✅
│   └── utils.ts                     ✅
│
└── store/                           ✅
    └── use-modal-store.ts           ✅
```

## Configuração

1. Copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Instale componentes Shadcn conforme necessário:
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add form
   ```

## Desenvolvimento

```bash
npm run dev
```

O aplicativo irá rodar em `http://localhost:3000`

## Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm start` - Inicia o servidor em produção
- `npm run lint` - Executa o linter

## Regras de Desenvolvimento

1. ✅ **SEMPRE** use TypeScript estrito
2. ✅ **SEMPRE** use React Hook Form para formulários
3. ✅ **NUNCA** faça fetch direto no componente - use hooks do React Query
4. ✅ Código em **inglês**, textos de UI em **português**
5. ✅ Não altere a lógica dos componentes Shadcn/ui
