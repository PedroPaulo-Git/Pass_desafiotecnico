# Fleet Manager - Filters and Sorting Guide (English)

This section describes filters (query params), pagination, and sorting for each backend listing endpoint.

## General Conventions
- Pagination: `page` (>=1), `limit` (1–100) → `{ items, page, limit, total, totalPages }`.
- Sorting: `sortBy` + `sortOrder` (`asc|desc`). Use tie-breakers where applicable for stability.
- Date ranges: `...From` and `...To` must satisfy `From ≤ To`.
- Numeric ranges: `minX` / `maxX` must satisfy `minX ≤ maxX`.
- All filters are optional; omitted fields are not included in `where`.

## 1. Vehicle (`GET /vehicles`)
### Query Params
`page`, `limit`, `plate`, `brand`, `status`, `category`, `classification`, `state`, `sortBy`, `sortOrder`.
### Sorting
Default: `sortBy=createdAt&sortOrder=desc`. If `sortBy=createdAt`: `[{ createdAt: desc }, { id: desc }]` for stability.
### Example
`GET /vehicles?page=1&limit=10&brand=Volvo&status=LIBERADO&sortBy=brand&sortOrder=asc`

## 2. Fueling (`GET /fuelings`)
### Query Params
`page`, `limit`, `provider`, `fuelType`, `dateFrom`, `dateTo`, `minOdometer`, `maxOdometer`, `minLiters`, `maxLiters`, `minUnitPrice`, `maxUnitPrice`, `totalValue`, `sortBy`, `sortOrder`.
### Sorting
Default: `date desc`. If `sortBy=date`: `[{ date: desc }, { createdAt: desc }]`.
### Example
`GET /fuelings?page=1&minOdometer=50000&maxOdometer=60000&fuelType=DIESEL&sortBy=odometer&sortOrder=asc`

