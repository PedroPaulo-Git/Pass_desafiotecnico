"use client";

import { useState, useMemo } from "react";
import { ptBR } from "date-fns/locale";
import { toast as sonnerToast } from "sonner";
import type { DateRange } from "react-day-picker";
import {
  Trash2,
  Check,
  X,
  Edit,
  Eye,
  Fuel,
} from "lucide-react";

import {
  useFuelings,
  useDeleteFueling,
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
import type { FuelingRatesTableProps, FuelingPeriodData, Profile } from "./types";
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
} from "./components";
import { formatCurrency, formatNumber } from "./utils";

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
    DEFAULT_PROFILES.find((p) => p.id === selectedProfileId) || DEFAULT_PROFILES[0];

  // Selection states
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sheet/Modal states
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<FuelingPeriodData | null>(null);

  // Popover states
  const [periodPopoverOpen, setPeriodPopoverOpen] = useState<string | null>(null);
  const [providerPopoverOpen, setProviderPopoverOpen] = useState<string | null>(null);
  const [fuelTypePopoverOpen, setFuelTypePopoverOpen] = useState<string | null>(null);
  const [litersPopoverOpen, setLitersPopoverOpen] = useState<string | null>(null);
  const [valuePopoverOpen, setValuePopoverOpen] = useState<string | null>(null);
  const [unitPricePopoverOpen, setUnitPricePopoverOpen] = useState<string | null>(null);
  const [odometerPopoverOpen, setOdometerPopoverOpen] = useState<string | null>(null);
  const [detailsPopoverOpen, setDetailsPopoverOpen] = useState<string | null>(null);

  // Date range picker states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePickerMonth, setDatePickerMonth] = useState<Date>(new Date());

  // Inline edit form states
  const [editLiters, setEditLiters] = useState<number>(0);
  const [editValue, setEditValue] = useState<number>(0);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editOdometer, setEditOdometer] = useState<number>(0);

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
  const { sortColumn, sortDirection, toggleSort, getColumnSort } = useColumnSorting();

  // Data fetching
  const { data: fuelingsData, refetch } = useFuelings({ vehicleId });
  const currentFuelings = fuelingsData?.items ?? fuelings;
  const deleteFueling = useDeleteFueling();
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

  return (
    <>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out flex w-screen lg:w-[67vw] h-[70vh]",
          sidebarOpen && "ml-[280px] overflow-hidden"
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

          {/* Table with drag-to-scroll */}
          <div
            ref={dragRef}
            onPointerDown={onPointerDown}
            className={cn("", isGrabbing && "cursor-grabbing select-none")}
          >
            <ScrollArea className="max-w-screen border-x border-border">
              <Table>
                <TableHeader variant="compact-fueling">
                  <TableRow className="hover:bg-transparent" flexLayout>
                    {/* Checkbox column - FIXED */}
                    <TableHead
                      variant="sticky-first"
                      flexCell
                      style={{
                        order: getColumnCSSOrder("checkbox"),
                        width: COLUMN_WIDTHS.checkbox,
                        minWidth: COLUMN_WIDTHS.checkbox,
                        maxWidth: COLUMN_WIDTHS.checkbox,
                        flexShrink: 0,
                        flexGrow: 0,
                      }}
                    >
                      <Checkbox
                        checked={
                          paginatedData.length > 0 &&
                          selectedRows.size === paginatedData.length
                        }
                        onCheckedChange={toggleAllSelection}
                        className="translate-y-0.5"
                      />
                    </TableHead>

                    {/* Period */}
                    <TableHead
                      variant={isPeriodPinnedLeft() ? "sticky-second" : "minimal-fueling"}
                      sortable
                      flexCell
                      className={cn(
                        isPeriodPinnedLeft() &&
                          shouldPeriodShowShadow() &&
                          "shadow-[inset_-1px_0_0_var(--color-border)]"
                      )}
                      style={{
                        order: getColumnCSSOrder("period"),
                        width: COLUMN_WIDTHS.period,
                        minWidth: COLUMN_WIDTHS.period,
                        maxWidth: COLUMN_WIDTHS.period,
                        flexShrink: 0,
                        flexGrow: 0,
                        ...(isPeriodPinnedLeft() && { left: COLUMN_WIDTHS.checkbox }),
                      }}
                    >
                      <PinnableHeaderContent
                        columnId="period"
                        label="Período"
                        pin={getColumnPin("period")}
                        sort={getColumnSort("period")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Provider */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("provider"))}
                      style={getStickyStyle("provider")}
                    >
                      <PinnableHeaderContent
                        columnId="provider"
                        label="Posto"
                        pin={getColumnPin("provider")}
                        sort={getColumnSort("provider")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Fuel Type */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("fuelType"))}
                      style={getStickyStyle("fuelType")}
                    >
                      <PinnableHeaderContent
                        columnId="fuelType"
                        label="Combustível"
                        pin={getColumnPin("fuelType")}
                        sort={getColumnSort("fuelType")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Liters */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("liters"))}
                      style={getStickyStyle("liters")}
                    >
                      <PinnableHeaderContent
                        columnId="liters"
                        label="Litros"
                        pin={getColumnPin("liters")}
                        sort={getColumnSort("liters")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Total Value */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("totalValue"))}
                      style={getStickyStyle("totalValue")}
                    >
                      <PinnableHeaderContent
                        columnId="totalValue"
                        label="Valor Total"
                        pin={getColumnPin("totalValue")}
                        sort={getColumnSort("totalValue")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Unit Price */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("unitPrice"))}
                      style={getStickyStyle("unitPrice")}
                    >
                      <PinnableHeaderContent
                        columnId="unitPrice"
                        label="Preço/L"
                        pin={getColumnPin("unitPrice")}
                        sort={getColumnSort("unitPrice")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Odometer */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("odometer"))}
                      style={getStickyStyle("odometer")}
                    >
                      <PinnableHeaderContent
                        columnId="odometer"
                        label="Odômetro"
                        pin={getColumnPin("odometer")}
                        sort={getColumnSort("odometer")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Category */}
                    <TableHead
                      variant="minimal-fueling"
                      sortable
                      flexCell
                      className={cn("", getStickyClass("category"))}
                      style={getStickyStyle("category")}
                    >
                      <PinnableHeaderContent
                        columnId="category"
                        label="Categoria"
                        pin={getColumnPin("category")}
                        sort={getColumnSort("category")}
                        onToggleSort={toggleSort}
                        onTogglePin={togglePin}
                      />
                    </TableHead>

                    {/* Fueling days */}
                    <TableHead
                      variant="minimal-fueling"
                      flexCell
                      className={cn("", getStickyClass("days"))}
                      style={getStickyStyle("days")}
                    >
                      Dias c/ Abast.
                    </TableHead>

                    {/* Actions column */}
                    <TableHead
                      variant="minimal-fueling"
                      flexCell
                      style={{
                        order: getColumnCSSOrder("actions"),
                        width: COLUMN_WIDTHS.actions,
                        minWidth: COLUMN_WIDTHS.actions,
                        maxWidth: COLUMN_WIDTHS.actions,
                        flexShrink: 0,
                        flexGrow: 0,
                      }}
                    />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        <p className="text-muted-foreground">
                          Nenhum registro encontrado
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((period) => (
                      <TableRow
                        key={period.id}
                        flexLayout
                        className={cn(
                          "group transition-colors hover:bg-muted/50",
                          selectedRows.has(period.id) && "bg-muted/30"
                        )}
                      >
                        {/* Checkbox - FIXED */}
                        <TableCell
                          variant="sticky-first"
                          flexCell
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            order: getColumnCSSOrder("checkbox"),
                            width: COLUMN_WIDTHS.checkbox,
                            minWidth: COLUMN_WIDTHS.checkbox,
                            maxWidth: COLUMN_WIDTHS.checkbox,
                            flexShrink: 0,
                            flexGrow: 0,
                          }}
                        >
                          <Checkbox
                            checked={selectedRows.has(period.id)}
                            onCheckedChange={() => toggleRowSelection(period.id)}
                            className="translate-y-0.5"
                          />
                        </TableCell>

                        {/* Period */}
                        <TableCell
                          variant={isPeriodPinnedLeft() ? "sticky-second" : "compact-fueling"}
                          flexCell
                          className={cn(
                            "font-medium",
                            isPeriodPinnedLeft() &&
                              shouldPeriodShowShadow() &&
                              "shadow-[inset_-1px_0_0_var(--color-border)]"
                          )}
                          style={{
                            order: getColumnCSSOrder("period"),
                            width: COLUMN_WIDTHS.period,
                            minWidth: COLUMN_WIDTHS.period,
                            maxWidth: COLUMN_WIDTHS.period,
                            flexShrink: 0,
                            flexGrow: 0,
                            ...(isPeriodPinnedLeft() && { left: COLUMN_WIDTHS.checkbox }),
                          }}
                        >
                          <Popover
                            open={periodPopoverOpen === period.id}
                            onOpenChange={(open) =>
                              setPeriodPopoverOpen(open ? period.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-1 cursor-pointer text-left transition-colors 
                                  truncate hover:bg-background/20 rounded-lg hover:py-2
                                  hover:ring-1 hover:ring-border -mx-3 -my-1"
                                onClick={() => {
                                  setDateRange({
                                    from: period.periodStart,
                                    to: period.periodEnd,
                                  });
                                  setDatePickerMonth(period.periodStart);
                                }}
                              >
                                <span className="w-full">{period.periodLabel}</span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                              <div className="flex">
                                {/* Presets sidebar */}
                                <div className="border-r p-2 space-y-0.5 min-w-36 bg-popover">
                                  {DATE_PRESETS.map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                                      onClick={() => {
                                        const range = preset.getValue();
                                        setDateRange(range);
                                      }}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                                {/* Calendar */}
                                <div className="p-3">
                                  <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                    month={datePickerMonth}
                                    onMonthChange={setDatePickerMonth}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Provider */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={cn("w-[150px]", getStickyClass("provider"))}
                          style={getStickyStyle("provider")}
                        >
                          <Popover
                            open={providerPopoverOpen === period.id}
                            onOpenChange={(open) =>
                              setProviderPopoverOpen(open ? period.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="truncate hover:bg-background/20 rounded-lg hover:py-2 max-w-[150px]
                                  hover:ring-1 hover:ring-border
                                  cursor-pointer text-left px-5 transition-colors -mx-3 -my-1"
                                title={period.provider}
                              >
                                {period.provider || "Selecione..."}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar posto..." />
                                <CommandList>
                                  <CommandEmpty>Nenhum posto encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {PROVIDERS.map((provider) => (
                                      <CommandItem
                                        key={provider}
                                        value={provider}
                                        onSelect={() => setProviderPopoverOpen(null)}
                                      >
                                        {provider}
                                        {period.provider === provider && (
                                          <Check className="ml-auto h-4 w-4" />
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Fuel Type */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={getStickyClass("fuelType")}
                          style={getStickyStyle("fuelType")}
                        >
                          <Popover
                            open={fuelTypePopoverOpen === period.id}
                            onOpenChange={(open) =>
                              setFuelTypePopoverOpen(open ? period.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Badge
                                variant="outline"
                                className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                  hover:ring-1 hover:ring-border
                                  py-2 cursor-pointer text-left px-3 transition-colors"
                              >
                                {FUEL_TYPE_LABELS[period.fuelType] || period.fuelType}
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="w-[180px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar..." />
                                <CommandList>
                                  <CommandEmpty>Nenhum encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
                                      <CommandItem
                                        key={key}
                                        value={key}
                                        onSelect={() => setFuelTypePopoverOpen(null)}
                                      >
                                        {label}
                                        {period.fuelType === key && (
                                          <Check className="ml-auto h-4 w-4" />
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Liters */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={getStickyClass("liters")}
                          style={getStickyStyle("liters")}
                        >
                          <Popover
                            open={litersPopoverOpen === period.id}
                            onOpenChange={(open) => {
                              setLitersPopoverOpen(open ? period.id : null);
                              if (open) setEditLiters(period.totalLiters);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                  hover:ring-1 hover:ring-border
                                  py-2 cursor-pointer text-left px-3 transition-colors"
                              >
                                {formatNumber(period.totalLiters)} L
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-3" align="start">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Litros</label>
                                  <Input
                                    type="number"
                                    value={editLiters}
                                    onChange={(e) => setEditLiters(Number(e.target.value))}
                                    className="h-8"
                                    step="0.01"
                                  />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setLitersPopoverOpen(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setLitersPopoverOpen(null)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Total Value */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={getStickyClass("totalValue")}
                          style={getStickyStyle("totalValue")}
                        >
                          <Popover
                            open={valuePopoverOpen === period.id}
                            onOpenChange={(open) => {
                              setValuePopoverOpen(open ? period.id : null);
                              if (open) setEditValue(period.totalValue);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                  hover:ring-1 hover:ring-border
                                  py-2 cursor-pointer text-left px-3 transition-colors"
                              >
                                {formatCurrency(period.totalValue)}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-3" align="start">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Valor Total (R$)</label>
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(Number(e.target.value))}
                                    className="h-8"
                                    step="0.01"
                                  />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setValuePopoverOpen(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setValuePopoverOpen(null)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Unit Price */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={cn("", getStickyClass("unitPrice"))}
                          style={getStickyStyle("unitPrice")}
                        >
                          <Popover
                            open={unitPricePopoverOpen === period.id}
                            onOpenChange={(open) => {
                              setUnitPricePopoverOpen(open ? period.id : null);
                              if (open) setEditUnitPrice(period.unitPrice);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                  hover:ring-1 hover:ring-border
                                  py-2 cursor-pointer text-left px-3 transition-colors"
                              >
                                {formatCurrency(period.unitPrice)}/L
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-3" align="start">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Preço/L (R$)</label>
                                  <Input
                                    type="number"
                                    value={editUnitPrice}
                                    onChange={(e) => setEditUnitPrice(Number(e.target.value))}
                                    className="h-8"
                                    step="0.01"
                                  />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setUnitPricePopoverOpen(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setUnitPricePopoverOpen(null)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Odometer */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={getStickyClass("odometer")}
                          style={getStickyStyle("odometer")}
                        >
                          <Popover
                            open={odometerPopoverOpen === period.id}
                            onOpenChange={(open) => {
                              setOdometerPopoverOpen(open ? period.id : null);
                              if (open) setEditOdometer(period.odometer);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                  hover:ring-1 hover:ring-border
                                  py-2 cursor-pointer text-left px-3 transition-colors"
                              >
                                {formatNumber(period.odometer, 0)} km
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-3" align="start">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Odômetro (km)</label>
                                  <Input
                                    type="number"
                                    value={editOdometer}
                                    onChange={(e) => setEditOdometer(Number(e.target.value))}
                                    className="h-8"
                                  />
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setOdometerPopoverOpen(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7"
                                    onClick={() => setOdometerPopoverOpen(null)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        {/* Category */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={getStickyClass("category")}
                          style={getStickyStyle("category")}
                        >
                          {period.category ? (
                            <Badge variant="secondary" className="text-xs ml-2">
                              {CATEGORY_LABELS[period.category] || period.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Fueling days */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          className={getStickyClass("days")}
                          style={getStickyStyle("days")}
                        >
                          <div className="flex items-center gap-1">
                            {WEEK_DAYS.map((day, index) => (
                              <DayChip
                                key={`${period.id}-day-${index}`}
                                day={day}
                                dayIndex={index}
                                isActive={period.fuelingDays.includes(index)}
                                onClick={() => {
                                  setDetailsPopoverOpen(
                                    detailsPopoverOpen === period.id ? null : period.id
                                  );
                                  handleCellClick(period);
                                }}
                              />
                            ))}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell
                          variant="compact-fueling"
                          flexCell
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            order: getColumnCSSOrder("actions"),
                            width: COLUMN_WIDTHS.actions,
                            minWidth: COLUMN_WIDTHS.actions,
                            maxWidth: COLUMN_WIDTHS.actions,
                            flexShrink: 0,
                            flexGrow: 0,
                          }}
                        >
                          <Popover
                            open={detailsPopoverOpen === period.id}
                            onOpenChange={(open) => {
                              setDetailsPopoverOpen(open ? period.id : null);
                              if (open) handleCellClick(period);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] p-0" align="end" side="left">
                              <div className="p-4 space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm">Detalhes do Período</h4>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setDetailsPopoverOpen(null)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>

                                <Separator />

                                {/* Details */}
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Período:</span>
                                    <span className="font-medium">{period.periodLabel}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Posto:</span>
                                    <span className="font-medium">{period.provider}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Combustível:</span>
                                    <span className="font-medium">
                                      {FUEL_TYPE_LABELS[period.fuelType]}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Litros:</span>
                                    <span className="font-medium">
                                      {formatNumber(period.totalLiters)} L
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Valor Total:</span>
                                    <span className="font-medium">
                                      {formatCurrency(period.totalValue)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Preço/Litro:</span>
                                    <span className="font-medium">
                                      {formatCurrency(period.unitPrice)}/L
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Odômetro:</span>
                                    <span className="font-medium">
                                      {formatNumber(period.odometer, 0)} km
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Abastecimentos:</span>
                                    <span className="font-medium">{period.fuelingCount}x</span>
                                  </div>
                                </div>

                                <Separator />

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={() => setDetailsPopoverOpen(null)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={() => {
                                      const periodFuelings = currentFuelings.filter((f) => {
                                        const fDate = new Date(f.date);
                                        return (
                                          fDate >= period.periodStart &&
                                          fDate <= period.periodEnd
                                        );
                                      });
                                      if (periodFuelings[0]) {
                                        handleDeleteFueling(periodFuelings[0].id);
                                      }
                                      setDetailsPopoverOpen(null);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

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
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
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
