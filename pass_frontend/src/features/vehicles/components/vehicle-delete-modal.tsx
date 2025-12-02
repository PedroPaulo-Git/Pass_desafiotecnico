"use client";

import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useDeleteVehicle } from "../hooks/use-vehicles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";

const modalVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export function ConfirmDeleteVehicleModal() {
  const { t } = useI18n();
  const { data, closeModal, isOpen } = useModalStore();
  const vehicleId = data.vehicleId as string | undefined;

  const deleteVehicle = useDeleteVehicle();

  const handleConfirm = async () => {
    if (!vehicleId) {
      sonnerToast.error(t.vehicles.messages.deleteError || t.common.error);
      return;
    }

    try {
      await deleteVehicle.mutateAsync(vehicleId);
      sonnerToast.success(t.vehicles.messages.deletedSuccess || t.common.success);
      if (typeof data.onConfirm === "function") {
        try { data.onConfirm(); } catch {} // ignore
      }
      closeModal();
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message ?? err?.message;
      sonnerToast.error(String(apiMessage || t.vehicles.messages.deleteError || t.common.error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent showInfo={false} className="max-w-md p-0">
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Trash2 className="h-5 w-5 text-foreground" />
                </div>
                <DialogTitle className="text-lg font-semibold">
                  {data.title ?? t.common.deleteConfirm}
                </DialogTitle>
              </div>
            
            </div>
          </DialogHeader>

          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground">{data.description ?? t.common.deleteConfirm}</p>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" onClick={closeModal}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              className="bg-destructive text-white"
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
