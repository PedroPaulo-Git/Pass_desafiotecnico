"use client";
import React from "react";
import { LayoutGrid, List, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/animated-tab";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { PiFunnelX } from "react-icons/pi";

interface ToolbarProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusCounts: {
    total: number;
    abertos: number;
    andamento: number;
    resolvidos: number;
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
    <div className="flex justify-center  mb-4">
      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full sm:w-auto"
      >

        <TabsList className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1 p-1 bg-background rounded-lg border border-border h-auto w-full sm:w-auto">
          
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar p-1 sm:p-0">
            <TabsTrigger
              value="Todos"
              className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap shrink-0 ${
                statusFilter === "Todos"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              } shadow-sm transition-all`}
            >
              Todos{" "}
              <span className="ml-2 bg-border px-2 py-1 rounded-full text-[11px]">
                {statusCounts?.total}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="Abertos"
              className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap shrink-0 ${
                statusFilter === "Abertos"
                  ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-500/20"
                  : "text-muted-foreground hover:bg-yellow-500/5 hover:text-yellow-600 border border-transparent"
              } transition-all`}
            >
              Abertos{" "}
              <span className="ml-2 bg-border text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-1 rounded-full text-[11px]">
                {statusCounts.abertos}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="Em Andamento"
              className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap shrink-0 ${
                statusFilter === "Em Andamento"
                  ? "bg-purple-500/10 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-500/20"
                  : "text-muted-foreground hover:bg-purple-500/5 hover:text-purple-600 border border-transparent"
              } transition-all`}
            >
              Em Andamento{" "}
              <span className="ml-2 bg-purple-200 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full text-[11px]">
                {statusCounts.andamento}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="Resolvidos"
              className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 whitespace-nowrap shrink-0 ${
                statusFilter === "Resolvidos"
                  ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/20"
                  : "text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600 border border-transparent"
              } transition-all`}
            >
              Resolvidos{" "}
              <span className="ml-2 bg-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full text-[11px]">
                {statusCounts.resolvidos}
              </span>
            </TabsTrigger>
          </div>

          <Separator orientation="vertical" className="h-4 mx-1 hidden sm:block" />
          
          <div className="w-full h-px bg-border/50 sm:hidden my-1" />

          {/* Área de Controles (Visualização + Limpar Filtros) */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 px-1 sm:px-0">
            
            <span className="text-foreground/90 text-sm whitespace-nowrap">
              Visualização:{" "}
              <span className="text-foreground/50 font-medium ml-1 text-sm">
                {viewModeLabels[viewMode]}
              </span>
            </span>

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              

              {/* Botões de View Mode */}
              <div className="flex bg-background rounded-md border border-border p-0.5 ">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 ${viewMode === "list" ? "bg-foreground text-background shadow-sm" : "hover:bg-muted/50"}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 ${viewMode === "grid" ? "bg-foreground text-background shadow-sm" : "hover:bg-muted/50"}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "lanes" ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 ${viewMode === "lanes" ? "bg-foreground text-background shadow-sm" : "hover:bg-muted/50"}`}
                  onClick={() => setViewMode("lanes")}
                >
                  <Columns className="w-4 h-4" />
                </Button>
              </div>
              
            </div>
            {hasActiveFilters && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10  transition-colors"
                      >
                        <PiFunnelX className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Limpar filtros ativos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
          </div>

        </TabsList>
      </Tabs>
    </div>
  );
};