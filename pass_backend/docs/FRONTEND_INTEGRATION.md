# Frontend Integration Guide (Next.js 14)

This guide explains how to integrate the Fleet Manager Backend with your Next.js 14 App Router frontend using Axios, TanStack Query, React Hook Form + Zod, Tailwind, and Shadcn/ui.

## Principles
- Single Axios instance with env-configured base URL and interceptors.
- Service layer functions for each backend module.
- React Query hooks per module for list/detail/mutations.
- App Router routes mirror backend endpoints, with nested vehicle pages.
- Consistent pagination, filters, and sorting via URL search params.
- Error normalization: map backend AppError/ZodError to UI.

## Environment
- Set `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3333`).
- Example `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3333`.

## Axios Client
- File: `src/lib/api.ts`
- Configure baseURL from env; JSON headers; response interceptor normalizes `{ message, code, status, details }`.

## Services (per module)
Create one file per module under `src/services/`:
- `vehicles.ts`: `listVehicles(params)`, `getVehicle(id)`, `createVehicle(data)`, `updateVehicle(id, data)`, `deleteVehicle(id)`; nested: `listVehicleFuelings(id, params)`, `listVehicleIncidents`, `listVehicleDocuments`, `listVehicleImages`, `createVehicleFueling`, `createVehicleIncident`, `createVehicleDocument`, `createVehicleImage`.
- `fuelings.ts`: top-level list/get/update/delete.
- `incidents.ts`: top-level list/get/update/delete.
- `documents.ts`: top-level list/get/update/delete.
- `images.ts`: top-level list/get/update/delete.
All functions accept filter/sort/pagination params matching backend names.

## Hooks (TanStack Query)
Create hooks per module under `src/hooks/queries/`:
- Vehicles: `useVehicles(params)`, `useVehicle(id)`, `useCreateVehicle()`, `useUpdateVehicle()`, `useDeleteVehicle()`; nested: `useVehicleFuelings(id, params)`, `useCreateVehicleFueling(id)`, etc.
- Fuelings, Incidents, Documents, Images: list/detail/mutation hooks.
- Keys include param objects for cache uniqueness.
- Mutations invalidate relevant queries; optimistic updates limited to safe cases (e.g., image add/remove).

## Zod Schemas (forms)
Create schemas under `src/schemas/` mirroring backend validations:
- `vehicle.schema.ts` (plate normalization, enums, ranges)
- `fueling.schema.ts` (date, odometer, liters, unitPrice)
- `incident.schema.ts` (date, severity)
- `document.schema.ts` (expiryDate, alertDays, activeAlert)
- `image.schema.ts` (url)
Use with React Hook Form via `zodResolver`.

## UI Components
Shared UI components under `src/components/ui/`:
- `DataTable.tsx`, `Pagination.tsx`, `FilterBar.tsx`, `Form.tsx`, `FormField.tsx`, `ErrorAlert.tsx`, `LoadingSpinner.tsx`.
Feature components under `src/components/features/`:
- Vehicles: list, filters, form, detail, tabs; nested tables/forms for fuelings, incidents, documents, images.
- Fuelings/Incidents/Documents/Images: top-level list, filters, detail, form.

## Routing (App Router)
Pages under `src/app/`:
- `vehicles/page.tsx` (index with filters, table, pagination)
- `vehicles/new/page.tsx` (create vehicle)
- `vehicles/[id]/page.tsx` (detail)
- `vehicles/[id]/edit/page.tsx` (update)
- `vehicles/[id]/fuelings/page.tsx`, `vehicles/[id]/incidents/page.tsx`, `vehicles/[id]/documents/page.tsx`, `vehicles/[id]/images/page.tsx`
- Top-level: `fuelings/page.tsx`, `incidents/page.tsx`, `documents/page.tsx`, `images/page.tsx`

## Types
Under `src/types/`:
- `vehicle.ts`, `fueling.ts`, `incident.ts`, `document.ts`, `image.ts`
- `pagination.ts` for `{ items, page, limit, total, totalPages }`
- `errors.ts` for normalized error shape

## Conventions
- Filters & sorting: read/write URL search params (`page`, `limit`, `sortBy`, `sortOrder`, ranges) and pass to hooks.
- Error handling: show `ErrorAlert` for list/detail; map `details` to field-level errors in forms.
- Loading/empty states: standardized components.
- Date handling: ensure timezone consistency for date filters and forms.

## Proposed Frontend Tree (additions)
- `src/types/*`
- `src/services/vehicles.ts | fuelings.ts | incidents.ts | documents.ts | images.ts`
- `src/hooks/queries/vehicles.ts | fuelings.ts | incidents.ts | documents.ts | images.ts`
- `src/schemas/vehicle.schema.ts | fueling.schema.ts | incident.schema.ts | document.schema.ts | image.schema.ts`
- `src/components/ui/*` shared components
- `src/components/features/vehicles/*` and nested module components
- `src/app/vehicles/*` and `src/app/*` module index pages

## Phased Plan
1. Foundations: env, Axios, React Query provider, shared types/utils.
2. Vehicles core: services/hooks; pages index/detail/create/update; UI components.
3. Nested modules under vehicle: fuelings/incidents/documents/images list + create.
4. Top-level module pages: global lists with filters/sorting/pagination.
5. Error UX + polish: error banners, toasts, empty/loading states; cache strategies.
6. QA: Cross-check with `docs/FleetManager.postman_collection.json`.

## Cross-Check Checklist (Postman)
Use the collection routes to validate contracts for each implemented page and hook.

## Risks / Open Questions
- Auth not implemented; plan token handling when added.
- File uploads not supported; if required, adjust endpoints and UI.
- Enums/types sync; consider generating types from OpenAPI in future.
- Timezone considerations for date fields.
