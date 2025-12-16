"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { toast as sonnerToast } from "sonner";
import { CalendarIcon } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";

import type { FuelType } from "@/types/vehicle";

import type { FuelingFormProps } from "../types";
import { FUEL_TYPE_LABELS, FUEL_TYPES, PROVIDERS } from "../constants";
import { DayChip } from "./day-chip";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

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
    console.log("Botão Adicionar clicado");
    console.log("Erros do form:", errors);
    console.log("Valores do form:", watch());
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0] as any;
      sonnerToast.error(
        firstError?.message || "Preencha todos os campos obrigatórios"
      );
      return;
    }
    console.log("onSubmit chamado com formData:", formData);
    console.log("Validação: totalValue =", formData.totalValue);
    if (!formData.totalValue || Number(formData.totalValue) < 1) {
      console.log("Erro: Valor total inválido");
      sonnerToast.error("Valor total inválido");
      return;
    }
    console.log("Validação: liters =", formData.liters);
    if (!formData.liters || Number(formData.liters) < 1) {
      console.log("Erro: Litros inválidos");
      sonnerToast.error("Litros inválidos");
      return;
    }

    try {
      const odometerStop = Number(formData.odometer) || 0;
      const currentKm = vehicleQuery?.data?.currentKm;
      console.log("odometerStop =", odometerStop, "currentKm =", currentKm);

      if (!isEdit && currentKm !== undefined && odometerStop < currentKm) {
        console.log("Erro: KM menor que atual");
        sonnerToast.error("KM de parada não pode ser menor que o KM atual");
        return;
      }

      if (isEdit && fueling) {
        console.log("Editando fueling, id =", fueling.id);
        sonnerToast.loading("Salvando abastecimento...");
        await updateFueling.mutateAsync({
          id: fueling.id,
          data: {
            ...formData,
            date: formData.date.toISOString(),
            vehicleId,
            odometer: odometerStop,
          },
        });
        console.log("Update sucesso");
        sonnerToast.success("Abastecimento atualizado com sucesso!");
      } else {
        const payload = {
          ...formData,
          date: formData.date.toISOString(),
          vehicleId,
          odometer: odometerStop,
          periodo: customPeriod || undefined,
        };
        console.log("Criando fueling, payload =", payload);
        await createFueling.mutateAsync(payload);
        console.log("Create sucesso");
        sonnerToast.success("Abastecimento criado com sucesso!");
      }
      console.log("Chamando onSuccess");
      onSuccess();
    } catch (err: any) {
      console.log("Erro no submit:", err);
      const message =
        err?.response?.data?.message || err?.message || "Erro ao salvar";
      sonnerToast.error(message);
    }
  };

  const isSubmitting = createFueling.isPending || updateFueling.isPending;

  const [customPeriod, setCustomPeriod] = useState("");
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);

  // Prevenir reload da página ao submeter o form
  useEffect(() => {
    const handleGlobalSubmit = (e: Event) => {
      const target = e.target as HTMLElement;
      // Verifica se o target é um form dentro deste componente
      if (target.closest("form")) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" &&
        target.getAttribute("type") === "submit" &&
        target.closest("form")
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    document.addEventListener("submit", handleGlobalSubmit, true);
    document.addEventListener("click", handleButtonClick, true);

    return () => {
      document.removeEventListener("submit", handleGlobalSubmit, true);
      document.removeEventListener("click", handleButtonClick, true);
    };
  }, []);

  // Handler para interceptar o submit do form e fazer preventDefault
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handleFormSubmit chamado");
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className=" pr-2.5 sm:pr-0 min-w-[350px] sm:min-w-[550px] space-y-2"
    >
      <div className="py-3 text-sm border-b px-4">Adicionar Período</div>
      {/* Dias Selecionados (Apenas Visual) */}
      <div className="px-4 pb-2 space-y-2 ">
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 space-x-2 gap-2">
          {/* Período (Data) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium ml-1 ">
              Data do Abastecimento
            </label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onDateChange={field.onChange}
                  placeholder="Selecione a data"
                  className="w-full "
                  variant="modal"
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium ml-1">Dias da Semana</label>
            <div className="grid grid-cols-7 gap-4">
              {WEEK_DAYS.map((day, index) => (
                <DayChip
                  key={index}
                  day={day}
                  dayIndex={index}
                  isActive={selectedWeekDays.includes(index)}
                  onClick={() => {
                    setSelectedWeekDays((prev) =>
                      prev.includes(index)
                        ? prev.filter((d) => d !== index)
                        : [...prev, index]
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Posto */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium ml-1">Posto</label>
          <Select
          
            value={watch("provider") ?? ""}
            onValueChange={(value) => setValue("provider", value)}
          >
            <SelectTrigger variant="modal">
              <SelectValue placeholder="Selecione o posto" />
            </SelectTrigger>
            <SelectContent className="bg-background" showSearch={true}>
              {PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Combustível */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium ml-1">Combustível</label>
          <Select
            value={watch("fuelType") ?? "DIESEL"}
            onValueChange={(value) => setValue("fuelType", value as FuelType)}
          >
            <SelectTrigger variant="modal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background" showSearch={true}>
              {FUEL_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {FUEL_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Litros e Valor Total */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium ml-1 ">Litros</label>
            <Controller
              control={control}
              name="liters"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50"
                  value={field.value ?? ""}
                  variant="number-border"
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    field.onChange(value);
                    // Calcular unitPrice automaticamente
                    const totalValue = watch("totalValue");
                    if (value && totalValue) {
                      setValue("unitPrice", totalValue / value);
                    }
                  }}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium ml-1 ">
              Valor Total (R$)
            </label>
            <Controller
              control={control}
              name="totalValue"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 250.00"
                  value={field.value ?? ""}
                  variant="number-border"
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    field.onChange(value);
                    // Calcular unitPrice automaticamente
                    const liters = watch("liters");
                    if (liters && value) {
                      setValue("unitPrice", value / liters);
                    }
                  }}
                />
              )}
            />
          </div>
        </div>

        {/* KM Atual */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium ml-1 ">KM Atual</label>
          <Controller
            control={control}
            name="odometer"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="Ex: 50000"
                value={field.value ?? ""}
                variant="number-border"
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>

        {/* Hidden unit price */}
        <input
          type="hidden"
          {...register("unitPrice", { valueAsNumber: true })}
        />
      </div>
      {/* Actions */}
      <div className="flex justify-between py-4 px-4 border-t ">
        <Button
          type="button"
          variant="outline"
          className="flex-1 max-w-[100px]"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1  max-w-[100px]"
          disabled={isSubmitting}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
            console.log("handleSubmit executado");
          }}
        >
          {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
