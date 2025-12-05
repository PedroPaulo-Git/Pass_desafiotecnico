"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Vehicle } from "@/types/vehicle";
import { format } from "date-fns";

// No global flags: detect clicks originating from the action menu instead.

interface VehiclesTableProps {
  vehicles: Vehicle[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

export function VehiclesTable({
  vehicles,
  pagination,
  onPageChange,
}: VehiclesTableProps) {
  const { t } = useI18n();
  const { openModal } = useModalStore();

  function ActionsMenu({ vehicle }: { vehicle: Vehicle }) {
    const [open, setOpen] = React.useState(false);

    // helper to defensively stop propagation on Radix events
    const stopRadixEvent = (e?: Event) => {
      if (!e) return;
      try {
        e.stopPropagation();
        e.preventDefault();
      } catch {}
    };

    return (
      <DropdownMenu open={open} onOpenChange={(v) => setOpen(v)}>
        <DropdownMenuTrigger
          asChild
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        {/* mark content so row clicks can detect the origin */}
        <DropdownMenuContent align="end" data-vehicle-action-menu>
          <DropdownMenuItem
            onSelect={(e?: Event) => {
              stopRadixEvent(e);
              openModal("vehicle-details", { vehicle });
              setOpen(false);
            }}
          >
            {t.common.edit}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e?: Event) => {
              stopRadixEvent(e);
              openModal("confirm-delete", {
                vehicleId: vehicle.id,
                title: t.common.deleteConfirm,
              });
              setOpen(false);
            }}
            className="text-destructive"
          >
            {t.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIBERADO":
        return "bg-green-500 hover:bg-green-500/80";
      case "EM_MANUTENCAO":
        return "bg-yellow-500 hover:bg-yellow-500/80";
      case "INDISPONIVEL":
        return "bg-red-500 hover:bg-red-500/80";
      case "VENDIDO":
        return "bg-gray-500 hover:bg-gray-500/80";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="rounded-lg  overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-card">
            <TableHead className="font-semibold" variant="compact">
              {t.vehicles.identifier}
            </TableHead>
            <TableHead className="font-semibold" variant="compact">
              {t.vehicles.createdAt}
            </TableHead>
            <TableHead className="font-semibold" variant="compact">Título</TableHead>
            <TableHead className="font-semibold" variant="compact">{t.vehicles.brand}</TableHead>
            <TableHead className="font-semibold" variant="compact">
              {t.vehicles.capacity}
            </TableHead>
            <TableHead className="font-semibold" variant="compact">
              {t.vehicles.plate} - {t.vehicles.state}
            </TableHead>
            <TableHead className="font-semibold" variant="compact">
              {t.vehicles.company}
            </TableHead>
            <TableHead className="font-semibold" variant="compact">{t.vehicles.status}</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-10 text-muted-foreground"
              >
                {t.common.noRecords}
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle, index) => (
              <motion.tr
                key={vehicle.id}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ backgroundColor: "var(--accent)" }}
                className="cursor-pointer border-b border-border transition-colors "
                onClick={(e: React.MouseEvent) => {
                  const target = e.target as HTMLElement | null;

                  // If the click started inside the action menu or on an interactive element, ignore.
                  if (
                    target &&
                    (target.closest("[data-vehicle-action-menu]") ||
                      target.closest("button") ||
                      target.closest("a") ||
                      target.closest("input") ||
                      target.closest("textarea") ||
                      target.closest("select"))
                  ) {
                    return;
                  }

                  openModal("vehicle-details", { vehicle });
                }}
               >
                <TableCell className="font-medium " variant="compact">
                  {vehicle.internalId || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground" variant="compact">
                  {formatDate(vehicle.createdAt)}
                </TableCell>
                <TableCell variant="compact">
                  <div>
                    <span className="font-medium">{vehicle.model}</span>
                    <p className="text-sm text-muted-foreground">
                      {t.categories[vehicle.category]}{" "}
                      {t.classifications[vehicle.classification]}
                    </p>
                  </div>
                </TableCell>
                <TableCell variant="compact">{vehicle.brand}</TableCell>
                <TableCell variant="compact">{vehicle.capacity}</TableCell>
                <TableCell variant="compact">
                  {vehicle.plate} - {vehicle.state}
                </TableCell>
                <TableCell variant="compact">{vehicle.companyName || "-"}</TableCell>
                <TableCell variant="compact">
                  <Badge
                    className={`${getStatusColor(
                      vehicle.status
                    )} text-white border-0`}
                  >
                    {t.status[vehicle.status]}
                  </Badge>
                </TableCell>
                <TableCell variant="compact">
                  <ActionsMenu vehicle={vehicle} />
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} (
            {pagination.total} registros)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
