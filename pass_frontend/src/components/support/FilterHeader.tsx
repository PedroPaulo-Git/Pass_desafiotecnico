"use client";
import React from "react";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerRange } from "@/components/ui/data-picker-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  modules: string[];
  moduleFilter: string;
  setModuleFilter: (value: string) => void;
  onClearFilters: () => void;
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({
  search,
  setSearch,
  dateRange,
  setDateRange,
  modules,
  moduleFilter,
  setModuleFilter,
  onClearFilters,
}) => {
  return (
    <div className="bg-muted/50 p-6 rounded-xl border mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-end">
        {/* Busca Principal */}
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider flex items-center gap-2">
           Buscar Chamado
          </label>
          <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
            
              placeholder="Pesquise por ID, título ou nome do cliente..."
              className="pl-9 bg-muted border border-border text-foreground placeholder:text-muted-foreground h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filtro de Categoria/Módulo */}
        <div className="w-full md:w-[200px] space-y-2">
          <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider flex items-center gap-2">
            Módulo
          </label>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger  className="w-full justify-between bg-muted text-foreground h-11">
              <SelectValue placeholder="Selecione o módulo" />
            </SelectTrigger>
            <SelectContent bg_fill showSearch>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Data */}
        <div className="w-full md:w-60 space-y-2">
          <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-3 h-3" /> Período de Abertura
          </label>
          <DatePickerRange
            dateRange={dateRange}
            setDateRange={setDateRange}
            placeholder="Selecione o período"
            className="h-11"
          />
        </div>

        {/* Botão Principal */}
        <Button onClick={onClearFilters} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 h-11 px-8 font-semibold">
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};