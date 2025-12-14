"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { toast as sonnerToast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";

import {
  useCreateFueling,
  useUpdateFueling,
} from "@/features/fleet-events/hooks/use-fuelings";
import { useVehicle } from "@/features/vehicles/hooks/use-vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { FuelType } from "@/types/vehicle";

import type { FuelingFormProps } from "../types";
import { FUEL_TYPE_LABELS, FUEL_TYPES, PROVIDERS } from "../constants";

export function FuelingForm({
  vehicleId,
  fueling,
  onClose,
  onSuccess,
}: FuelingFormProps) {
  const createFueling = useCreateFueling();
  const updateFueling = useUpdateFueling();
  const vehicleQuery = useVehicle(vehicleId);

  const isEdit = !!fueling;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateFuelingInput>({
    resolver: zodResolver(createFuelingSchema),
    defaultValues: {
      provider: fueling?.provider || "",
      fuelType: fueling?.fuelType || "DIESEL",
      odometer: fueling?.odometer ?? (undefined as unknown as number),
      liters: fueling?.liters ?? (undefined as unknown as number),
      totalValue: fueling?.totalValue ?? (undefined as unknown as number),
      unitPrice: fueling?.unitPrice ?? 0,
      date: fueling?.date ? new Date(fueling.date) : new Date(),
    },
  });

  // Set default odometer from vehicle if creating new
  useEffect(() => {
    if (!isEdit) {
      const km = vehicleQuery?.data?.currentKm;
      if (km !== undefined && km !== null) {
        setValue("odometer", Number(km));
      }
    }
  }, [vehicleQuery?.data?.currentKm, setValue, isEdit]);

  const onSubmit = async (formData: CreateFuelingInput) => {
    if (!formData.totalValue || Number(formData.totalValue) < 1) {
      sonnerToast.error("Valor total inválido");
      return;
    }
    if (!formData.liters || Number(formData.liters) < 1) {
      sonnerToast.error("Litros inválidos");
      return;
    }

    try {
      const odometerStop = Number(formData.odometer) || 0;
      const currentKm = vehicleQuery?.data?.currentKm;

      if (!isEdit && currentKm !== undefined && odometerStop < currentKm) {
        sonnerToast.error("KM de parada não pode ser menor que o KM atual");
        return;
      }

      if (isEdit && fueling) {
        await updateFueling.mutateAsync({
          id: fueling.id,
          data: {
            ...formData,
            date: formData.date.toISOString(),
            vehicleId,
            odometer: odometerStop,
          },
        });
        sonnerToast.success("Abastecimento atualizado com sucesso!");
      } else {
        const payload = { ...formData, date: formData.date.toISOString(), vehicleId, odometer: odometerStop };
        await createFueling.mutateAsync(payload);
        sonnerToast.success("Abastecimento criado com sucesso!");
      }
      onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao salvar";
      sonnerToast.error(message);
    }
  };

  const isSubmitting = createFueling.isPending || updateFueling.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" ">
      {/* Period Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Período</label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(new Date(field.value), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "Selecione um período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {/* Days selection (visual indicator) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Dias não aplicáveis</label>
        <div className="flex gap-1">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                "w-9 h-9 rounded-md text-sm font-medium border transition-colors",
                "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Todas
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                <CommandGroup>
                  <CommandItem>Todas</CommandItem>
                  <CommandItem>Leito</CommandItem>
                  <CommandItem>Cama</CommandItem>
                  <CommandItem>Executivo</CommandItem>
                  <CommandItem>Semi-leito</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Provider */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Posto</label>
        <Select
          value={watch("provider") ?? ""}
          onValueChange={(value) => setValue("provider", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o posto" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Combustível</label>
        <Select
          value={watch("fuelType") ?? "DIESEL"}
          onValueChange={(value) => setValue("fuelType", value as FuelType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUEL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {FUEL_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price fields grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Infantil</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Criança</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Adulto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Controller
              control={control}
              name="totalValue"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  className="pl-10"
                  placeholder="0.00"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Senior</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Liters and Odometer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Litros</label>
          <Controller
            control={control}
            name="liters"
            render={({ field }) => (
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 50"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">KM Atual</label>
          <Controller
            control={control}
            name="odometer"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="Ex: 50000"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>
      </div>

      {/* Min Pax */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Min Pax</label>
        <Input type="number" placeholder="0" defaultValue={0} />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Forma de Pagamento</label>
        <Select defaultValue="todas">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hidden unit price */}
      <input
        type="hidden"
        {...register("unitPrice", { valueAsNumber: true })}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
