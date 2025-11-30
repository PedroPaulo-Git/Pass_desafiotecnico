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

## Boas Práticas Internas
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
