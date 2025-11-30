# Fleet Manager Backend - Context Document

## Stack
- **Runtime:** Node.js + Fastify
- **Language:** TypeScript
- **ORM:** Prisma (PostgreSQL)
- **Validation:** Zod
- **Error Handling:** Custom AppError class + global error handler

## Architecture Pattern
```
Controller → Service → Prisma
     ↓
  Zod Schema (validation at boundary)
```

## Current Structure
```
.
├── .env.example
├── .gitignore
├── .npmrc
├── CONTEXT.md
├── Explain.md
├── package.json
├── package-lock.json
├── prisma.config.ts
├── README.md
├── tsconfig.json
├── docs/
│   ├── FILTERS.md
│   └── FleetManager.postman_collection.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20251126074339_init/
│       │   └── migration.sql
│       └── 20251128120219_add_unit_price_to_fueling/
│           └── migration.sql
└── src/
  ├── server.ts          # Global error handler, CORS, route registration
  ├── http/
  │   ├── controllers/
  │   │   ├── vehicleController.ts
  │   │   ├── fuelingController.ts
  │   │   ├── incidentController.ts
  │   │   └── vehicleImageController.ts
  │   └── routes/
  │       ├── vehicle.routes.ts
  │       ├── fueling.routes.ts
  │       ├── incident.routes.ts
  │       ├── vehicleDocument.routes.ts
  │       └── vehicleImage.routes.ts
  ├── lib/
  │   └── prisma.ts
  ├── schemas/           # Zod schemas (create, update, query)
  │   ├── vehicleSchema.ts
  │   ├── fuelingSchema.ts
  │   ├── incidentSchema.ts
  │   ├── vehicleDocumentSchema.ts
  │   └── vehicleImageSchema.ts
  ├── services/
  │   ├── vehicleServices/
  │   │   ├── create-vehicles.service.ts
  │   │   ├── delete-vehicles.service.ts
  │   │   ├── list-vehicles.service.ts
  │   │   └── update-vehicles.service.ts
  │   ├── fuelingServices/
  │   │   ├── create-fuelings.service.ts
  │   │   ├── delete-fuelings.service.ts
  │   │   ├── list-fuelings.service.ts
  │   │   └── update-fuelings.service.ts
  │   ├── incidentServices/
  │   │   ├── create-incidents.service.ts
  │   │   ├── delete-incidents.service.ts
  │   │   ├── list-incidents.service.ts
  │   │   └── update-incidents.service.ts
  │   ├── vehicleDocumentServices/
  │   │   ├── create-documents.service.ts
  │   │   ├── delete-documents.service.ts
  │   │   ├── list-documents.service.ts
  │   │   └── update-documents.service.ts
  │   ├── vehicleImageServices/
  │   │   ├── create-images.service.ts
  │   │   ├── delete-images.service.ts
  │   │   ├── list-images.service.ts
  │   │   └── update-images.service.ts
  │   ├── vehicleDocumentServices.ts
  │   ├── vehicleImageServices.ts
  │   ├── vehicleServices.ts
  │   ├── fuelingServices.ts
  │   ├── incidentService.ts
  ├── type/
  │   └── vehicleType.ts
  └── utils/
    └── AppError.ts
```

## Implemented Patterns

### Error Handling
- `AppError(message, statusCode, code, details)` for domain errors
- Global handler maps: ZodError → 400, AppError → structured response, generic → 500
- Response format: `{ error, code, status, details }`

### Pagination
- Query params: `?page=1&limit=10`
- Response: `{ items, page, limit, total, totalPages }`
- Service uses `Promise.all([count, findMany])` for efficiency

### Filtering
- Dynamic `where` object built from validated query params
- Range filters use merged objects: `{ gte: min, lte: max }`
- Validated with Zod `superRefine` (min ≤ max, dateFrom ≤ dateTo)

### Sorting
- Query params: `?sortBy=field&sortOrder=asc|desc`
- Tie-break for date sorting: `[{ date: order }, { createdAt: order }]`

---

## Modules Status

### ✅ Vehicle (Complete)
- **CRUD:** create, read (by id), list (paginated + filtered), update, delete
- **Validations:** Zod schemas for create/update/query
- **Filters:** status, category, fuelType, brand, model
- **Unique checks:** plate, renavam, chassis, internalId

