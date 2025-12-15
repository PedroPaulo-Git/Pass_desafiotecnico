"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateIncidentInput, createIncidentInputSchema } from "@pass/schemas";
import {
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react";
import { MdUploadFile } from "react-icons/md";
import { RiAlertLine } from "react-icons/ri";
import { toast as sonnerToast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useCreateIncident } from "@/features/fleet-events/hooks/use-incidents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
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
import type { SeverityLevel } from "@/types/vehicle";

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

export function IncidentModal() {
  const { t } = useI18n();
  const { data, closeModal, isOpen } = useModalStore();
  const vehicleId = data.vehicleId as string;

  const [generalOpen, setGeneralOpen] = useState(true);
  const [attachmentOpen, setAttachmentOpen] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentInputSchema),
    defaultValues: {},
  });

  const createIncident = useCreateIncident();

  const onSubmit = async (formData: CreateIncidentInput) => {
    try {
      await createIncident.mutateAsync({ ...formData, date: formData.date.toISOString(), vehicleId });

      sonnerToast.success(
        t.incidents.messages.createdSuccess ||
          t.common.success ||
          "Registro criado com sucesso"
      );
      closeModal();
    } catch (err: any) {
      const apiData = err?.response?.data;
      if (apiData) {
        const message =
          apiData.message || apiData.error || JSON.stringify(apiData);
        sonnerToast.error(
          message || (t.incidents.messages.saveError ?? "Erro ao salvar")
        );
      } else {
        const message =
          err?.message ?? t.incidents.messages.saveError ?? "Erro ao salvar";
        sonnerToast.error(message);
      }
    }
  };

  // handle react-query state differences across versions
  const isCreatingIncident =
    typeof (createIncident as any).isPending !== "undefined"
      ? (createIncident as any).isPending
      : Boolean((createIncident as any).isLoading);

  const severityLevels: SeverityLevel[] = ["BAIXA", "MEDIA", "ALTA", "GRAVE"];
  const classifications = ["MULTA", "ACIDENTE", "AVARIA", "ROUBO", "OUTROS"];

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent showCloseButton={false} showCloseButtonClean={true} className="w-full max-w-xl p-0 pt-2 rounded-2xl">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-2 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <RiAlertLine className="h-5 w-5 text-muted-foreground " />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {t.incidents.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {t.incidents.subtitle}
                  </p>
                </div>
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
                    className="w-full flex items-center justify-between p-4 pt-8 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4.5 w-4.5" />
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
                    {/* Row 1: Classification, Severity */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mt-auto">
                        <Select
                          value={watch("classification")}
                          onValueChange={(value) =>
                            setValue("classification", value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={
                                t.incidents.classification +
                                  "\u00A0\u00A0\u00A0" +
                                  "(#1104)" || "Nome do posto"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {classifications.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {cls}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.classification?.message && (
                          <span className="text-xs text-destructive">
                            {String(errors.classification.message)}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        <Select
                          value={watch("severity")}
                          onValueChange={(value) =>
                            setValue("severity", value as SeverityLevel)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={
                                "Nivel " +
                                  t.incidents.severity +
                                  "\u00A0\u00A0\u00A0" +
                                  "(#1103)" || "Nome do posto"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {severityLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {t.severity[level]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Date, Record */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mt-auto">
                        <Controller
                          control={control}
                          name="date"
                          render={({ field }) => (
                            <DatePicker
                              date={field.value ? new Date(field.value) : undefined}
                              onDateChange={field.onChange}
                              placeholder={t.incidents.date || "Selecione a data"}
                              className="w-full"
                              variant="modal"
                            />
                          )}
                        />
                      </div>
                      <div className="mt-auto">
                        <Input
                          {...register("title")}
                          placeholder={
                            `${t.incidents.record}  ` || "Registro e Ocorrência"
                          }
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Textarea
                        variant="underlined"
                        {...register("description")}
                        placeholder={
                          t.incidents.description || "Descreva a ocorrência..."
                        }
                        className="min-h-28"
                      />
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Anexo */}
            <Collapsible open={attachmentOpen} onOpenChange={setAttachmentOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MdUploadFile className="h-5 w-5 " />
                      <span className="font-semibold">
                        {t.incidents.attachment}
                      </span>
                    </div>
                    {attachmentOpen ? (
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
                    <div className="border-2 border-dashed border-muted-foreground rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
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
             <div className="flex justify-between gap-3 pt-4 px-4">
                          <Button
                            // variant="secondary"
                            variant="outline"
                            type="button"
                            size="sm"
                            className="w-28"
                            onClick={closeModal}
                          >
                            {t.common.close}
                          </Button>
                          <Button
                            variant="modal"
                            type="submit"
                            className="w-28"
                            disabled={isCreatingIncident}
                          >
                            {isCreatingIncident ? t.common.loading : t.common.register}
                          </Button>
                        </div>
           
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default IncidentModal;
