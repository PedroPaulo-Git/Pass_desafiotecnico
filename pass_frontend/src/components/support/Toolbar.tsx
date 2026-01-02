"use client";
import React from "react";
import { LayoutGrid, List, Columns, Bot, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <div className="flex justify-center mb-8">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-row items-center gap-2 p-1 bg-background/50 backdrop-blur-md rounded-xl"
        style={{ transformOrigin: "50% 50% 0px" }}
      >
        {/* GRUPO: AÇÕES */}
        <label className="flex items-center gap-2 select-none text-xs font-semibold text-muted-foreground tracking-wide uppercase whitespace-nowrap ml-2">
          Ações
        </label>
        <div className="flex flex-row items-center gap-1 bg-muted/50 rounded-lg h-9 p-1 mr-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer transition-all h-7 w-7 p-0 hover:bg-background rounded-md text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  <Bot className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Automações AI</p>
              </TooltipContent>
            </Tooltip>

            <div className="shrink-0 h-4 w-px bg-border/50 mx-0.5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer transition-all h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
                    viewMode === "list"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  <List className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lista</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer transition-all h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grade</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("lanes")}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer transition-all h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
                    viewMode === "lanes"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  <Columns className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kanban</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* GRUPO: TIPO */}
        <label className="flex items-center gap-2 select-none text-xs font-semibold text-muted-foreground tracking-wide uppercase whitespace-nowrap">
          Tipo
        </label>
        <div
          className="flex flex-row items-center gap-1 bg-muted/50 rounded-lg h-9 p-1 mr-6"
          role="tablist"
        >
          <button
            type="button"
            className="px-6 py-2 text-sm font-medium rounded-md transition-all bg-purple-500 text-white shadow-sm"
            role="tab"
            aria-selected="true"
          >
            Journey
          </button>
          <button
            type="button"
            className="px-6 py-2 text-sm font-medium rounded-md transition-all text-muted-foreground hover:text-foreground"
            role="tab"
            aria-selected="false"
          >
            Service
          </button>
        </div>

        {/* GRUPO: STATUS */}
        <div className="flex flex-row items-center gap-2 py-2 px-6">
          <label className="flex items-center gap-2 select-none text-xs font-semibold text-muted-foreground tracking-wide uppercase whitespace-nowrap">
            Status
          </label>
          <div
            className="flex flex-row items-center gap-1 bg-muted/50 rounded-lg h-9"
            role="tablist"
          >
            <button
              type="button"
              onClick={() => setStatusFilter("Todos")}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer",
                statusFilter === "Todos"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "px-6 py-2 text-sm font-medium rounded-md transition-all inline-flex items-center gap-2 justify-center whitespace-nowrap cursor-pointer",
                    statusFilter !== "Todos"
                      ? "bg-purple-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={statusFilter}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {statusFilter === "Todos" ? "Filtrar" : statusFilter}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </PopoverTrigger>
              <PopoverContent variant="toolbar" align="start" className="w-10">
                <div
                  className="space-y-1"
                  role="radiogroup"
                  aria-label="Select status"
                >
                  {[
                    {
                      label: "All",
                      count: statusCounts?.total,
                      value: "Todos",
                    },
                    {
                      label: "Abertos",
                      count: statusCounts.abertos,
                      value: "Abertos",
                    },
                    {
                      label: "Em Análise",
                      count: statusCounts.emAnalise,
                      value: "Em Análise",
                    },
                    {
                      label: "Em Andamento",
                      count: statusCounts.andamento,
                      value: "Em Andamento",
                    },
                    {
                      label: "Aguardando Usuário",
                      count: statusCounts.aguardandoUsuario,
                      value: "Aguardando Usuário",
                    },
                    {
                      label: "Resolvidos",
                      count: statusCounts.resolvidos,
                      value: "Resolvidos",
                    },
                    {
                      label: "Fechados",
                      count: statusCounts.fechados,
                      value: "Fechados",
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setStatusFilter(item.value)}
                      role="radio"
                      aria-checked={statusFilter === item.value}
                      className={cn(
                        "w-full px-2 py-1.5 text-sm rounded-md text-left transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:outline-none flex items-center justify-between font-normal",
                        statusFilter === item.value
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                      {item.count !== undefined && (
                        <span className="text-[11px] opacity-70">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* LIMPAR FILTROS */}
        {hasActiveFilters && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mr-2 inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <PiFunnelX className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpar Filtros</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </motion.div>
    </div>
  );
};