## 3. Incident (`GET /incidents`)
### Query Params
`page`, `limit`, `severity`, `classification`, `vehicleId`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`.
### Sorting
Similar to fueling; use tie-breakers when sorting by `date`.
### Example
`GET /incidents?severity=MEDIA&classification=MULTA&dateFrom=2025-01-01&dateTo=2025-01-31&sortBy=date`

## 4. VehicleDocument (`GET /documents`)
### Query Params
`page`, `limit`, `name`, `vehicleId`, `activeAlert`, `expiryDateFrom`, `expiryDateTo`, `expiringWithinDays`, `sortBy`, `sortOrder`.
### Alert Logic (`expiringWithinDays`)
Compute `limit = today + expiringWithinDays`; filter `expiryDate <= limit` and `expiryDate >= today`; apply `activeAlert=true` if provided.
### Sorting
Default: `expiryDate asc`.
### Example
`GET /documents?expiringWithinDays=15&activeAlert=true&sortBy=expiryDate&sortOrder=asc`

## 5. VehicleImage (`GET /images`)
### Query Params
`page`, `limit`, `vehicleId`, `url`, `sortBy`, `sortOrder`.
### Sorting
Default: `id desc` (model has no `createdAt`).
### Example
`GET /images?vehicleId=...&sortBy=url&sortOrder=asc`

## Internal Best Practices
- Build `where` incrementally; add only provided fields.
- Avoid spreads on Prisma unions; construct filter objects explicitly.
- Use arrays in `orderBy` for multi-field stability.
- Validate ranges via Zod `superRefine`.


----------------------------------------------------


# Fleet Manager - Guia de Filtros e Ordenação

Este documento descreve detalhadamente todos os filtros (query params), paginação e ordenação disponíveis nos endpoints de listagem de cada módulo do backend.

## Convenções Gerais
- Paginação: `page` (>=1), `limit` (1–100) retornam `{ items, page, limit, total, totalPages }`.
- Ordenação: `sortBy` + `sortOrder` (`asc|desc`). Quando aplicável, usa fallback/tie-break para consistência.
- Datas: parâmetros `...From` e `...To` validam que `From <= To`.
- Intervalos numéricos: pares `minX` / `maxX` validam que `minX <= maxX`.
- Todos os filtros são opcionais; omissos = campo não entra no `where`.

## 1. Vehicle (`GET /vehicles`)
### Query Params
| Param        | Tipo     | Descrição | Exemplo |
|--------------|----------|-----------|---------|
| `page`       | number   | Página atual | `page=2` |
| `limit`      | number   | Itens por página | `limit=20` |
| `plate`      | string   | Placa exata (normalizada sem hífen) | `plate=ABC1C23` |
| `brand`      | string   | Marca exata | `brand=Volvo` |
| `status`     | enum     | Estado do veículo | `status=LIBERADO` |
| `category`   | enum     | Categoria | `category=ONIBUS` |
| `classification` | enum | Classificação | `classification=EXECUTIVO` |
| `state`      | string(2)| UF | `state=SP` |
| `sortBy`     | enum     | Campo de ordenação | `sortBy=brand` |
| `sortOrder`  | enum     | Direção | `sortOrder=asc` |

### Ordenação
- Default: `sortBy=createdAt&sortOrder=desc`.
- Quando `sortBy=createdAt`, service aplica: `[{ createdAt: desc }, { id: desc }]` para estabilidade.

### Exemplo
```
GET /vehicles?page=1&limit=10&brand=Volvo&status=LIBERADO&sortBy=brand&sortOrder=asc
```

## 2. Fueling (`GET /fuelings`)
### Query Params
| Param            | Tipo     | Descrição | Exemplo |
|------------------|----------|-----------|---------|
| `page`           | number   | Página | `page=1` |
| `limit`          | number   | Itens por página | `limit=50` |
| `provider`       | string   | Posto exato | `provider=Posto X` |
| `fuelType`       | enum     | Tipo de combustível | `fuelType=DIESEL` |
| `dateFrom`       | date     | Data mínima (inclusive) | `dateFrom=2025-01-01` |
| `dateTo`         | date     | Data máxima (inclusive) | `dateTo=2025-02-01` |
| `minOdometer`    | number   | Km mínimo | `minOdometer=10000` |
| `maxOdometer`    | number   | Km máximo | `maxOdometer=20000` |
| `minLiters`      | number   | Litros mínimo | `minLiters=50` |
| `maxLiters`      | number   | Litros máximo | `maxLiters=120` |
| `minUnitPrice`   | number   | Preço unitário mínimo | `minUnitPrice=4.5` |
| `maxUnitPrice`   | number   | Preço unitário máximo | `maxUnitPrice=7.0` |
| `totalValue`     | number   | Valor total exato | `totalValue=550` |
| `sortBy`         | enum(`date`,`odometer`,`liters`,`unitPrice`,`totalValue`) | Campo ordenação | `sortBy=date` |
| `sortOrder`      | enum     | Direção | `sortOrder=desc` |

### Ordenação
- Default: `date desc`.
- Quando `sortBy=date`: `[{ date: desc }, { createdAt: desc }]` para consistência temporal.

### Exemplo
```
GET /fuelings?page=1&minOdometer=50000&maxOdometer=60000&fuelType=DIESEL&sortBy=odometer&sortOrder=asc
```

## 3. Incident (`GET /incidents`)
### Query Params (padrão semelhante ao fueling para datas)
| Param            | Tipo   | Descrição | Exemplo |
|------------------|--------|-----------|---------|
| `page`           | number | Página | `page=1` |
| `limit`          | number | Itens por página | `limit=25` |
| `severity`       | enum   | Severidade | `severity=ALTA` |
| `classification` | string | Classificação | `classification=MULTA` |
| `vehicleId`      | uuid   | Filtra por veículo | `vehicleId=...` |
| `dateFrom`       | date   | Data inicial | `dateFrom=2025-01-01` |
| `dateTo`         | date   | Data final | `dateTo=2025-01-31` |
| `sortBy`         | enum(`date`,`severity`,`classification`) | Campo | `sortBy=date` |
| `sortOrder`      | enum   | Direção | `sortOrder=desc` |

### Ordenação
- Similar: quando `date` é foco, usa tie-break por `createdAt` (ou `id` se exigido) para estabilidade.

### Exemplo
```
GET /incidents?severity=MEDIA&classification=MULTA&dateFrom=2025-01-01&dateTo=2025-01-31&sortBy=date
```

## 4. VehicleDocument (`GET /documents`)
### Query Params
| Param              | Tipo   | Descrição | Exemplo |
|--------------------|--------|-----------|---------|
| `page`             | number | Página | `page=1` |
| `limit`            | number | Itens por página | `limit=10` |
| `name`             | string | Nome exato | `name=Licenciamento` |
| `vehicleId`        | uuid   | Vinculado ao veículo | `vehicleId=...` |
| `activeAlert`      | boolean| Apenas ativos | `activeAlert=true` |
| `expiryDateFrom`   | date   | Vencimento inicial | `expiryDateFrom=2025-12-01` |
| `expiryDateTo`     | date   | Vencimento final | `expiryDateTo=2026-01-31` |
| `expiringWithinDays` | number | Documentos que vencem em <= X dias | `expiringWithinDays=30` |
| `sortBy`           | enum(`expiryDate`,`name`,`createdAt`) | Campo | `sortBy=expiryDate` |
| `sortOrder`        | enum   | Direção | `sortOrder=asc` |

### Lógica de Alerta (`expiringWithinDays`)
1. Calcula `limite = hoje + expiringWithinDays`.
2. Filtra `expiryDate <= limite` e `expiryDate >= hoje`.
3. Se `activeAlert=true`, aplica também.

### Ordenação
- Default: `expiryDate asc` (ex: próximos vencimentos primeiro).
- Pode aplicar fallback por `createdAt` para estabilidade.

### Exemplo
```
GET /documents?expiringWithinDays=15&activeAlert=true&sortBy=expiryDate&sortOrder=asc
```

## 5. VehicleImage (`GET /images`)
### Query Params
| Param       | Tipo   | Descrição | Exemplo |
|-------------|--------|-----------|---------|
| `page`      | number | Página | `page=1` |
| `limit`     | number | Itens por página | `limit=30` |
| `vehicleId` | uuid   | Imagens do veículo | `vehicleId=...` |
| `url`       | string | URL exata | `url=https://example.com/image.jpg` |
| `sortBy`    | enum(`id`,`url`) | Campo ordenação | `sortBy=id` |
| `sortOrder` | enum   | Direção | `sortOrder=desc` |

