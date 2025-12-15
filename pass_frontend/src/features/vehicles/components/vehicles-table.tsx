"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Check, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useModalStore } from "@/store/use-modal-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDragToScroll } from "@/features/vehicles/components/fueling-rates-table/hooks/use-drag-to-scroll";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronLast,
  ChevronFirst,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    limit: number; // ou 'pageSize', o número de itens por página atual
  };
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Assumindo que você tem o estado de seleção aqui ou no pai
  selectedRows?: Set<string>;
  sidebarCollapsed?: boolean;
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
  onPageSizeChange,
}: VehiclesTableProps) {
  const { t } = useI18n();
  const { openModal } = useModalStore();
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<
    "asc" | "desc" | "none"
  >("none");
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = React.useState(false);

  const { dragRef, isGrabbing, onPointerDown, onClickCapture } =
    useDragToScroll(true);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      setSelectedRows(new Set(vehicles.map((v) => v.id)));
      setSelectAll(true);
    }
  };

  const handleSelectRow = (vehicleId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === vehicles.length);
  };

  // Limpar seleção quando veículos mudam
  React.useEffect(() => {
    setSelectedRows(new Set());
    setSelectAll(false);
  }, [vehicles]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Ciclo: none -> asc -> desc -> none
      if (sortDirection === "none") {
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortDirection("none");
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Ordenar veículos
  const sortedVehicles = React.useMemo(() => {
    if (!sortColumn || sortDirection === "none") return vehicles;

    return [...vehicles].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Vehicle];
      let bVal: any = b[sortColumn as keyof Vehicle];

      // Tratamento especial para datas
      if (sortColumn === "createdAt" || sortColumn === "updatedAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [vehicles, sortColumn, sortDirection]);

  function ActionsMenu({ vehicle }: { vehicle: Vehicle }) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openModal("vehicle-details", { vehicle });
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openModal("confirm-delete", {
              vehicleId: vehicle.id,
              title: t.common.deleteConfirm,
            });
          }}
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIBERADO":
        return "bg-emerald-600/70 hover:bg-esmerald-800/80";
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

  // Sortable header content component with arrow icons
  const SortableHeaderContent = ({
    columnId,
    label,
  }: {
    columnId: string;
    label: string;
  }) => {
    const isActive = sortColumn === columnId;
    const direction = isActive ? sortDirection : "none";

    const SortIcon =
      direction === "asc"
        ? ArrowUp
        : direction === "desc"
        ? ArrowDown
        : ChevronsUpDown;

    return (
      <div className="flex items-center gap-1 text-foreground/70">
        <span>{label}</span>
        <SortIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "" : ""}`} />
      </div>
    );
  };

  return (
    // Mobile: 100vw - padding (48px)
    // Desktop lg+: 100vw - sidebar (240px) - padding wrapper (16px) - padding main (48px) = ~304px
    <div className="w-full max-w-[calc(100vw-48px)] lg:max-w-[calc(100vw-306px)] overflow-hidden ">
      {/* Table with drag-to-scroll - only on screens smaller than xl */}
      <div
        ref={dragRef}
        onPointerDown={onPointerDown}
        onClick={onClickCapture}
        onClickCapture={onClickCapture}
        className={cn(
          "cursor-grab overflow-x-auto md:scrollbar-hidden pr-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-6 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-3 [&::-webkit-scrollbar-thumb]:bg-muted! [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/80! [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-button]:hidden ",
          isGrabbing && "cursor-grabbing select-none **:pointer-events-none"
        )}
      >
        <Table className="w-full min-w-max">
          <TableHeader variant="main">
            <TableRow className="">
              <TableHead variant="main" className="w-12">
                <div
                  className="flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-sm border border-border bg-background flex items-center justify-center transition-colors ${
                      selectAll ? "bg-primary border-primary" : ""
                    }`}
                  >
                    {selectAll && (
                      <Minus className="h-3 w-3 text-background" />
                    )}
                  </div>
                </div>
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={
                  sortColumn === "internalId" ? sortDirection : "none"
                }
                onClick={() => handleSort("internalId")}
              >
                <SortableHeaderContent
                  columnId="internalId"
                  label={t.vehicles.identifier}
                />
              </TableHead>

              <TableHead
                variant="main"
                sortable
                sortDirection={sortColumn === "model" ? sortDirection : "none"}
                onClick={() => handleSort("model")}
              >
                <SortableHeaderContent columnId="model" label={t.vehicles.model} />
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={sortColumn === "brand" ? sortDirection : "none"}
                onClick={() => handleSort("brand")}
              >
                <SortableHeaderContent
                  columnId="brand"
                  label={t.vehicles.brand}
                />
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={
                  sortColumn === "capacity" ? sortDirection : "none"
                }
                onClick={() => handleSort("capacity")}
              >
                <SortableHeaderContent
                  columnId="capacity"
                  label={t.vehicles.capacity}
                />
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={sortColumn === "plate" ? sortDirection : "none"}
                onClick={() => handleSort("plate")}
              >
                <SortableHeaderContent
                  columnId="plate"
                  label={t.vehicles.plate}
                />
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={
                  sortColumn === "companyName" ? sortDirection : "none"
                }
                onClick={() => handleSort("companyName")}
              >
                <SortableHeaderContent
                  columnId="companyName"
                  label={t.vehicles.company}
                />
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={sortColumn === "status" ? sortDirection : "none"}
                onClick={() => handleSort("status")}
              >
                <SortableHeaderContent
                  columnId="status"
                  label={t.vehicles.status}
                />
              </TableHead>
              <TableHead
                variant="main"
                sortable
                sortDirection={
                  sortColumn === "createdAt" ? sortDirection : "none"
                }
                onClick={() => handleSort("createdAt")}
              >
                <SortableHeaderContent
                  columnId="createdAt"
                  label={t.vehicles.createdAt}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-start py-10 text-muted-foreground"
                >
                  {t.common.noRecords}
                </TableCell>
              </TableRow>
            ) : (
              sortedVehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "border-t border-border transition-colors group/row hover:bg-muted/50",
                    selectedRows.has(vehicle.id) && "bg-muted/50 border-l-2 border-l-primary"
                  )}
               
                >
                  <TableCell variant="compact" firstPadding>
                    <div
                      data-checkbox
                      className="flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRow(vehicle.id);
                      }}
                    >
                      <div
                        className={`w-4.5 h-4.5  rounded-sm border border-border bg-background flex items-center justify-center transition-colors ${
                          selectedRows.has(vehicle.id)
                            ? "bg-primary border-primary "
                            : ""
                        }`}
                      >
                        {selectedRows.has(vehicle.id) && (
                          <Check className="h-3 w-3 text-background" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium min-w-24 max-w-[100px]" variant="compact">
                    {vehicle.internalId || "-"}
                  </TableCell>

                  <TableCell variant="compact">
                    <div>
                      <span className="font-medium">{vehicle.model}</span>
                      <p className="text-sm text-muted-foreground ">
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
                  <TableCell variant="compact">
                    {vehicle.companyName || "-"}
                  </TableCell>
                  <TableCell variant="compact">
                    <div className="text-center flex gap-2 text-muted-foreground">
                      <Badge
                        variant="point"
                        className={`${getStatusColor(
                          vehicle.status
                        )} text-foreground font-semibold border-0  `}
                      ></Badge>
                      {t.status[vehicle.status]}
                    </div>
                  </TableCell>
                  <TableCell variant="compact">
                    {vehicle.createdAt
                      ? format(new Date(vehicle.createdAt), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  {/* Actions - sticky right, only visible on row hover */}
                  <td className="sticky -right-2 p-0 w-0 min-w-0 max-w-0 overflow-visible">
                    <div className="absolute right-0 top-0 h-full flex items-center pr-2 pl-4 opacity-0 group-hover/row:opacity-100 transition-opacity z-20 bg-sidebar">
                      <ActionsMenu vehicle={vehicle} />
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer de Paginação */}
      <div className="sm:flex sm:flex-row gap-4 flex flex-col items-center justify-between px-5 py-4 border-t border-border">
        {/* Lado Esquerdo: Texto de Seleção */}
        <div className="text-sm text-muted-foreground">
          {selectedRows?.size || 0} de {pagination.total} linha(s)
          selecionada(s).
        </div>

        {/* Dropdown: Linhas por página */}
        <div className="flex items-center space-x-2 h-8 bg-background ">
          <Select
            value={`${pagination.limit}`} // Converte para string pois o Select espera string
            onValueChange={(value) => {
              // Prefer onPageSizeChange; se não existir, apenas logamos
              if (typeof onPageSizeChange === "function") {
                onPageSizeChange(Number(value));
                return;
              }
              // fallback: se pai não forneceu handler, apenas ignora
              console.warn("onPageSizeChange not provided for VehiclesTable");
            }}
          >
            <SelectTrigger className="h-8 w-[110px]  text-foreground" variant="pagination">
              {/* Mostrar o texto formatado (ex.: "10 / page") */}
              <SelectValue className="text-foreground">{`${pagination.limit} / page`}</SelectValue>
            </SelectTrigger>
            {/* side é aceito; removeu-se o prop 'variant' que causava erro de tipo */}
            <SelectContent side="top">
              {[5, 10, 15, 20, 50].map((pageSize) => (
                <SelectItem className="text-foreground" key={pageSize} value={`${pageSize}`}>
                  {pageSize} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Lado Direito: Controles */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          {/* Texto: Página X de Y */}
          <div className="flex w-[70px] items-center justify-center text-sm font-medium text-nowrap  text-foreground ">
            Página {pagination.page} de {pagination.totalPages}
          </div>

          {/* Botões de Navegação (Primeira, Anterior, Próxima, Última) */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronFirst className="h-4 w-4  text-foreground" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4  text-foreground" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4  text-foreground" />
            </Button>
            <Button
              variant="outline"
              className=" h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronLast className="h-4 w-4  text-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
