"use client";

import { useState } from "react";
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
import { format } from "date-fns";
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

  const { data: documentsData } = useVehicleDocuments({ vehicleId });
  const currentDocuments = documentsData?.items ?? documents;

  const getDocumentIcon = (name?: string) => {
    const lower = (name ?? "").toLowerCase();
    if (lower.includes("tacógrafo") || lower.includes("tacografo")) {
      return (
        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-red-500" />
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
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{t.documents.title}</span>
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
            className="p-2 sm:p-4 pt-0 max-[440px]:w-72 max-[550px]:w-92 mx-auto sm:w-full "
           >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.documents.name}</TableHead>
                  <TableHead>{t.documents.expiryDate}</TableHead>
                  <TableHead>{t.documents.anticipation}</TableHead>
                  <TableHead>{t.documents.days}</TableHead>
                  {/* <TableHead className="w-20"></TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
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
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.name)}
                          <span>{doc.name ?? "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(doc.expiryDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Switch checked={doc.activeAlert} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.alertDays
                          ? `${doc.alertDays} dias`
                          : "Dias de An..."}
                      </TableCell>
                      <TableCell>
                       
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
                className="rounded-full bg-transparent"
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
