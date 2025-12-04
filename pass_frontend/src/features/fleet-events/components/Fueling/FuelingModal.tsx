"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { Fuel, Info, ChevronDown, ChevronUp, Upload } from "lucide-react";
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
    formState: { errors },
  } = useForm<CreateFuelingInput>({
    resolver: zodResolver(createFuelingSchema),
    defaultValues: {
      fuelType: "DIESEL",
      // `odometer` default will be set from vehicle.currentKm when available
      odometer: undefined as unknown as number,
      liters: 0,
      totalValue: 0,
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
      <DialogContent className="max-w-lg p-0">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Fuel className="h-5 w-5 text-foreground" />
                </div>
                <DialogTitle className="text-lg font-semibold">
                  {t.fueling.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-4 space-y-4"
          >
            {/* Dados Gerais */}
            <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
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
                      <label className="text-xs text-muted-foreground">
                        {t.fueling.fuelStation}{" "}
                        <span className="text-muted-foreground">(#18098)</span>
                      </label>
                      <Input
                        {...register("provider")}
                        placeholder="Nome do posto"
                        className="h-9"
                      />
                      {errors.provider?.message && (
                        <span className="text-xs text-destructive">
                          {String(errors.provider.message)}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        KM Atual do Veículo
                      </label>
                      <Input
                        value={vehicleQuery?.data?.currentKm ?? ""}
                        disabled
                        className="h-9"
                      />
                    </div>
                    {/* Row 2: KM, KM Stop */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.odometer}
                        </label>
                        <Input
                          type="number"
                          placeholder=""
                          value={odometer ?? ""}
                          disabled
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.odometerStop}
                        </label>
                        <Input
                          type="number"
                          {...register("odometer", { valueAsNumber: true })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Row 3: Fuel Type, Liters */}
                    <div className="grid grid-cols-2 gap-4">
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
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.quantity}
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register("liters", { valueAsNumber: true })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Row 4: Date, Total Value */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.date}
                        </label>
                        <Input
                          type="date"
                          {...register("date")}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t.fueling.totalValue}
                        </label>
                        <Input
                          type="number"
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
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{t.fueling.receipt}</span>
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
                    <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <Info className="h-6 w-6 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t.common.uploadFiles}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.common.dragDrop}
                      </p>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                {t.common.close}
              </Button>
              <Button type="submit" disabled={isCreatingFueling}>
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
