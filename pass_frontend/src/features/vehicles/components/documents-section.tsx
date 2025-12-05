"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  X,
  AlertTriangle,
} from "lucide-react";
import { RiAlertFill } from "react-icons/ri";
import { FaRegListAlt } from "react-icons/fa";
import { MdOutlineContentCopy, MdClose } from "react-icons/md";
import { format } from "date-fns";
import { toast as sonnerToast } from "sonner";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useVehicleDocuments } from "@/features/fleet-events/hooks/use-vehicle-documents";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VehicleDocument } from "@/types/vehicle";

interface DocumentsSectionProps {
  vehicleId: string;
  documents: VehicleDocument[];
}

export function DocumentsSection({
  vehicleId,
  documents,
}: DocumentsSectionProps) {
  const { t } = useI18n();
  const { openModal } = useModalStore();
  const [isOpen, setIsOpen] = useState(true);

  const {
    data: documentsData,
    error,
    isError,
  } = useVehicleDocuments({ vehicleId });
  const currentDocuments = documentsData?.items ?? documents;

  // Show error toast if query fails
  useEffect(() => {
    if (isError && error) {
      sonnerToast.error(t.common.error || "Erro ao carregar documentos", {
        description:
          (error as any)?.message || "Falha ao buscar documentos do veículo",
        duration: 5000,
      });
    }
  }, [isError, error, t]);

  // Check for expired documents and show warning toast
  useEffect(() => {
    if (currentDocuments && currentDocuments.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiredDocs = currentDocuments.filter((doc) => {
        const expiryDate = new Date(doc.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);
        return expiryDate < today;
      });

      if (expiredDocs.length > 0) {
        const docNames = expiredDocs.map((doc) => doc.name).join(", ");
        sonnerToast.error(t.common.error || "Documentos vencidos detectados", {
          description: `Os seguintes documentos estão vencidos: ${docNames}`,
          duration: 7000,
        });
      }
    }
  }, [currentDocuments, t]);

  const getDocumentIcon = (name?: string) => {
    const lower = (name ?? "").toLowerCase();
    if (lower.includes("tacógrafo") || lower.includes("tacografo")) {
      return (
        <div className="w-10 h-10 rounded-md bg-gray-500 flex items-center justify-center">
          <RiAlertFill className="h-5 w-5 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <FileText className="h-5 w-5 text-blue-500" />
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="">
      <div className="border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FaRegListAlt className="h-4 w-4" />
              <span className="font-semibold">{t.documents.title}</span>
            </div>
            {isOpen ? (
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
            exit={{ opacity: 0 }}
            className="p-2 sm:p-4 pt-0 max-[440px]:w-80 max-[550px]:w-92 mx-auto sm:w-full "
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.documents.name}</TableHead>
                  <TableHead>{t.documents.type}</TableHead>
                  <TableHead>{t.documents.expiryDate}</TableHead>
                  <TableHead>{t.documents.anticipation}</TableHead>
                  <TableHead>{t.documents.days}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border-b border-border">
                {currentDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        {t.common.noRecords}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentDocuments.map((doc) => (
                    <TableRow key={doc.id} className="ml-10">
                      <TableCell className="">
                        <div className=" ml-12">
                          {getDocumentIcon(doc.name)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="ml-6">{doc.name ?? "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="ml-6">
                          {format(new Date(doc.expiryDate), "dd/MM/yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch className="ml-12" checked={doc.activeAlert} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.alertDays
                          ? `${doc.alertDays} dias`
                          : "Dias de An..."}
                      </TableCell>
                      <TableCell className="flex">
                        <div className="flex mt-2.5 gap-4 items-center justify-center">
                          <MdOutlineContentCopy className="w-4 h-4 " />
                          <MdClose className="w-4 h-4 " />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-transparent w-32 md:w-1/6 mx-auto  mt-12 mb-4"
                onClick={() => openModal("document-create", { vehicleId })}
              >
                {t.common.add}
              </Button>
            </div>
          </motion.div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
