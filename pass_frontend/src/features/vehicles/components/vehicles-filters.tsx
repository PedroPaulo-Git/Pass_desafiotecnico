"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  VehicleFilters,
  VehicleStatus,
  VehicleCategory,
  VehicleClassification,
} from "@/types/vehicle";

interface VehiclesFiltersProps {
  filters: VehicleFilters;
  onFilterChange: (filters: Partial<VehicleFilters>) => void;
  onClear: () => void;
}

export function VehiclesFilters({
  filters,
  onFilterChange,
  onClear,
}: VehiclesFiltersProps) {
  const { t } = useI18n();

  const statuses: VehicleStatus[] = [
    "LIBERADO",
    "EM_MANUTENCAO",
    "INDISPONIVEL",
    "VENDIDO",
  ];
  const categories: VehicleCategory[] = ["ONIBUS", "VAN", "CARRO", "CAMINHAO"];
  const classifications: VehicleClassification[] = [
    "PREMIUM",
    "BASIC",
    "EXECUTIVO",
  ];

  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t.vehicles.status}
          </label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) =>
              onFilterChange({ status: (value as VehicleStatus) || undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {t.status[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t.vehicles.category}
          </label>
          <Select
            value={filters.category || ""}
            onValueChange={(value) =>
              onFilterChange({
                category: (value as VehicleCategory) || undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {t.categories[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t.vehicles.classification}
          </label>
          <Select
            value={filters.classification || ""}
            onValueChange={(value) =>
              onFilterChange({
                classification: (value as VehicleClassification) || undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {classifications.map((classification) => (
                <SelectItem key={classification} value={classification}>
                  {t.classifications[classification]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Ordenar por
          </label>
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">{t.vehicles.createdAt}</SelectItem>
              <SelectItem value="brand">{t.vehicles.brand}</SelectItem>
              <SelectItem value="plate">{t.vehicles.plate}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClear}>
          {t.common.clearFilters}
        </Button>
        <Button onClick={() => {}}>{t.common.apply}</Button>
      </div>
    </div>
  );
}
