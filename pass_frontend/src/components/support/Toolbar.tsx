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
    <div className="flex flex-col md:flex-row items-center justify-center mb-4 gap-4">
      {/* Abas de Status */}
      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-auto"
      >
        <TabsList className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border overflow-x-auto max-w-full h-auto">
          <TabsTrigger
            value="Todos"
            className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 ${
              statusFilter === "Todos"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            } shadow-sm`}
          >
            Todos{" "}
            <span className="ml-2 bg-border px-2 py-1 rounded-full text-[11px]">
              {statusCounts?.total}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="Abertos"
            className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 ${
              statusFilter === "Abertos"
                ? "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500/20"
                : "text-muted-foreground hover:bg-yellow-500/5 hover:text-yellow-600"
            }`}
          >
            Abertos{" "}
            <span className="ml-2 bg-border text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-1 rounded-full text-[11px]">
              {statusCounts.abertos}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="Em Andamento"
            className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 ${
              statusFilter === "Em Andamento"
                ? "bg-purple-500/10 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-500/20"
                : "text-muted-foreground hover:bg-purple-500/5 hover:text-purple-600"
            }`}
          >
            Em Andamento{" "}
            <span className="ml-2 bg-purple-200 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full text-[11px]">
              {statusCounts.andamento}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="Resolvidos"
            className={`h-8 text-sm font-medium rounded-md px-3 py-1.5 ${
              statusFilter === "Resolvidos"
                ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/20"
                : "text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600"
            }`}
          >
            Resolvidos{" "}
            <span className="ml-2 bg-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full text-[11px]">
              {statusCounts.resolvidos}
            </span>
          </TabsTrigger>

          <Separator orientation="vertical" className="h-4 mr-2" />
          <div className="flex items-center gap-3">
            <span className="text-foreground/90 text-sm">
              Visualização:{" "}
              <span className="text-foreground/50 font-medium ml-1 text-sm">
                {viewModeLabels[viewMode]}
              </span>
            </span>
            <div className="flex bg-background rounded-md border border-border">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "lanes" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("lanes")}
              >
                <Columns className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsList>
      </Tabs>
      {hasActiveFilters && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={onClearFilters}
                className="p-0 border-0 bg- text-foreground hover:bg-muted/50 w-10 h-10 cursor-pointer flex items-center justify-center rounded-md"
              >
                <div className="w-10 h-10">
                  <PiFunnelX className="w-full h-full text-muted-foreground p-2  hover:text-foreground " />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpar filtros</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
