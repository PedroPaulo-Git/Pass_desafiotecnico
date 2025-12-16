"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import type {
  VehicleFilters,
  VehicleStatus,
  VehicleCategory,
} from "@/types/vehicle";
import { cn } from "@/lib/utils";

interface VehiclesFiltersProps {
  filters: VehicleFilters;
  onFilterChange: (filters: Partial<VehicleFilters>) => void;
  onClear: () => void;
  categoryCounts: Record<VehicleCategory, number>;
  statusCounts: Record<VehicleStatus, number>;
}

export function VehiclesFilters({
  filters,
  onFilterChange,
  onClear,
  categoryCounts,
  statusCounts,
}: VehiclesFiltersProps) {
  const { t } = useI18n();

  const statuses: VehicleStatus[] = [
    "LIBERADO",
    "EM_MANUTENCAO",
    "INDISPONIVEL",
    "VENDIDO",
  ];

  const categories: VehicleCategory[] = ["ONIBUS", "VAN", "CARRO", "CAMINHAO"];

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchTermStatus, setSearchTermStatus] = useState("");
  const [highlightedIndexStatus, setHighlightedIndexStatus] = useState(0);

  const filteredCategories = categories.filter((category) =>
    t.categories[category].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStatuses = statuses.filter((status) =>
    t.status[status].toLowerCase().includes(searchTermStatus.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      
      {/* Filtros Filter Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="table_border_cutted" className="gap-1.5 h-9">
            <Filter className="h-4 w-4 text-foreground" />
            <span className="hidden sm:inline text-foreground">Filtros</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-0">
          <span className="text-muted-foreground">
            <Search className="absolute left-3 top-5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-0 border-b rounded-none h-10"
              variant="modal"
            />
          </span>

          <div className="space-y-0 px-1 py-1">
            {filteredCategories.map((category, index) => (
              <label
                key={category}
                className={cn(
                  "flex w-full justify-between items-center space-x-2 cursor-pointer py-2 px-2 rounded-md",
                  highlightedIndex === index && "bg-muted/50"
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={filters.category === category}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange({ category });
                      } else {
                        onFilterChange({ category: undefined });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{t.categories[category]}</span>
                </div>
                {categoryCounts[category] !== 0 && (
                  <span className={cn("text-[12px] text-muted-foreground")}>
                    {" "}
                    {categoryCounts[category]}
                  </span>
                )}
              </label>
            ))}
            {/* <Button variant="outline" onClick={onClear} className="w-full mt-4">
              {t.common.clearFilters}
            </Button> */}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="table_border_cutted" className="gap-1.5 h-9">
            <Filter className="h-4 w-4 text-foreground" />
            <span className="hidden sm:inline text-foreground">Status</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-0">
          <span className="text-muted-foreground">
            <Search className="absolute left-3 top-5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar status..."
              value={searchTermStatus}
              onChange={(e) => setSearchTermStatus(e.target.value)}
              className="pl-8 border-0 border-b rounded-none h-10"
              variant="modal"
            />
          </span>

          <div className="space-y-0 px-1 py-1">
            {filteredStatuses.map((status, index) => (
              <label
                key={status}
                className={cn(
                  "flex w-full justify-between items-center space-x-2 cursor-pointer py-2 px-2 rounded-md",
                  highlightedIndexStatus === index && "bg-muted/50"
                )}
                onMouseEnter={() => setHighlightedIndexStatus(index)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={filters.status === status}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange({ status });
                      } else {
                        onFilterChange({ status: undefined });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{t.status[status]}</span>
                </div>
                {statusCounts[status] !== 0 && (
                  <span className={cn("text-[12px] text-muted-foreground")}>
                    {" "}
                    {statusCounts[status]}
                  </span>
                )}
              </label>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
