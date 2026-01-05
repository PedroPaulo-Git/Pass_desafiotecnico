"use client";
import React from "react";
import { LayoutGrid, List, Columns, Bot } from "lucide-react";
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
import { motion, Transition } from "framer-motion";
import ButtonBot from "../ui/ButtonBot";

interface ToolbarProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
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

const springConfig = {
  type: "spring" as const,
  stiffness: 600,
  damping: 30,
  mass: 1,
};

export const Toolbar: React.FC<ToolbarProps> = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  statusCounts,
  viewMode,
  setViewMode,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <motion.div
      layout
      transition={springConfig}
      className="flex flex-row items-center gap-2"
      style={{ transformOrigin: "50% 50% 0px" }}
    >
      {/* GRUPO: AÇÕES */}
      <div className="flex items-center">
        <label className="flex items-center gap-2 select-none text-xs font-semibold text-muted-foreground tracking-wide uppercase whitespace-nowrap ml-2 mr-2">
          Ações
        </label>
        <div className="flex flex-row items-center gap-1 bg-muted/50 rounded-lg h-9 p-1 mr-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonBot tooltip={true} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Automações AI</p>
              </TooltipContent>
            </Tooltip>

            <div className="shrink-0 h-4 w-px bg-border/50 mx-0.5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  layout
                  transition={springConfig}
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-colors",
                    viewMode === "list"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  <List className="size-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lista</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  layout
                  transition={springConfig}
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-colors",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  <LayoutGrid className="size-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grade</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  layout
                  transition={springConfig}
                  type="button"
                  onClick={() => setViewMode("lanes")}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium cursor-pointer h-7 w-7 p-0 rounded-md focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-colors",
                    viewMode === "lanes"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  <Columns className="size-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kanban</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* GRUPO: PRIORIDADE */}
      <div className="flex items-center">
        <label className="flex items-center gap-2 select-none text-xs font-semibold text-muted-foreground tracking-wide uppercase whitespace-nowrap mr-2">
          Prioridade
        </label>
        <div
          className="flex flex-row items-center gap-1 bg-muted/50 rounded-lg h-9"
          role="tablist"
        >
          <motion.button
            layout
            transition={springConfig}
            type="button"
            onClick={() => setPriorityFilter("Todos")}
            className={cn(
              "px-6 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors",
              priorityFilter === "Todos"
                ? "bg-purple-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </motion.button>

          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                layout
                transition={springConfig}
                type="button"
                className={cn(
                  "px-6 py-2 text-sm font-medium rounded-md inline-flex items-center gap-2 justify-center whitespace-nowrap cursor-pointer min-w-[100px] outline-none transition-colors",
                  priorityFilter !== "Todos"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {priorityFilter === "Todos" ? "Filtrar" : priorityFilter}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent variant="toolbar" align="start" className="w-48">
              <div
                className="space-y-1"
                role="radiogroup"
                aria-label="Select priority"
              >
                {[
                  { label: "All", value: "Todos" },
                  { label: "Baixa", value: "Baixa" },
                  { label: "Média", value: "Média" },
                  { label: "Alta", value: "Alta" },
                  { label: "Crítica", value: "Crítica" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setPriorityFilter(item.value)}
                    role="radio"
                    aria-checked={priorityFilter === item.value}
                    className={cn(
                      "w-full px-2 py-1.5 text-sm rounded-md text-left transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:outline-none flex items-center justify-between font-normal",
                      priorityFilter === item.value
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
          <motion.button
            layout
            transition={springConfig}
            type="button"
            onClick={() => setStatusFilter("Todos")}
            className={cn(
              "px-6 py-2 text-sm font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors",
              statusFilter === "Todos"
                ? "bg-purple-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </motion.button>

          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                layout
                transition={springConfig}
                type="button"
                className={cn(
                  "px-6 py-2 text-sm font-medium rounded-md inline-flex items-center gap-2 justify-center whitespace-nowrap cursor-pointer min-w-[100px] outline-none transition-colors",
                  statusFilter !== "Todos"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {statusFilter === "Todos" ? "Filtrar" : statusFilter}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent variant="toolbar" align="start" className="w-48">
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
              <motion.button
                layout
                transition={springConfig}
                type="button"
                onClick={onClearFilters}
                className="mr-2 inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <PiFunnelX className="size-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpar Filtros</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </motion.div>
  );
};
