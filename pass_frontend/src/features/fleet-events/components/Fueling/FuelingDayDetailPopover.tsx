"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Fueling, FuelType } from "@/types/vehicle";
import { format } from "date-fns";
import { Fuel, Pencil, Trash2, X, Check } from "lucide-react";
import { useUpdateFueling, useDeleteFueling } from "@/features/fleet-events/hooks/use-fuelings";
import { toast as sonnerToast } from "sonner";

// Day detail popover component
interface DayDetailPopoverProps {
  date: Date;
  fuelings: Fueling[];
  formatCurrency: (value: number) => string;
  t: any;
  onRefetch?: () => void;
}

const FUEL_TYPES: FuelType[] = ["DIESEL", "DIESEL_S10", "GASOLINA", "ETANOL", "ARLA32"];

export function DayDetailPopover({
  date,
  fuelings,
  formatCurrency,
  t,
  onRefetch,
}: DayDetailPopoverProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Fueling>>({});
  
  const updateFueling = useUpdateFueling();
  const deleteFueling = useDeleteFueling();

  const isUpdating = (updateFueling as any).isPending ?? (updateFueling as any).isLoading;
  const isDeleting = (deleteFueling as any).isPending ?? (deleteFueling as any).isLoading;

  const handleEdit = (fueling: Fueling) => {
    setEditingId(fueling.id);
    setEditData({
      liters: fueling.liters,
      totalValue: fueling.totalValue,
      odometer: fueling.odometer,
      fuelType: fueling.fuelType,
      provider: fueling.provider,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (fuelingId: string) => {
    try {
      await updateFueling.mutateAsync({
        id: fuelingId,
        data: editData,
      });
      sonnerToast.success("Abastecimento atualizado!");
      setEditingId(null);
      setEditData({});
      onRefetch?.();
    } catch (err: any) {
      sonnerToast.error(err?.message || "Erro ao atualizar");
    }
  };

  const handleDelete = async (fuelingId: string) => {
    if (!confirm("Tem certeza que deseja excluir este abastecimento?")) return;
    
    try {
      await deleteFueling.mutateAsync(fuelingId);
      sonnerToast.success("Abastecimento excluído!");
      onRefetch?.();
    } catch (err: any) {
      sonnerToast.error(err?.message || "Erro ao excluir");
    }
  };

  if (fuelings.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Nenhum abastecimento</p>
        <p className="text-xs mt-1">{format(date, "dd/MM/yyyy")}</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background">
        <span className="text-sm font-medium flex items-center gap-2">
          <Fuel className="h-4 w-4" />
          Abastecimentos
        </span>
        <Badge variant="secondary">{format(date, "dd/MM/yyyy")}</Badge>
      </div>

      {/* Fueling list */}
      <div className="p-3 space-y-2">
        {fuelings.map((fueling, idx) => {
          const isEditing = editingId === fueling.id;
          
          return (
            <Card key={fueling.id || idx} className="p-3">
              {isEditing ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Select
                      value={editData.fuelType || fueling.fuelType}
                      onValueChange={(value) => setEditData({ ...editData, fuelType: value as FuelType })}
                    >
                      <SelectTrigger className="h-7 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-600"
                        onClick={() => handleSaveEdit(fueling.id)}
                        disabled={isUpdating}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Litros</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-7 text-xs"
                        value={editData.liters ?? ""}
                        onChange={(e) => setEditData({ ...editData, liters: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Valor</label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-7 text-xs"
                        value={editData.totalValue ?? ""}
                        onChange={(e) => setEditData({ ...editData, totalValue: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">KM</label>
                      <Input
                        type="number"
                        className="h-7 text-xs"
                        value={editData.odometer ?? ""}
                        onChange={(e) => setEditData({ ...editData, odometer: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Posto</label>
                      <Input
                        type="text"
                        className="h-7 text-xs"
                        value={editData.provider ?? ""}
                        onChange={(e) => setEditData({ ...editData, provider: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{fueling.fuelType}</Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground mr-2">
                        {format(new Date(fueling.date), "HH:mm")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(fueling)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDelete(fueling.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Litros:</span>
                      <span className="ml-1 font-medium">{fueling.liters}L</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(fueling.totalValue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">KM:</span>
                      <span className="ml-1 font-medium">
                        {fueling.odometer?.toLocaleString("pt-BR") || "-"}
                      </span>
                    </div>
                    {fueling.provider && (
                      <div>
                        <span className="text-muted-foreground">Posto:</span>
                        <span className="ml-1 font-medium">{fueling.provider}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer summary */}
      <Separator />
      <div className="px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total do dia:</span>
          <span className="font-medium">
            {fuelings.reduce((acc, f) => acc + (f.liters || 0), 0).toFixed(1)}L
            -{" "}
            {formatCurrency(
              fuelings.reduce((acc, f) => acc + (f.totalValue || 0), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}