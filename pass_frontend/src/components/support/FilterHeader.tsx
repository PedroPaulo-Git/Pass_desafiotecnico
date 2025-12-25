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
  const today = new Date();
  const lastYear = subYears(today, 1);
  const defaultPlaceholder = `${format(lastYear, "d 'de' MMM. yyyy", { locale: ptBR })} - ${format(today, "d 'de' MMM. yyyy", { locale: ptBR })}`;
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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 ">
              Módulo
            </label>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full justify-between pl-3 text-foreground 
              h-11 border-input hover:bg-input/50  shadow-sm border-0 rounded-md dark:bg-input/30 bg-border m-0">
                <SelectValue placeholder="Selecione o módulo" />
              </SelectTrigger>
              <SelectContent showSearch className="bg-popover">
                {modules.map((module) => (
                  <SelectItem className="bg-popover text-foreground" key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Data */}
          <div className="w-full md:w-60 space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Período de Abertura
            </label>
            <div className="flex gap-2">
              <CustomDateRangePicker
                dateRange={dateRange}
                setDateRange={setDateRange}
                presets={dateRangePresets}
                placeholder={defaultPlaceholder}
                className="flex-1"
              />   
            </div>
          </div>

          {/* Botão Principal */}
        </div>
      </div>
    </div>
  );
};
