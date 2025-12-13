"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { Fuel, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCreateFueling } from "@/features/fleet-events/hooks/use-fuelings";
import { useVehicle } from "@/features/vehicles/hooks/use-vehicles";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomForm } from "@/components/ui/custom-form";
import type { FuelType } from "@/types/vehicle";

interface InlineFuelingFormProps {
  vehicleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function InlineFuelingForm({
  vehicleId,
  onClose,
  onSuccess,
}: InlineFuelingFormProps) {
  const { t } = useI18n();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<CreateFuelingInput>({
    resolver: zodResolver(createFuelingSchema),
    mode: "onSubmit",
    defaultValues: {
      provider: "",
      fuelType: undefined,
      odometer: 0,
      liters: 0,
      totalValue: 0,
      unitPrice: 0,
      date: new Date(),
    },
  });

  const createFueling = useCreateFueling();
  const vehicleQuery = useVehicle(vehicleId);

  useEffect(() => {
    if (vehicleQuery.data) {
      const km = vehicleQuery.data.currentKm;
      if (km !== undefined && km !== null) {
        setValue("odometer", Number(km));
      }

      if (vehicleQuery.data.fuelType) {
        setValue("fuelType", vehicleQuery.data.fuelType as FuelType);
      }
    }
  }, [vehicleQuery.data, setValue]);

  const onSubmit = async (formData: CreateFuelingInput) => {
    try {
      const litersNumber = Number(formData.liters);
      const totalValueNumber = Number(formData.totalValue);
      const odometerNumber = Number(formData.odometer);

      if (!litersNumber || !totalValueNumber) {
        sonnerToast.error("Preencha litros e valor corretamente");
        return;
      }

      const payload = {
        ...formData,
        vehicleId,
        odometer: odometerNumber,
        liters: litersNumber,
        totalValue: totalValueNumber,
        unitPrice: totalValueNumber / litersNumber,
      };

      console.log("🚀 ENVIANDO:", payload);
      await createFueling.mutateAsync(payload);

      sonnerToast.success("Abastecimento registrado com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const apiData = err?.response?.data;
      const message = apiData?.message || apiData?.error || "Erro ao salvar";
      sonnerToast.error(message);
    }
  };

  const fuelTypes: FuelType[] = [
    "DIESEL",
    "DIESEL_S10",
    "GASOLINA",
    "ETANOL",
    "ARLA32",
  ];

  // Função de submit que chama o react-hook-form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Chama o submit do react-hook-form
    await handleSubmit(onSubmit)();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Fuel className="h-4 w-4" />
          Novo Abastecimento
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CustomForm className="space-y-3">
        {/* Posto */}
        <div>
          <label className="text-xs text-muted-foreground">Posto</label>
          <Controller
            control={control}
            name="provider"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Selecione o posto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ipiranga">Ipiranga</SelectItem>
                  <SelectItem value="Shell">Shell</SelectItem>
                  <SelectItem value="Petrobras">Petrobras</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Combustível */}
        <div>
          <label className="text-xs text-muted-foreground">Combustível</label>
          <Controller
            control={control}
            name="fuelType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Data */}
        <div>
          <label className="text-xs text-muted-foreground">Data</label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Input
                type="date"
                className="h-8"
                value={
                  field.value instanceof Date
                    ? field.value.toISOString().split("T")[0]
                    : field.value
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>

        {/* LITROS E VALOR */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Litros</label>
            <Controller
              control={control}
              name="liters"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-8"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? 0
                        : parseFloat(e.target.value) || 0;
                    field.onChange(value);
                  }}
                />
              )}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Valor Total</label>
            <Controller
              control={control}
              name="totalValue"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-8"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? 0
                        : parseFloat(e.target.value) || 0;
                    field.onChange(value);
                  }}
                />
              )}
            />
          </div>
        </div>

        {/* KM Atual */}
        <div>
          <label className="text-xs text-muted-foreground">KM Atual</label>
          <Controller
            control={control}
            name="odometer"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="KM"
                className="h-8"
                value={field.value === 0 ? "" : field.value}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                  field.onChange(value);
                }}
              />
            )}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-8"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button" // MUDEI PARA "button"
            className="flex-1 h-8"
            disabled={isSubmitting || createFueling.isPending}
            onClick={() => {
              // Chama o submit do react-hook-form diretamente
              handleSubmit(onSubmit)();
            }}
          >
            {createFueling.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CustomForm>
    </div>
  );
}
