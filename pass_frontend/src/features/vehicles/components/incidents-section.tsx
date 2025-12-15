"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Plus,
} from "lucide-react";
import { RiAlertLine } from "react-icons/ri";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Incident } from "@/types/vehicle";
import { useIncidents } from "@/features/fleet-events/hooks/use-incidents";

interface IncidentsSectionProps {
  vehicleId: string;
  incidents: Incident[];
}

export function IncidentsSection({
  vehicleId,
  incidents,
}: IncidentsSectionProps) {
  const { t } = useI18n();
  const { openModal } = useModalStore();
  const [isOpen, setIsOpen] = useState(true);
  const { data: incidentsData } = useIncidents({ vehicleId });
  const currentIncidents = incidentsData?.items || incidents;
  console.log(currentIncidents);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "BAIXA":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "MEDIA":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "ALTA":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "GRAVE":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="overflow-hidden w-[90vw] sm:w-[630px]  mt-4 ">
        <CollapsibleTrigger asChild>
       
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 pt-0"
          >
            <Table className="">
              <TableHeader variant="minimal">
                <TableRow>
                  <TableHead variant="minimal">{t.incidents.date}</TableHead>
                  <TableHead variant="minimal">{t.incidents.classification}</TableHead>
                  <TableHead variant="minimal">{t.incidents.severity}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex font-semibold items-center justify-start gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        {t.common.noRecords}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentIncidents.map((incident: Incident) => (
                    <TableRow key={incident.id}>
                      <TableCell >
                        {format(new Date(incident.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{incident.classification}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {t.severity[incident.severity]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

        

            <div className="flex justify-center mt-4 border-t border-border sm:pt-10">
              
              <Button
                type="button"
                // variant="outline"
                className=""
                onClick={() => openModal("incident-create", { vehicleId })}
              >
                  <Plus className=""/>
                {t.common.add}
              </Button>
            </div>
          </motion.div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
