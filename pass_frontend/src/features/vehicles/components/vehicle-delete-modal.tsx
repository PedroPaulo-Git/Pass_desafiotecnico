"use client";

import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useDeleteVehicle, useVehicle } from "../hooks/use-vehicles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";

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

export function ConfirmDeleteVehicleModal() {
  const { t } = useI18n();
  const { data, closeModal, isOpen } = useModalStore();
  const vehicleId = data.vehicleId as string | undefined;

  const deleteVehicle = useDeleteVehicle();
  const vehicle = useVehicle(vehicleId || "");
  const vehicleData = vehicle.data;
  const handletest = () => {
    console.log(vehicleData);
  };

  const handleConfirm = async () => {
    if (!vehicleId) {
      sonnerToast.error(t.vehicles.messages.deleteError || t.common.error);
      return;
    }

    try {
      await deleteVehicle.mutateAsync(vehicleId);
      sonnerToast.success(
        t.vehicles.messages.deletedSuccess || t.common.success
      );
      if (typeof data.onConfirm === "function") {
        try {
          data.onConfirm();
        } catch {} // ignore
      }
      closeModal();
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message ?? err?.message;
      sonnerToast.error(
        String(apiMessage || t.vehicles.messages.deleteError || t.common.error)
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        showInfo={false}
        showCloseButton={false}
        className="w-screen sm:w-lg p-0 rounded-2xl"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <DialogHeader className="px-6 py-4 pt-6 max-w-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-start gap-3">
                <DialogTitle className="text-lg font-semibold">
                  {data.title ?? t.common.deleteConfirm}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-start text-muted-foreground">
                  Essa ação não pode ser desfeita. Isso excluirá o veículo{" "}
                  {vehicleData?.model} {vehicleData?.brand} de nossos
                  servidores.
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-col items-start text-start mt-4 text-sm space-y-1 font-semibold ">
              <h2 className="">Informações do veículo:</h2>
              <div className="space-y-1">
                {vehicleData?.plate && (
                  <>
                    <p className=" text-muted-foreground">Placa</p>
                    <h2>{vehicleData.plate}</h2>
                  </>
                )}
                  {vehicleData?.companyName && (
                  <>
                    <p className=" text-muted-foreground">Empresa</p>
                    <h2>{vehicleData.companyName}</h2>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 flex justify-between items-start gap-3 border-t border-border">
            <Button type="button" variant="outline" onClick={closeModal}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              className="bg-destructive/60 hover:bg-destructive/60 cursor-pointer text-white"
              onClick={handleConfirm}
              disabled={deleteVehicle.isPending}
            >
              {deleteVehicle.isPending ? t.common.loading : t.common.delete}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteVehicleModal;
