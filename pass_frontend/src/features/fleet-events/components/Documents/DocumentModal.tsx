"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateVehicleDocumentInput,
  createVehicleDocumentSchema,
} from "@pass/schemas";
import { FileText, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useCreateVehicleDocument } from "@/features/fleet-events/hooks/use-vehicle-documents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

export function DocumentModal() {
  const { t } = useI18n();
  const { data, closeModal, isOpen } = useModalStore();
  const vehicleId = data.vehicleId as string;

  const [generalOpen, setGeneralOpen] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateVehicleDocumentInput>({
    resolver: zodResolver(createVehicleDocumentSchema),
    defaultValues: {
      activeAlert: true,
      alertDays: 30,
    },
  });

  const createDocument = useCreateVehicleDocument();

  const onSubmit = async (formData: CreateVehicleDocumentInput) => {
    // Validate expiry date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(formData.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    if (expiry < today) {
      sonnerToast.error(t.documents.invalidExpiryDate);
      return;
    }

    await createDocument.mutateAsync({
      ...formData,
      expiryDate: formData.expiryDate.toISOString(),
      vehicleId,
    });
    sonnerToast.success(t.common.success || "Documento criado com sucesso!");
    closeModal();
  };

  // react-query v4/v5 differences: prefer `isPending`, fall back to `isLoading` when present
  const isCreatingDocument =
    typeof (createDocument as any).isPending !== "undefined"
      ? (createDocument as any).isPending
      : Boolean((createDocument as any).isLoading);

  const documentTypes = [
    "Tacógrafo",
    "Licenciamento",
    "IPVA",
    "Seguro",
    "CRLV",
    "Vistoria",
    "Outro",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        showCloseButton={false}
        showCloseButtonClean={true}
        className="w-full max-w-3xl p-0"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-6 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {t.documents.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Novo documento
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-4 space-y-4"
          >
            {/* Dados do Documento */}
            <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 transition-colors"
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
                    {/* Document Name */}
                    <div className="mt-auto">
                      <Input
                        {...register("name")}
                        placeholder={` ${t.documents.name}` || "Documento"}
                        className="h-9"
                        list="document-types"
                      />
                      <datalist id="document-types">
                        {documentTypes.map((type) => (
                          <option key={type} value={type} />
                        ))}
                      </datalist>
                      {errors.name?.message && (
                        <span className="text-xs text-destructive">
                          {String(errors.name.message)}
                        </span>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {t.documents.expiryDate}
                      </label>
                      <Controller
                        control={control}
                        name="expiryDate"
                        render={({ field }) => (
                          <DatePicker
                            date={
                              field.value ? new Date(field.value) : undefined
                            }
                            onDateChange={field.onChange}
                            placeholder="Selecione a data"
                            className="w-full"
                            variant="modal"
                          />
                        )}
                      />
                      {errors.expiryDate?.message && (
                        <span className="text-xs text-destructive">
                          {String(errors.expiryDate.message)}
                        </span>
                      )}
                    </div>

                    {/* Alert Days */}
                    <div>
                      <label className="text-xs text-muted-foreground">
                        {t.documents.alertDays}
                      </label>
                      <Input
                        variant="number-border"
                        type="number"
                        {...register("alertDays", { valueAsNumber: true })}
                        placeholder="30"
                        className="h-9"
                      />
                    </div>

                    {/* Active Alert */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm">
                        {t.documents.activeAlert}
                      </label>
                      <Switch
                        checked={watch("activeAlert")}
                        onCheckedChange={(checked) =>
                          setValue("activeAlert", checked)
                        }
                      />
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Footer */}
            <div className="flex justify-between gap-3 pt-4">
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
                disabled={isCreatingDocument}
              >
                {isCreatingDocument ? t.common.loading : t.common.register}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentModal;
