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
    <div className="flex flex-col mt-4 gap-10 items-center">
      <div className="bg-card/60 p-6 rounded-xl border mb-6 shadow-sm w-[80%] mx-auto border-border/50">
        <div className="flex flex-col md:flex-row flex-wrap gap-6 items-end ">
          {/* Busca Principal */}
          <div className="flex-1 space-y-2 ">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 text-nowrap">
              Buscar Chamado
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquise por ID, título ou nome do cliente..."
                className="pl-9 dark:bg-input/30 bg-border border-0  text-foreground placeholder:text-muted-foreground h-11 "
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro de Categoria/Módulo */}
          <div className="flex-1 w-full md:w-50 space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ">
              Módulo
            </label>
            <Select value={tempModuleFilter} onValueChange={setTempModuleFilter}>
              <SelectTrigger
                className="w-full justify-between pl-3 text-foreground 
              h-11 border-input hover:bg-input/50  shadow-sm border-0 rounded-md dark:bg-input/30 bg-border m-0"
              >
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

          <div className="flex-1  space-y-2 w-full md:w-50 ">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Período de Abertura
            </label>
            <div className="flex gap-2 overflow-hidden ">
              <CustomDateRangePicker
                dateRange={dateRange}
                setDateRange={setDateRange}
                presets={dateRangePresets}
                placeholder={defaultPlaceholder}
                className="flex-1 "
              />
            </div>
          </div>
          <Button className="bg-purple-500 gap-0 dark:bg-purple-500 hover:bg-purple-500  text-white font-semibold h-11 p-0! px-0!">
            <span
              className="flex items-center px-6 hover:bg-purple-600 h-full w-full cursor-pointer transition-colors rounded-l-lg"
              onClick={onSearch}
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span onClick={onClickNewTicket} className=" border-l border-white/20 h-full w-full flex items-center px-3  hover:bg-purple-700
                  rounded-r-lg dark:hover:bg-purple-700 cursor-pointer transition-colors">
                    <div>
                      <Plus className="w-4 h-4" />
                    </div>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Criar novo chamado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
          {/* Botão Principal */}
        </div>
      </div>
    </div>
  );
};
