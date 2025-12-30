"use client";
import React from "react";
import { LayoutGrid, List, Columns, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { PiFunnelX } from "react-icons/pi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ToolbarProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusCounts: {
    total: number;
    abertos: number;
    emAnalise: number;
    andamento: number;
    aguardandoUsuario: number;
    resolvidos: number;
    fechados: number;
  };
  viewMode: "list" | "grid" | "lanes";
  setViewMode: (mode: "list" | "grid" | "lanes") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  statusFilter,
  setStatusFilter,
  statusCounts,
  viewMode,
  setViewMode,
  onClearFilters,
  hasActiveFilters,
}) => {
  const viewModeLabels = {
    list: "Lista",
    grid: "Grade",
    lanes: "Faixas",
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center gap-2 w-full sm:w-auto ">
        {/* Área de Controles (Visualização + Limpar Filtros) */}
        <div className="flex items-center justify-start gap-3">
          <span className="text-foreground/90 text-sm whitespace-nowrap">
            Visualização:{" "}
            <span className="text-foreground/50 font-medium ml-1 text-sm">
              {viewModeLabels[viewMode]}
            </span>
          </span>

          <div className="flex items-center gap-2">
            {/* Botões de View Mode */}
            <div className="flex bg-background rounded-md border border-border p-0.5">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  viewMode === "list"
                    ? "bg-purple-500 text-foreground shadow-sm hover:text-foreground/80 hover:bg-purple-600"
                    : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  viewMode === "grid"
                    ? "bg-purple-500 text-foreground shadow-sm hover:text-foreground/80 hover:bg-purple-600"
                    : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "lanes" ? "secondary" : "ghost"}
                size="icon"
                className={`h-7 w-7 ${
                  viewMode === "lanes"
                    ? "bg-purple-500 text-foreground shadow-sm hover:text-foreground/80 hover:bg-purple-600"
                    : ""
                }`}
                onClick={() => setViewMode("lanes")}
              >
                <Columns className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* {hasActiveFilters && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={onClearFilters}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <PiFunnelX className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Limpar filtros ativos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )} */}
          {/* <Separator orientation="vertical" className="h-4 mx-1" /> */}
        </div>
        <div className="flex ">
          {/* Current Filter Button */}
          <Button
            variant="outline"
            className={`h-9 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap border-none rounded-r-none ${
              statusFilter === "Todos"
                ? "bg-muted/50 text-muted-foreground hover:text-foreground"
                : statusFilter === "Abertos"
                ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-500/20"
                : statusFilter === "Em Análise"
                ? "bg-blue-500/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-500/20"
                : statusFilter === "Em Andamento"
                ? "bg-purple-500/10 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-500/20"
                : statusFilter === "Aguardando Usuário"
                ? "bg-orange-500/10 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-500/20"
                : statusFilter === "Resolvidos"
                ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-500/20"
            } shadow-sm transition-all`}
          >
            {statusFilter}{" "}
            <span className="ml-2 bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
              {statusFilter === "Todos"
                ? statusCounts?.total
                : statusFilter === "Abertos"
                ? statusCounts.abertos
                : statusFilter === "Em Análise"
                ? statusCounts.emAnalise
                : statusFilter === "Em Andamento"
                ? statusCounts.andamento
                : statusFilter === "Aguardando Usuário"
                ? statusCounts.aguardandoUsuario
                : statusFilter === "Resolvidos"
                ? statusCounts.resolvidos
                : statusCounts.fechados}
            </span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-0 border-l border-l-border! rounded-l-none "
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="flex flex-col gap-1 p-1">
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Todos")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Todos"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50"
                  } shadow-sm transition-all`}
                >
                  Todos{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts?.total}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Abertos")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Abertos"
                      ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-500/20"
                      : "text-muted-foreground hover:bg-yellow-500/5 hover:text-yellow-600 border border-transparent"
                  } transition-all`}
                >
                  Abertos{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts.abertos}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Em Análise")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Em Análise"
                      ? "bg-blue-500/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-500/20"
                      : "text-muted-foreground hover:bg-blue-500/5 hover:text-blue-600 border border-transparent"
                  } transition-all`}
                >
                  Em Análise{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts.emAnalise}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Em Andamento")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Em Andamento"
                      ? "bg-purple-500/10 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-500/20"
                      : "text-muted-foreground hover:bg-purple-500/5 hover:text-purple-600 border border-transparent"
                  } transition-all`}
                >
                  Em Andamento{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts.andamento}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Aguardando Usuário")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Aguardando Usuário"
                      ? "bg-orange-500/10 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-500/20"
                      : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 border border-transparent"
                  } transition-all`}
                >
                  Aguardando Usuário{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts.aguardandoUsuario}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Resolvidos")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Resolvidos"
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/20"
                      : "text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600 border border-transparent"
                  } transition-all`}
                >
                  Resolvidos{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts.resolvidos}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStatusFilter("Fechados")}
                  className={`justify-start h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap ${
                    statusFilter === "Fechados"
                      ? "bg-gray-500/10 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-500/20"
                      : "text-muted-foreground hover:bg-gray-500/5 hover:text-gray-600 border border-transparent"
                  } transition-all`}
                >
                  Fechados{" "}
                  <span className="ml-auto bg-border px-2 py-1 rounded-full text-[11px] min-w-6 text-center">
                    {statusCounts.fechados}
                  </span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
