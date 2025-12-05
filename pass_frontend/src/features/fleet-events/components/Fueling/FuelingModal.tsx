"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { Fuel, Info, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { FaRegListAlt } from "react-icons/fa";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import {
  useCreateFueling,
  useFuelings,
} from "@/features/fleet-events/hooks/use-fuelings";
import { useVehicle } from "@/features/vehicles/hooks/use-vehicles";
import { toast as sonnerToast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { FuelType } from "@/types/vehicle";
import { get } from "http";

type FuelingFormData = CreateFuelingInput;

const modalVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export function FuelingModal() {
  const { t } = useI18n();
  const { data, closeModal, isOpen } = useModalStore();
  const vehicleId = data.vehicleId as string;

  const [generalOpen, setGeneralOpen] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(true);
  const [odometer, setOdometer] = useState<number | undefined>(undefined);

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
      fuelType: "DIESEL",
      // `odometer` default will be set from vehicle.currentKm when available
      odometer: undefined as unknown as number,
      liters: undefined as unknown as number,
      totalValue: undefined as unknown as number,
      unitPrice: 0,
    },
  });

  const createFueling = useCreateFueling();
  const vehicleQuery = useVehicle(vehicleId);
  const getFuelings = useFuelings({ vehicleId });

  // When vehicle data loads, set default odometer to vehicle.currentKm (last odometer)
  useEffect(() => {
    const km = vehicleQuery?.data?.currentKm;
    if (km !== undefined && km !== null) {
      setValue("odometer", Number(km));
    }
    const previousOdometer = getFuelings?.data?.items?.[0]?.odometer;
    setOdometer(previousOdometer);
  }, [vehicleQuery?.data?.currentKm, getFuelings?.data, setValue]);

  const onSubmit = async (formData: CreateFuelingInput) => {
    // Simple client-side validations
    if (!formData.totalValue || Number(formData.totalValue) < 1) {
      sonnerToast.error(
        t.fueling.messages.totalValueMin || "Valor total inválido"
      );
      return;
    }
    if (!formData.liters || Number(formData.liters) < 1) {
      sonnerToast.error(t.fueling.messages.litersMin || "Litros inválidos");
      return;
    }

    try {
      // compute odometer value to send:
      // Treat `odometerStop` as an absolute KM (replacement). It must not be smaller than vehicle.currentKm.
      const odometerStop = Number(formData.odometer) || 0;
      const currentKm = vehicleQuery?.data?.currentKm;
      if (currentKm !== undefined && odometerStop < currentKm) {
        sonnerToast.error(
          "KM de parada não pode ser menor que o KM atual do veículo"
        );
        return;
      }

      let payload: any = { ...formData, vehicleId, odometer: odometerStop };

      await createFueling.mutateAsync(payload);

      sonnerToast.success(
        t.fueling.messages.createdSuccess ||
          t.common.success ||
          "Registro criado com sucesso"
      );
      closeModal();
    } catch (err: any) {
      // Better error extraction: API may return structured error
      const apiData = err?.response?.data;
      if (apiData) {
        const message =
          apiData.message || apiData.error || JSON.stringify(apiData);
        sonnerToast.error(
          message || (t.fueling.messages.saveError ?? "Erro ao salvar")
        );
      } else {
        const message =
          err?.message ?? t.fueling.messages.saveError ?? "Erro ao salvar";
        sonnerToast.error(message);
      }
    }
  };

  // keep unitPrice in the form data for schema compatibility but don't expose it in the UI

  // handle react-query state differences across versions
  const isCreatingFueling =
    typeof (createFueling as any).isPending !== "undefined"
      ? (createFueling as any).isPending
      : Boolean((createFueling as any).isLoading);

  const fuelTypes: FuelType[] = [
    "DIESEL",
    "DIESEL_S10",
    "GASOLINA",
    "ETANOL",
    "ARLA32",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="w-full max-w-3xl p-0">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-24 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <BsFillFuelPumpFill className="h-4 w-4 text-foreground" />
                </div>
                <DialogTitle className="text-lg font-semibold">
                  {t.fueling.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-2 py-4 space-y-4"
          >
            {/* Dados Gerais */}
            <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4  transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 " />
                      <span className="font-semibold">
                        {t.vehicles.generalData}
                      </span>
                    </div>
                    {generalOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 pt-0 space-y-4"
                  >
                    {/* Row 1: Fuel Station */}
                    <div>
                      <Select
                        value={watch("provider") ?? ""}
                        onValueChange={(value) => setValue("provider", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue
                            placeholder={
                              t.fueling.fuelStation +
                                "\u00A0\u00A0\u00A0" +
                                "(#18098)" || "Nome do posto"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Posto Central (#18098)">
                            Posto Central (#18098)
                          </SelectItem>
                          <SelectItem value="Posto Sul (#18099)">
                            Posto Sul (#18099)
                          </SelectItem>
                          <SelectItem value="Posto Norte (#18100)">
                            Posto Norte (#18100)
                          </SelectItem>
                          <SelectItem value="Posto Estação (#18097)">
                            Posto Estação (#18097)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.provider?.message && (
                        <span className="text-xs text-destructive">
                          {String(errors.provider.message)}
                        </span>
                      )}
                    </div>

                    {/* Row 2: KM, KM Stop */}
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.odometer}
                        </label>
                        <Input
                          type="number"
                          placeholder="30.000"
                          value={odometer ?? ""}
                          disabled
                          className="h-9"
                        />
                      </div>
                      <div className="mt-auto">
                        <Controller
                          control={control}
                          name="odometer"
                          render={({ field }) => (
                            <Input
                              placeholder={
                                t.fueling.odometerStop || "KM de Parada"
                              }
                              type="number"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(
                                  v === "" ? undefined : Number(v)
                                );
                              }}
                              onBlur={field.onBlur}
                              className="h-9"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.fuelType}{" "}
                          <span className="text-muted-foreground">(#1337)</span>
                        </label>
                        <Select
                          value={watch("fuelType")}
                          onValueChange={(value) =>
                            setValue("fuelType", value as FuelType)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fuelTypes.map((fuel) => (
                              <SelectItem key={fuel} value={fuel}>
                                {t.fuelTypes[fuel]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-auto">
                        <Controller
                          control={control}
                          name="liters"
                          render={({ field }) => (
                            <Input
                              placeholder={
                                t.fueling.quantity || "Quantidade de Litros"
                              }
                              type="number"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(
                                  v === "" ? undefined : Number(v)
                                );
                              }}
                              onBlur={field.onBlur}
                              className="h-9"
                            />
                          )}
                        />
                      </div>
                    </div>
                    {/* Row 4: Date, Total Value */}
                    <div className="grid grid-cols-2 gap-4 mt-10">
                      <div className="mt-auto">
                        <Controller
                          control={control}
                          name="date"
                          render={({ field }) => {
                            // Convert Date to string for input, and string to Date for form
                            const stringValue =
                              field.value instanceof Date
                                ? field.value.toISOString().split("T")[0]
                                : (field.value as string) ?? "";
                            return (
                              <Input
                                type={stringValue ? "date" : "text"}
                                placeholder={t.fueling.date || "Data"}
                                value={stringValue}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  field.onChange(v ? new Date(v) : undefined);
                                }}
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => {
                                  if (!e.target.value) e.target.type = "text";
                                  field.onBlur();
                                }}
                                className="h-9"
                              />
                            );
                          }}
                        />
                      </div>
                      <div className="mt-auto">
                        <Input
                          type="number"
                          placeholder={` ${t.fueling.totalValue}`}
                          step="0.01"
                          {...register("totalValue", { valueAsNumber: true })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Unit Price (hidden) kept for schema compatibility */}
                    <input
                      type="hidden"
                      {...register("unitPrice", { valueAsNumber: true })}
                    />
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Comprovante */}
            <Collapsible open={receiptOpen} onOpenChange={setReceiptOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4  transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FaRegListAlt className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{t.fueling.receipt}</span>
                    </div>
                    {receiptOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 pt-0"
                  >
                    <div className="relative border-2 border-dashed border-muted-foreground rounded-sm p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Info className="h-4.5 w-4.5 text-muted-foreground mb-2 absolute top-3 right-3" />
                      <p className="text-md text-muted-foreground">
                        {t.common.uploadFiles}
                      </p>
                      <p className="text-md text-muted-foreground">
                        {t.common.dragDrop}
                      </p>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Footer */}
            <div className="flex justify-center gap-3 pt-4 pb-4">
              <Button
                type="button"
                variant="modal_white"
                size="modal"
                onClick={closeModal}
              >
                {t.common.close}
              </Button>
              <Button
                type="submit"
                variant="modal"
                size="modal"
                disabled={isCreatingFueling}
              >
                {isCreatingFueling ? t.common.loading : t.common.register}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default FuelingModal;
