"use client";

import { useState } from "react";
import { Filter, Building2, Plus, PanelLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownModal } from "@/components/ui/dropdown-menu";
import { FuelingForm } from "./fueling-form";
import type { Profile } from "../types";

interface TableHeaderSectionProps {
  filteredPeriodsCount: number;
  selectedProfile: Profile;
  vehicleId: string;
  onToggleSidebar?: () => void;
  onOpenProfileModal: () => void;
  onAddNew: () => void;
}

export function TableHeaderSection({
  filteredPeriodsCount,
  selectedProfile,
  vehicleId,
  onToggleSidebar,
  onOpenProfileModal,
  onAddNew,
}: TableHeaderSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
      {/* Left side - Panel Toggle & Title */}
      <div className="flex items-center gap-4">
        <div
          onClick={onToggleSidebar}
          className="flex items-center gap-2 hover:bg-muted/40 pl-1.5 pr-3 py-2.5 rounded-md outline-0 outline-border hover:outline-1 cursor-pointer"
        >
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
      <div className="flex items-center gap-2 relative">
        {/* Add Button */}
        <div className="flex rounded-md shadow-sm">
          <Button
            variant="default"
            size="default"
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-r-none border-r-0 pr-3"
          >
         
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-l-none  pl-2 pr-2 border-black"
            variant="default"
            size="default"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <DropdownModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          align="end"
          sideOffset={4}
        >
          <FuelingForm
            vehicleId={vehicleId}
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              onAddNew();
            }}
          />
        </DropdownModal>
      </div>
    </div>
  );
}
