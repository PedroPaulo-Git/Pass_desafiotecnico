"use client";
import React from "react";
import { LayoutGrid, List, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

export const Toolbar: React.FC<ToolbarProps> = ({
  statusFilter,
  setStatusFilter,
  statusCounts,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
      {/* Abas de Status */}
      <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-border overflow-x-auto max-w-full">
        <Button
          variant="ghost"
          className={`h-8 text-xs ${
            statusFilter === "Todos"
              ? "bg-muted text-foreground"
              : "text-foreground"
          } shadow-sm font-medium rounded-md`}
          onClick={() => setStatusFilter("Todos")}
        >
          Todos{" "}
          <span className="ml-2 bg-border px-1.5 py-0.5 rounded-full text-[10px]">
            {statusCounts?.total}
          </span>
        </Button>
        <Button
          variant="ghost"
          className={`h-8 text-xs ${
            statusFilter === "Abertos"
              ? "bg-muted text-foreground"
              : "text-foreground"
          } hover:bg-border`}
          onClick={() => setStatusFilter("Abertos")}
        >
          Abertos{" "}
          <span className="ml-2 bg-border px-1.5 py-0.5 rounded-full text-[10px]">
            {statusCounts.abertos}
          </span>
        </Button>
        <Button
          variant="ghost"
          className={`h-8 text-xs ${
            statusFilter === "Em Andamento"
              ? "bg-muted text-foreground"
              : "text-foreground"
          } hover:text-purple-400 hover:bg-border`}
          onClick={() => setStatusFilter("Em Andamento")}
        >
          Em Andamento{" "}
          <span className="ml-2 bg-purple-200 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-full text-[10px]">
            {statusCounts.andamento}
          </span>
        </Button>
        <Button
          variant="ghost"
          className={`h-8 text-xs ${
            statusFilter === "Resolvidos"
              ? "bg-muted text-foreground"
              : "text-foreground"
          } hover:text-emerald-400 hover:bg-border`}
          onClick={() => setStatusFilter("Resolvidos")}
        >
          Resolvidos{" "}
          <span className="ml-2 bg-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full text-[10px]">
            {statusCounts.resolvidos}
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-foreground/90 text-xs">
          Ordenação:{" "}
          <span className="text-foreground/50 font-medium">Mais Recentes</span>
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
    </div>
  );
};