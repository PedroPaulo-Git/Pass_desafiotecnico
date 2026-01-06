import React from "react";
import { Search, XIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { PiFunnelX } from "react-icons/pi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { dateRangePresets } from "./date-range-presets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { subYears } from "date-fns";

interface FilterHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  modules: string[];
  moduleFilter: string;
  setModuleFilter: (value: string) => void;
  onClearFilters: () => void;
  onClickNewTicket: () => void;
  onSearch?: () => void;
  // Estados temporários
  tempSearch: string;
  setTempSearch: (value: string) => void;
  tempModuleFilter: string;
  setTempModuleFilter: (value: string) => void;
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
  onClickNewTicket,
  onSearch,
  tempSearch,
  setTempSearch,
  tempModuleFilter,
  setTempModuleFilter,
}) => {
  const today = new Date();
  const lastYear = subYears(today, 1);
  const defaultPlaceholder = `${format(lastYear, "d 'de' MMM. yyyy", {
    locale: ptBR,
  })} - ${format(today, "d 'de' MMM. yyyy", { locale: ptBR })}`;
  return (
    <div className="text-card-foreground gap-6 flex shadow-none flex-row items-center bg-card/60 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-border/50 overflow-visible w-full">
      <div className="flex flex-wrap items-end gap-4 px-0 w-full">
        {/* Busca Principal */}
        <div className="flex-1 min-w-0 sm:flex-none">
          <div className="flex flex-col items-start gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 text-nowrap select-none">
              Buscar Chamado
            </label>
            <div className="relative w-fit">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar chamado..."
                className="pl-10 pr-2 h-12 w-96 text-[14px] dark:bg-input/30 bg-border rounded-md focus:ring-2 focus:ring-ring shadow-sm border-0 transition-all"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtro de Categoria/Módulo */}
        <div className="flex flex-col items-start gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 select-none">
            Módulo
          </label>
          <Select value={tempModuleFilter} onValueChange={setTempModuleFilter}>
            <SelectTrigger className="w-[180px] h-12 border-0 dark:bg-input/30 bg-border bg-border  shadow-sm rounded-md pl-3 text-foreground justify-between">
              <SelectValue placeholder="Todos os módulos" />
            </SelectTrigger>
            <SelectContent showSearch className="bg-popover">
              <SelectItem
                className="bg-popover text-foreground"
                key="todos"
                value="todos"
              >
                Todos os módulos
              </SelectItem>
              {modules.map((module) => (
                <SelectItem
                  className="bg-popover text-foreground"
                  key={module}
                  value={module}
                >
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Data */}
        <div className="flex flex-col items-start gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 select-none">
            Período
          </label>
          <div className="flex gap-2 overflow-hidden h-12 items-center">
            <CustomDateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              presets={dateRangePresets}
              placeholder={defaultPlaceholder}
              className="h-12 w-auto min-w-[240px] border-0  bg-border shadow-sm rounded-md"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="">
          {/* Spacer for alignment if needed, or just align-bottom */}
          <div className="flex items-center rounded-lg overflow-hidden shadow-lg">
            <Button
              onClick={onSearch}
              className="h-12 text-base bg-purple-500 hover:bg-purple-600 focus:bg-purple-600 active:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-none px-14! font-bold flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className=" ">Buscar</span>
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onClickNewTicket}
                    className="h-12 bg-purple-500 hover:bg-purple-600 focus:bg-purple-600 active:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-none border-l border-white/20 px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Criar novo chamado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
