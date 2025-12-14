"use client";

import { useState, useMemo } from "react";
import { ptBR } from "date-fns/locale";
import { toast as sonnerToast } from "sonner";
import type { DateRange } from "react-day-picker";
import { Trash2, Check, X, Edit, Eye, Fuel } from "lucide-react";

import {
  useFuelings,
  useDeleteFueling,
  useUpdateFueling,
} from "@/features/fleet-events/hooks/use-fuelings";
import { useVehicle } from "@/features/vehicles/hooks/use-vehicles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Local imports
import type {
  FuelingRatesTableProps,
  FuelingPeriodData,
  Profile,
} from "./types";
import {
  WEEK_DAYS,
  FUEL_TYPE_LABELS,
  CATEGORY_LABELS,
  COLUMN_WIDTHS,
  DATE_PRESETS,
  DEFAULT_PROFILES,
  PROVIDERS,
} from "./constants";
import {
  useDragToScroll,
  useColumnPinning,
  useColumnSorting,
  usePeriodsData,
} from "./hooks";
import {
  DayChip,
  PinnableHeaderContent,
  FuelingForm,
  ProfileModal,
  Pagination,
  TableHeaderSection,
  FuelingScrollTable,
} from "./components";

export function FuelingRatesTable({
  vehicleId,
  fuelings,
  sidebarOpen = false,
  onToggleSidebar,
}: FuelingRatesTableProps) {
  // Profile states
  const [updateOpen, setUpdateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("p1");

  const filteredProfiles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return DEFAULT_PROFILES;
    return DEFAULT_PROFILES.filter((p) => p.name.toLowerCase().includes(q));
  }, [searchTerm]);

  const selectedProfile =
    DEFAULT_PROFILES.find((p) => p.id === selectedProfileId) ||
    DEFAULT_PROFILES[0];

  // Selection states
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sheet/Modal states
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<FuelingPeriodData | null>(null);

  // Popover states
  const [periodPopoverOpen, setPeriodPopoverOpen] = useState<string | null>(
    null
  );
  const [providerPopoverOpen, setProviderPopoverOpen] = useState<string | null>(
    null
  );
  const [fuelTypePopoverOpen, setFuelTypePopoverOpen] = useState<string | null>(
    null
  );
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState<string | null>(
    null
  );
  
  const [detailsPopoverOpen, setDetailsPopoverOpen] = useState<string | null>(
    null
  );

  // Date range picker states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePickerMonth, setDatePickerMonth] = useState<Date>(new Date());

  // Inline edit form states
  // const [editLiters, setEditLiters] = useState<number>(0);
  // const [editValue, setEditValue] = useState<number>(0);
  // const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  // const [editOdometer, setEditOdometer] = useState<number>(0);

  // Custom hooks
  const { dragRef, isGrabbing, onPointerDown } = useDragToScroll();
  const {
    togglePin,
    getColumnPin,
    shouldPeriodShowShadow,
    isPeriodPinnedLeft,
    getStickyClass,
    getColumnCSSOrder,
    getStickyStyle,
  } = useColumnPinning();
  const { sortColumn, sortDirection, toggleSort, getColumnSort } =
    useColumnSorting();

  // Data fetching
  const { data: fuelingsData, refetch } = useFuelings({ vehicleId });
  const currentFuelings = fuelingsData?.items ?? fuelings;
  const deleteFueling = useDeleteFueling();
  const updateFueling = useUpdateFueling();
  const { data: vehicleData } = useVehicle(vehicleId);
  const vehicleCategory = vehicleData?.category;

  // Process periods data
  const { filteredPeriodsData } = usePeriodsData({
    fuelings: currentFuelings,
    vehicleCategory,
    dateRange,
    sortColumn,
    sortDirection,
  });

  // Pagination
  const totalPages = Math.ceil(filteredPeriodsData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPeriodsData.slice(start, start + itemsPerPage);
  }, [filteredPeriodsData, currentPage, itemsPerPage]);

  // Selection handlers
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((r) => r.id)));
    }
  };

  // Handle cell click - open inline edit popover
  const handleCellClick = (period: FuelingPeriodData) => {
    setSelectedPeriod(period);
    setEditingRowId(period.id);
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedPeriod(null);
    setShowAddSheet(true);
  };

  // Handle delete fueling
  const handleDeleteFueling = async (id: string) => {
    try {
      await deleteFueling.mutateAsync(id);
      sonnerToast.success("Abastecimento excluído com sucesso!");
      refetch();
      setEditingRowId(null);
    } catch (err: any) {
      sonnerToast.error(err?.message || "Erro ao excluir");
    }
  };
  // Handle update field
  const onUpdateField = (periodId: string, field: string, newValue: any) => {
    console.log("onUpdateField called", { periodId, field, newValue });

    const period = filteredPeriodsData.find(p => p.id === periodId);
    if (!period || period.fuelingCount !== 1) {
      console.log("Period not found or fuelingCount !== 1", period);
      return;
    }

    // Find the fueling in the period (assuming one fueling per period for editable fields)
    const fueling = currentFuelings.find(f =>
      new Date(f.date) >= period.periodStart && new Date(f.date) <= period.periodEnd
    );
    if (!fueling) {
      console.log("Fueling not found in period", period);
      console.log("currentFuelings", currentFuelings);
      return;
    }

    console.log("Found fueling", fueling);

    // Map field to actual schema field
    const fieldMapping: Record<string, string> = {
      liters: "liters",
      value: "totalValue",
      unitPrice: "unitPrice",
      odometer: "odometer"
    };
    const actualField = fieldMapping[field] || field;

    console.log("Updating fueling", fueling.id, "field", actualField, "with value", newValue);

    const updateData = { [actualField]: newValue };
    console.log("About to call mutate", { id: fueling.id, data: updateData });

    updateFueling.mutate({ id: fueling.id, data: updateData });
  };

  return (
    <>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out flex w-screen lg:w-[67vw] h-[70vh]",
          sidebarOpen && "ml-[340px] overflow-hidden"
        )}
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Section */}
          <TableHeaderSection
            filteredPeriodsCount={filteredPeriodsData.length}
            selectedProfile={selectedProfile}
            onToggleSidebar={onToggleSidebar}
            onOpenProfileModal={() => setUpdateOpen(true)}
            onAddNew={handleAddNew}
          />

          <FuelingScrollTable
            // Data props
            currentFuelings={currentFuelings}
            paginatedData={paginatedData}
            selectedPeriod={selectedPeriod}
            selectedRows={selectedRows}

            // Popover states
            detailsPopoverOpen={detailsPopoverOpen}
            setDetailsPopoverOpen={setDetailsPopoverOpen}
            periodPopoverOpen={periodPopoverOpen}
            setPeriodPopoverOpen={setPeriodPopoverOpen}
            providerPopoverOpen={providerPopoverOpen}
            setProviderPopoverOpen={setProviderPopoverOpen}
            fuelTypePopoverOpen={fuelTypePopoverOpen}
            setFuelTypePopoverOpen={setFuelTypePopoverOpen}
            categoryPopoverOpen={categoryPopoverOpen}
            setCategoryPopoverOpen={setCategoryPopoverOpen}

            // Date picker states
            datePickerMonth={datePickerMonth}
            setDatePickerMonth={setDatePickerMonth}
            dateRange={dateRange}
            setDateRange={setDateRange}

            // Handlers
            handleCellClick={handleCellClick}
            handleDeleteFueling={handleDeleteFueling}
            toggleAllSelection={toggleAllSelection}
            toggleRowSelection={toggleRowSelection}
            onUpdateField={onUpdateField}
          
          />
          {/* Footer / Pagination */}
          <Pagination
            selectedCount={selectedRows.size}
            totalCount={filteredPeriodsData.length}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />

          {/* Add Fueling Sheet */}
          <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Novo Abastecimento
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FuelingForm
                  vehicleId={vehicleId}
                  onClose={() => setShowAddSheet(false)}
                  onSuccess={() => {
                    setShowAddSheet(false);
                    refetch();
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        profiles={DEFAULT_PROFILES}
        filteredProfiles={filteredProfiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={setSelectedProfileId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  );
}

export default FuelingRatesTable;
