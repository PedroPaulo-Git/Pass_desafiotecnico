"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Fuel, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { useFuelings } from "@/features/fleet-events/hooks/use-fuelings";
import { Button } from "@/components/ui/button";
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
import type { Fueling } from "@/types/vehicle";

interface FuelingsSectionProps {
  vehicleId: string;
  fuelings: Fueling[];
}

export function FuelingsSection({ vehicleId, fuelings }: FuelingsSectionProps) {
  const { t } = useI18n();
  const { openModal } = useModalStore();
  const [isOpen, setIsOpen] = useState(true);

  // Use the dedicated fuelings query so the section reacts to fuelings-specific
  // invalidation/refetch. Fall back to the `fuelings` prop while loading.
  const { data: fuelingsData } = useFuelings({ vehicleId });
  const currentFuelings = fuelingsData?.items ?? fuelings;

  const totalValue = currentFuelings.reduce((acc, f) => acc + f.totalValue, 0);
  console.log({ currentFuelings, totalValue });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BsFillFuelPumpFill className="h-4 w-4 " />
              <span className="font-semibold">{t.fueling.title}</span>
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
            <Table className=" bg-muted/50 rounded-md">
              <TableHeader>
                <TableRow className="" >
                  <TableHead>{t.fueling.date}</TableHead>
                  <TableHead>{t.fueling.provider}</TableHead>
                  <TableHead>{t.fueling.fuelType}</TableHead>
                  <TableHead>{t.fueling.liters}</TableHead>
                  <TableHead>{t.fueling.value}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFuelings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex font-semibold items-center justify-start gap-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        {t.common.noRecords}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentFuelings.map((fueling) => (
                    <TableRow key={fueling.id}>
                      <TableCell>
                        {format(new Date(fueling.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{fueling.provider}</TableCell>
                      <TableCell>{t.fuelTypes[fueling.fuelType]}</TableCell>
                      <TableCell>{fueling.liters}</TableCell>
                      <TableCell>
                        {formatCurrency(fueling.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex bg-muted/50 items-center justify-between py-4 px-4 border-t border-border rounded-b-md">
              <span className="text-sm text-muted-foreground">
                {currentFuelings.length}
              </span>
              <div className="flex items-center gap-4 ">
                <span className="text-sm ">
                  {t.common.total}{" "}
                  <span className="font-medium ml-10">
                    {formatCurrency(totalValue)}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center mt-44">
              <span className="text-sm text-muted-foreground">
                5016
              </span>
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-transparent border-foreground md:w-1/6 mx-auto border-2 mt-12 mb-4"
                onClick={() => openModal("fueling-create", { vehicleId })}
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