### Ordenação
- Default: `id desc` (como substituto estável).
- Sem `createdAt` no modelo, portanto somente campos existentes.

### Exemplo
```
GET /images?vehicleId=...&sortBy=url&sortOrder=asc
```

## 6. Helpdesk (`GET /helpdesk`)
### Query Params
| Param            | Tipo   | Descrição | Exemplo |
|------------------|--------|-----------|---------|
| `page`           | number | Página atual | `page=1` |
| `limit`          | number | Itens por página (1-100) | `limit=20` |
| `status`         | enum   | Status do chamado | `status=ABERTO` |
| `priority`       | enum   | Prioridade | `priority=ALTA` |
| `category`       | enum   | Categoria | `category=BUG` |
| `clientId`       | uuid   | Filtrar por cliente | `clientId=uuid-aqui` |
| `assignedUserId` | uuid   | Filtrar por usuário responsável | `assignedUserId=uuid-aqui` |
| `sortBy`         | enum   | Campo de ordenação | `sortBy=createdAt` |
| `sortOrder`      | enum   | Direção (`asc` ou `desc`) | `sortOrder=desc` |

### Enums Disponíveis
- **Status**: `ABERTO`, `EM_ANALISE`, `EM_ANDAMENTO`, `AGUARDANDO_USUARIO`, `RESOLVIDO`, `ENCERRADO`
- **Priority**: `BAIXA`, `MEDIA`, `ALTA`, `CRITICA`
- **Category**: `BUG`, `AGENDAMENTO`, `TREINAMENTO`, `PERFORMANCE`, `AJUSTE_MELHORIA`, `OUTRO`
- **SortBy**: `createdAt`, `updatedAt`, `lastMessageAt`, `priority`

### Ordenação
- Default: `sortBy=createdAt&sortOrder=desc`
- Quando `sortBy=createdAt`: `[{ createdAt: desc }, { id: desc }]` para estabilidade
- Quando `sortBy=lastMessageAt`: ordena por última mensagem, útil para chamados ativos

### Exemplo
```
GET /helpdesk?page=1&limit=10&status=ABERTO&priority=ALTA&category=BUG&sortBy=createdAt&sortOrder=desc
```

### Endpoints Relacionados e Bodies Necessários
- `POST /helpdesk` - Criar chamado  
  **Body**: `{ clientId: string(uuid), userId?: string(uuid), title: string, description: string, category: enum, priority?: enum, module?: enum, environment?: enum, attachments?: string[](urls) }`

- `PUT /helpdesk/:id` - Atualizar chamado  
  **Body**: `{ assignedUserId?: string(uuid), status?: enum, priority?: enum }`

- `DELETE /helpdesk/:id` - Deletar chamado  
  **Body**: Nenhum

- `POST /helpdesk/:id/messages` - Enviar mensagem  
  **Body**: `{ authorId: string(uuid), authorType: "user"|"support", message: string, createdAt: string(datetime), attachments?: string[](paths) }`

- `GET /helpdesk/:id/messages` - Listar mensagens do chamado  
  **Body**: Nenhum (query params não aplicáveis)
- Construir `where` incremental: adicionar apenas campos presentes para evitar filtros vazios.
- Evitar spreads em unions do Prisma quando o tipo pode não ser objeto (ex: `DateTimeFilter`). Construir objeto explicitamente.
- Usar arrays em `orderBy` para ordenar por múltiplos campos quando estabilidade temporal importa.
- Validar coerência entre limites (`min` ≤ `max`, `From` ≤ `To`) via `superRefine` do Zod.

## Exemplos Combinados
### Próximos abastecimentos por odômetro e preço
```
GET /fuelings?minOdometer=40000&maxOdometer=60000&minUnitPrice=4&maxUnitPrice=6&sortBy=odometer&sortOrder=asc&page=1
```
### Documentos vencendo em 30 dias (apenas alertas ativos)
```
GET /documents?expiringWithinDays=30&activeAlert=true&sortBy=expiryDate&sortOrder=asc
```
### Incidentes do veículo filtrados por severidade
```
GET /incidents?vehicleId=UUID_AQUI&severity=ALTA&sortBy=date&sortOrder=desc
```

## Erros Comuns
| Erro | Causa | Solução |
|------|-------|---------|
| `minX > maxX` | Intervalo invertido | Ajustar valores ou remover um lado |
| `dateFrom > dateTo` | Datas trocadas | Corrigir ordem cronológica |
| Enum inválido | Valor fora do conjunto | Usar valor permitido conforme schema |
| UUID inválido | Formato incorreto | Gerar UUID padrão (v4) |

---
Última atualização: ${new Date().toISOString().split('T')[0]}
