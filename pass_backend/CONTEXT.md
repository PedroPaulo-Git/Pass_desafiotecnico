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
src/
├── http/
│   ├── controllers/   # vehicleController, fuelingController
│   └── routes/        # vehicle.routes, fueling.routes
├── schemas/           # Zod schemas (create, update, query)
│   ├── fuelingSchema/   # CRUD operations
│   └── vehicleSchema/   # CRUD operations
├── services/
│   ├── vehicleServices/   # CRUD operations
│   └── fuelingServices/   # CRUD operations
├── utils/
│   └── AppError.ts    # Custom error class (message, statusCode, code, details)
└── server.ts          # Global error handler, CORS, route registration
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

### ❌ Incident (Not Started)
- Schema: title, classification, severity (enum), date, description, attachmentUrl
- Rules: date not future, severity validation

### ❌ VehicleDocument (Not Started)
- Schema: name, expiryDate, alertDays, activeAlert
- Rules: alert logic based on days before expiry

### ❌ VehicleImage (Not Started)
- Schema: url, vehicleId
- Rules: metadata only (no file storage yet)

---

## Checklist - Next Steps

### Incident Module
- [ ] Create `incidentSchema.ts` (create, update, query, idParam)
- [ ] Create `incidentServices/` (create, list, listById, update, delete)
- [ ] Create `incidentController.ts`
- [ ] Create `incident.routes.ts`
- [ ] Validations: date not future, severity enum
- [ ] Add pagination + filters (severity, date range, classification)

### VehicleDocument Module
- [ ] Create `vehicleDocumentSchema.ts`
- [ ] Create `vehicleDocumentServices/`
- [ ] Create `vehicleDocumentController.ts`
- [ ] Create `vehicleDocument.routes.ts`
- [ ] Alert logic: filter docs expiring within alertDays

### VehicleImage Module
- [ ] Create `vehicleImageSchema.ts`
- [ ] Create `vehicleImageServices/`
- [ ] Create `vehicleImageController.ts`
- [ ] Create `vehicleImage.routes.ts`
- [ ] Metadata CRUD (no file upload yet)

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
