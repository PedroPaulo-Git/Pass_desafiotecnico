"use client";
import React from "react";
import { Search, XIcon, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";

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
    <div className="flex flex-col mt-4 gap-10 items-center">
      <Button className="bg-foreground text-background font-semibold ml-auto">
        <span className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          <Link href="/ticket"> Novo Chamado </Link>
        </span>
      </Button>
      <div className="bg-card/60 p-6 rounded-xl border mb-6 shadow-sm w-[80%] mx-auto border-border/50">
        <div className="flex flex-col md:flex-row gap-6 items-end ">
          {/* Busca Principal */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider flex items-center gap-2">
              Buscar Chamado
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquise por ID, título ou nome do cliente..."
                className="pl-9 dark:bg-input/30 bg-border border-0  text-foreground placeholder:text-muted-foreground h-11 "
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
              <SelectTrigger className="w-full justify-between pl-3 text-foreground h-11 border-input hover:bg-input/50  shadow-sm border-0 rounded-md dark:bg-input/30 bg-border">
                <SelectValue placeholder="Selecione o módulo" />
              </SelectTrigger>
              <SelectContent showSearch className="bg-popover">
                {modules.map((module) => (
                  <SelectItem className="bg-popove" key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Data */}
          <div className="w-full md:w-60 space-y-2">
            <label className="text-xs font-bold text-foreground/75 uppercase tracking-wider flex items-center gap-2">
              Período de Abertura
            </label>
            <DatePickerRange
              dateRange={dateRange}
              setDateRange={setDateRange}
              placeholder="Selecione o período"
              className="h-11 bg-border border-0 "
            />
          </div>

          {/* Botão Principal */}
        </div>
      </div>
    </div>
  );
};
