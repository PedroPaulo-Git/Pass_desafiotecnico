"use client";

import {
  Filter,
  Building2,
  Plus,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Profile } from "../types";

interface TableHeaderSectionProps {
  filteredPeriodsCount: number;
  selectedProfile: Profile;
  onToggleSidebar?: () => void;
  onOpenProfileModal: () => void;
  onAddNew: () => void;
}

export function TableHeaderSection({
  filteredPeriodsCount,
  selectedProfile,
  onToggleSidebar,
  onOpenProfileModal,
  onAddNew,
}: TableHeaderSectionProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
      {/* Left side - Panel Toggle & Title */}
      <div className="flex items-center gap-4">
        <div  onClick={onToggleSidebar} className="flex items-center gap-2 hover:bg-muted/40 pl-1.5 pr-3 py-2.5 rounded-md outline-0 outline-border hover:outline-1 cursor-pointer">
          {onToggleSidebar && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
           
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}

          <div>
            <h3 className="font-semibold text-sm">
              Histórico de Abastecimentos
            </h3>
            <p className="text-xs text-muted-foreground">
              {filteredPeriodsCount} períodos
            </p>
          </div>
        </div>

        <div className="h-5 border-l border-border">
          <Separator orientation="vertical" className="max-h-5" />
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="gap-1.5 h-9"
          onClick={onOpenProfileModal}
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">{selectedProfile.name}</span>
        </Button>

        {/* Filters Button */}
        <Button
          type="button"
          variant="table_border_cutted"
          size="sm"
          className="gap-1.5 h-9"
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filtros</span>
        </Button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Add Button with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" className="gap-1.5 h-8">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Abastecimento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