### ✅ Fueling (Complete)
- **CRUD:** create, read, list (paginated + filtered), update, delete
- **Filters:** provider, fuelType, date range, odometer range, liters range, unitPrice range
- **Business Rules:**
  - Date cannot be future
  - Date must be after 1886
  - Odometer ≥ vehicle.currentKm (create) / no decrease (update)
  - FuelType must match vehicle's fuelType
  - TotalValue always calculated (liters × unitPrice)
  - Transaction: creates fueling + updates vehicle.currentKm atomically

### ✅ Incident (Complete)
- **CRUD:** create, read (by id), list (paginated + filtered), update, delete
- **Validations:** Zod schemas for create/update/query
- **Filters:** severity, classification, date range, vehicleId
- **Business Rules:**
  - Date cannot be future
  - Date must be after 1886
  - Severity must be a valid enum value (BAIXA, MEDIA, ALTA, GRAVE)
  - VehicleId must reference an existing vehicle

### ❌ VehicleDocument (Not Started)
- Schema: name, expiryDate, alertDays, activeAlert
- Rules: alert logic based on days before expiry

### ✅ VehicleDocument (Complete)
- **CRUD:** create, read (by id), list (paginated + filtered), update, delete
- **Validations:** Zod schemas for create/update/query (expiryDate future, alertDays >= 0, activeAlert)
- **Filters:** name, vehicleId, expiryDate range, activeAlert, expiringWithinDays
- **Business Rules:**
  - Expiry date cannot be in the past
  - Alert logic: expiringWithinDays combines future window + activeAlert=true

### ✅ VehicleImage (Complete)
- **CRUD:** create (nested by vehicle), list (top-level and by vehicle), get by id, update, delete
- **Validations:** Zod schemas for create/update/query (url required, vehicleId via nested route)
- **Filters:** vehicleId, url, pagination; sorting by `id` or `url` with `sortOrder`
- **Notes:** Metadata only (no file storage), stable default sorting `id desc`

---

## Checklist - Next Steps

### Incident Module
- [x] Create `incidentSchema.ts` (create, update, query, idParam)
- [x] Create `incidentServices/` (create, list, listById, update, delete)
- [x] Create `incidentController.ts`
- [x] Create `incident.routes.ts`
- [x] Validations: date not future, severity enum
- [x] Add pagination + filters (severity, date range, classification)

### VehicleDocument Module
- [x] Create `vehicleDocumentSchema.ts`
- [x] Create `vehicleDocumentServices/`
- [x] Create `vehicleDocumentController.ts`
- [x] Create `vehicleDocument.routes.ts`
- [x] Alert logic: filter docs expiring within alertDays / expiringWithinDays

### VehicleImage Module
- [x] Create `vehicleImageSchema.ts`
- [x] Create `vehicleImageServices/`
- [x] Create `vehicleImageController.ts`
- [x] Create `vehicleImage.routes.ts`
- [x] Metadata CRUD (no file upload yet)

### Refinements
- [ ] Vehicle update: conditional unique check (only if field changed)
- [ ] Remove code duplication in services
- [ ] Add basic tests (create, update, list with pagination)
- [ ] API documentation (routes, params, examples)

---

## Key Prisma Models

### Vehicle (Core Entity)
- Unique: plate, renavam, chassis, internalId
- Relations: images[], fuelings[], incidents[], documents[]
- Key field: currentKm (updated by fueling)

### Fueling
- Belongs to Vehicle
- Tracks: date, provider, fuelType, liters, totalValue, unitPrice, odometer

### Incident
- Belongs to Vehicle
- Severity: BAIXA, MEDIA, ALTA, GRAVE

### VehicleDocument
- Belongs to Vehicle
- Alert system: expiryDate, alertDays, activeAlert

---

## Enums
- VehicleStatus: LIBERADO, EM_MANUTENCAO, INDISPONIVEL, VENDIDO
- FuelType: DIESEL, DIESEL_S10, GASOLINA, ETANOL, ARLA32
- VehicleCategory: ONIBUS, VAN, CARRO, CAMINHAO
- VehicleClassification: PREMIUM, BASIC, EXECUTIVO
- SeverityLevel: BAIXA, MEDIA, ALTA, GRAVE
