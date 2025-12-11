"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  format,
  getDay,
  addMonths,
  subMonths,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { toast as sonnerToast } from "sonner";
import type { DateRange } from "react-day-picker";
import {
  Filter,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarIcon,
  Fuel,
  X,
  Check,
  Search,
  Plus,
  Edit,
  Eye,
  PanelLeft,
  MoreHorizontal,
  Pin,
  PinOff,
  MapPin,
  Clock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  useFuelings,
  useCreateFueling,
  useUpdateFueling,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import type { Fueling, FuelType, VehicleCategory } from "@/types/vehicle";

interface FuelingRatesTableProps {
  vehicleId: string;
  fuelings: Fueling[];
}

// Day of week labels (Sunday=0 to Saturday=6)
const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

// Fuel type labels for display
const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  DIESEL: "Diesel",
  DIESEL_S10: "Diesel S10",
  GASOLINA: "Gasolina",
  ETANOL: "Etanol",
  ARLA32: "Arla 32",
};

// Category labels for display
const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  ONIBUS: "Ônibus",
  VAN: "Van",
  CARRO: "Carro",
  CAMINHAO: "Caminhão",
};

// Interface for grouped fueling data by period
interface FuelingPeriodData {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  provider: string;
  fuelType: FuelType;
  totalLiters: number;
  totalValue: number;
  unitPrice: number; // calculated: totalValue / totalLiters if not available
  odometer: number; // last odometer in period
  fuelingDays: number[]; // day of week indices (0-6) that had fueling
  fuelingDates: Date[]; // actual dates with fuelings
  category?: VehicleCategory;
  fuelingCount: number;
}

export function FuelingRatesTable({
  vehicleId,
  fuelings,
}: FuelingRatesTableProps) {
  const { t } = useI18n();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sheet/Modal states
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<FuelingPeriodData | null>(null);
  const [selectedFueling, setSelectedFueling] = useState<Fueling | null>(null);

  // Individual popover states for each row
  const [periodPopoverOpen, setPeriodPopoverOpen] = useState<string | null>(
    null
  );
  const [providerPopoverOpen, setProviderPopoverOpen] = useState<string | null>(
    null
  );
  const [fuelTypePopoverOpen, setFuelTypePopoverOpen] = useState<string | null>(
    null
  );
  const [litersPopoverOpen, setLitersPopoverOpen] = useState<string | null>(
    null
  );
  const [valuePopoverOpen, setValuePopoverOpen] = useState<string | null>(null);
  const [odometerPopoverOpen, setOdometerPopoverOpen] = useState<string | null>(
    null
  );
  const [detailsPopoverOpen, setDetailsPopoverOpen] = useState<string | null>(
    null
  );

  // Date range picker states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePickerMonth, setDatePickerMonth] = useState<Date>(new Date());

  // Inline edit form states
  const [editLiters, setEditLiters] = useState<number>(0);
  const [editValue, setEditValue] = useState<number>(0);
  const [editOdometer, setEditOdometer] = useState<number>(0);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pinned columns state - 'left' | 'right' | null
  type PinPosition = 'left' | 'right' | null;
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, PinPosition>>({});

  // Toggle pin for a column
  const togglePin = (columnId: string, position: PinPosition) => {
    setPinnedColumns(prev => ({
      ...prev,
      [columnId]: prev[columnId] === position ? null : position
    }));
  };

  // Get pin position for a column
  const getColumnPin = (columnId: string): PinPosition => pinnedColumns[columnId] || null;

  // Column widths for sticky position calculation (approximate)
  const columnWidths: Record<string, number> = {
    checkbox: 48,
    period: 200,
    provider: 150,
    fuelType: 120,
    liters: 100,
    totalValue: 130,
    unitPrice: 130,
    odometer: 110,
    category: 110,
    days: 240,
    actions: 48,
  };

  // Order of columns for pin calculation (maintains table order)
  const columnOrder = ['checkbox', 'period', 'provider', 'fuelType', 'liters', 'totalValue', 'unitPrice', 'odometer', 'category', 'days', 'actions'];

  // Get all pinned columns sorted by their position in table
  const getPinnedLeftColumns = (): string[] => {
    return columnOrder.filter(col => pinnedColumns[col] === 'left');
  };

  const getPinnedRightColumns = (): string[] => {
    return columnOrder.filter(col => pinnedColumns[col] === 'right');
  };

  // Calculate left position for a pinned-left column
  const getLeftPosition = (columnId: string): number => {
    // Always start after checkbox (48) and period (200) = 248
    const baseLeft = 248;
    const pinnedLeftCols = getPinnedLeftColumns();
    const colIndex = pinnedLeftCols.indexOf(columnId);
    if (colIndex < 0) return baseLeft;
    
    let left = baseLeft;
    for (let i = 0; i < colIndex; i++) {
      left += columnWidths[pinnedLeftCols[i]] || 100;
    }
    return left;
  };

  // Calculate right position for a pinned-right column  
  const getRightPosition = (columnId: string): number => {
    const pinnedRightCols = getPinnedRightColumns().reverse(); // rightmost first
    const colIndex = pinnedRightCols.indexOf(columnId);
    if (colIndex < 0) return 0;
    
    let right = 0;
    for (let i = 0; i < colIndex; i++) {
      right += columnWidths[pinnedRightCols[i]] || 100;
    }
    return right;
  };

  // Check if column is the last pinned on its side (for shadow)
  const isLastPinnedLeft = (columnId: string): boolean => {
    const pinnedLeftCols = getPinnedLeftColumns();
    if (pinnedLeftCols.length === 0) return columnId === 'period'; // period is always "last" fixed
    return pinnedLeftCols[pinnedLeftCols.length - 1] === columnId;
  };

  const isFirstPinnedRight = (columnId: string): boolean => {
    const pinnedRightCols = getPinnedRightColumns();
    if (pinnedRightCols.length === 0) return false;
    return pinnedRightCols[0] === columnId; // first in order = leftmost of right pins
  };

  // Get sticky class for a column with shadow
  const getStickyClass = (columnId: string): string => {
    const pin = pinnedColumns[columnId];
    if (!pin) return '';
    
    const baseClass = 'sticky bg-background z-30';
    
    if (pin === 'left') {
      const hasShadow = isLastPinnedLeft(columnId);
      return hasShadow 
        ? `${baseClass} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]` 
        : baseClass;
    }
    if (pin === 'right') {
      const hasShadow = isFirstPinnedRight(columnId);
      return hasShadow 
        ? `${baseClass} shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]` 
        : baseClass;
    }
    return '';
  };

  // Get sticky style for a column
  const getStickyStyle = (columnId: string): React.CSSProperties => {
    const pin = pinnedColumns[columnId];
    if (!pin) return {};
    if (pin === 'left') {
      return { left: getLeftPosition(columnId) };
    }
    if (pin === 'right') {
      return { right: getRightPosition(columnId) };
    }
    return {};
  };

  // Drag-to-scroll refs and state (like fueling-calendar)
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const isDraggingRef = useRef(false); // Track if actually dragging (moved > threshold)
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const activeViewportRef = useRef<HTMLElement | null>(null);
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before starting drag

  // Pointer handlers for drag-to-scroll
  const handleWindowPointerMove = (evt: PointerEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const dx = evt.clientX - startXRef.current;

    // Only start dragging if moved past threshold
    if (!isDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setIsGrabbing(true);
    }

    if (isDraggingRef.current) {
      const newLeft = scrollLeftRef.current - dx;
      activeViewportRef.current.scrollLeft = newLeft;
    }
  };

  const handleWindowPointerUp = (evt: PointerEvent) => {
    if (!isDownRef.current) return;
    try {
      activeViewportRef.current?.releasePointerCapture?.(
        (evt as any).pointerId
      );
    } catch {}
    isDownRef.current = false;
    isDraggingRef.current = false;
    setIsGrabbing(false);
    activeViewportRef.current = null;
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", handleWindowPointerUp);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
    try {
      document.body.style.userSelect = "";
    } catch {}
  };

  const handleWindowMouseMove = (evt: MouseEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const dx = evt.clientX - startXRef.current;

    // Only start dragging if moved past threshold
    if (!isDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setIsGrabbing(true);
    }

    if (isDraggingRef.current) {
      const newLeft = scrollLeftRef.current - dx;
      activeViewportRef.current.scrollLeft = newLeft;
    }
  };

  const handleWindowMouseUp = () => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    isDraggingRef.current = false;
    setIsGrabbing(false);
    activeViewportRef.current = null;
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", handleWindowPointerUp);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
    try {
      document.body.style.userSelect = "";
    } catch {}
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Don't start drag on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'button, input, [role="checkbox"], [data-radix-popper-content-wrapper]'
      )
    ) {
      return;
    }

    const viewport = dragRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;
    if (!viewport) return;
    activeViewportRef.current = viewport;
    isDownRef.current = true;
    isDraggingRef.current = false; // Reset - only set true after threshold
    startXRef.current = e.clientX;
    scrollLeftRef.current = viewport.scrollLeft;
    try {
      viewport.setPointerCapture?.(e.pointerId);
    } catch {}
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    try {
      document.body.style.userSelect = "none";
    } catch {}
  };

  // Use fuelings data
  const { data: fuelingsData, refetch } = useFuelings({ vehicleId });
  const currentFuelings = fuelingsData?.items ?? fuelings;

  // Mutations
  const createFueling = useCreateFueling();
  const updateFueling = useUpdateFueling();
  const deleteFueling = useDeleteFueling();

  // Get vehicle data for category
  const { data: vehicleData } = useVehicle(vehicleId);
  const vehicleCategory = vehicleData?.category;

  // Group fuelings by week periods and calculate real data
  const periodsData = useMemo<FuelingPeriodData[]>(() => {
    if (!currentFuelings || currentFuelings.length === 0) return [];

    // Sort fuelings by date
    const sortedFuelings = [...currentFuelings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by week (7-day periods)
    const periods: FuelingPeriodData[] = [];
    const processedDates = new Set<string>();

    sortedFuelings.forEach((fueling) => {
      const fuelingDate = new Date(fueling.date);
      const dateKey = format(fuelingDate, "yyyy-'W'ww"); // Week key

      if (!processedDates.has(dateKey)) {
        processedDates.add(dateKey);

        // Find all fuelings in this week
        const weekStart = new Date(fuelingDate);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekFuelings = sortedFuelings.filter((f) => {
          const d = new Date(f.date);
          return d >= weekStart && d <= weekEnd;
        });

        if (weekFuelings.length > 0) {
          // Calculate totals for the period
          const totalLiters = weekFuelings.reduce(
            (sum, f) => sum + (f.liters || 0),
            0
          );
          const totalValue = weekFuelings.reduce(
            (sum, f) => sum + (f.totalValue || 0),
            0
          );
          const lastOdometer = Math.max(
            ...weekFuelings.map((f) => f.odometer || 0)
          );

          // Get unique fuel types and providers
          const providers = [...new Set(weekFuelings.map((f) => f.provider))];
          const fuelTypes = [...new Set(weekFuelings.map((f) => f.fuelType))];

          // Calculate unit price: use average if available, otherwise totalValue/totalLiters
          const avgUnitPrice =
            weekFuelings.reduce((sum, f) => {
              if (f.unitPrice && f.unitPrice > 0) return sum + f.unitPrice;
              if (f.totalValue && f.liters)
                return sum + f.totalValue / f.liters;
              return sum;
            }, 0) / weekFuelings.length;

          // Get the days of the week that had fuelings
          const fuelingDates = weekFuelings.map((f) => new Date(f.date));
          const fuelingDays = [...new Set(fuelingDates.map((d) => getDay(d)))];

          periods.push({
            id: `period-${dateKey}-${weekFuelings[0].id}`,
            periodStart: weekStart,
            periodEnd: new Date(
              Math.max(...weekFuelings.map((f) => new Date(f.date).getTime()))
            ),
            periodLabel: `${format(weekStart, "dd/MM/yyyy")} - ${format(
              weekEnd,
              "dd/MM/yyyy"
            )}`,
            provider: providers.join(", "),
            fuelType: fuelTypes[0] || "DIESEL", // Use first or default
            totalLiters,
            totalValue,
            unitPrice:
              avgUnitPrice || (totalLiters > 0 ? totalValue / totalLiters : 0),
            odometer: lastOdometer,
            fuelingDays,
            fuelingDates,
            category: vehicleCategory,
            fuelingCount: weekFuelings.length,
          });
        }
      }
    });

    return periods;
  }, [currentFuelings, vehicleCategory]);

  // Filter periods by date range
  const filteredPeriodsData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return periodsData;
    return periodsData.filter((period) => {
      if (dateRange?.from && dateRange?.to) {
        return (
          (period.periodStart >= dateRange.from &&
            period.periodStart <= dateRange.to) ||
          (period.periodEnd >= dateRange.from &&
            period.periodEnd <= dateRange.to) ||
          (period.periodStart <= dateRange.from &&
            period.periodEnd >= dateRange.to)
        );
      }
      return true;
    });
  }, [periodsData, dateRange]);

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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Format number with decimals
  const formatNumber = (value: number, decimals = 2) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Day chip component - shows if a fueling happened on that day
  const DayChip = ({
    day,
    dayIndex,
    isActive,
    onClick,
  }: {
    day: string;
    dayIndex: number;
    isActive: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50",
        isActive
          ? "bg-foreground text-background"
          : "bg-background border-border border text-foreground"
      )}
    >
      {day}
    </button>
  );

  // Pinnable header content component
  const PinnableHeaderContent = ({ 
    columnId, 
    label 
  }: { 
    columnId: string; 
    label: string;
  }) => {
    const pin = getColumnPin(columnId);
    return (
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {pin && (
            <Pin className={cn(
              "h-3 w-3 text-primary",
              pin === 'right' && "rotate-90"
            )} />
          )}
          <span className="truncate">{label}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 -mr-1 shrink-0">
              {pin ? (
                <PinOff className="h-3 w-3" />
              ) : (
                <MoreHorizontal className="h-3 w-3" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {pin ? (
              <DropdownMenuItem onClick={() => togglePin(columnId, pin)}>
                <PinOff className="h-4 w-4 mr-2" />
                Desafixar coluna
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => togglePin(columnId, 'left')}>
                  <Pin className="h-4 w-4 mr-2" />
                  Fixar à esquerda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => togglePin(columnId, 'right')}>
                  <Pin className="h-4 w-4 mr-2 rotate-90" />
                  Fixar à direita
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Handle cell click - open inline edit popover
  const handleCellClick = (period: FuelingPeriodData) => {
    setSelectedPeriod(period);
    setEditingRowId(period.id);
    // Get first fueling from the period
    const periodFuelings = currentFuelings.filter((f) => {
      const fDate = new Date(f.date);
      return fDate >= period.periodStart && fDate <= period.periodEnd;
    });
    setSelectedFueling(periodFuelings[0] || null);
  };

  // Handle period click - open date range picker popover
  const handlePeriodClick = (periodId: string, period: FuelingPeriodData) => {
    setDateRange({ from: period.periodStart, to: period.periodEnd });
    setPeriodPopoverOpen(periodId);
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedPeriod(null);
    setSelectedFueling(null);
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

  // Date range presets
  const datePresets = [
    { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
    {
      label: "Ontem",
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return { from: d, to: d };
      },
    },
    {
      label: "Últimos 7 dias",
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 7);
        return { from, to };
      },
    },
    {
      label: "Últimos 30 dias",
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);
        return { from, to };
      },
    },
    {
      label: "Do mês até a data",
      getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }),
    },
    {
      label: "Mês passado",
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: "Do ano até a data",
      getValue: () => ({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      }),
    },
    {
      label: "Ano passado",
      getValue: () => ({
        from: new Date(new Date().getFullYear() - 1, 0, 1),
        to: new Date(new Date().getFullYear() - 1, 11, 31),
      }),
    },
  ];

  // Mock route data for sidebar
  const routeItems = [
    {
      id: "1",
      title: "Disponível",
      origin: "Aeroporto Galeão, Rio De Janeiro",
      destination: "Búzios, Armação Dos Búzios",
      schedule: "In – 08:30 às 23:30",
      badge: "+1",
    },
    {
      id: "2", 
      title: "Disponível",
      origin: "Aeroporto Galeão, Rio De Janeiro",
      destination: "Apa Pau, Armação Dos Búzios",
      schedule: "In – 08:30 às 23:30",
      badge: null,
    },
    {
      id: "3",
      title: "Disponível",
      origin: "Barra, Rio De Janeiro",
      destination: "Búzios, Armação Dos Búzios",
      schedule: "Interhotel – 07:00 às 12:00",
      badge: null,
    },
    {
      id: "4",
      title: "Disponível",
      origin: "Barra, Rio De Janeiro",
      destination: "Apa Pau, Armação Dos Búzios",
      schedule: "Interhotel – 07:00 às 12:00",
      badge: null,
    },
  ];

  return (
    <div className="flex h-full w-[95vw] ">
      {/* Inline Left Sidebar - pushes content */}
      <div 
        className={cn(
          "shrink-0 border-r border-border bg-background transition-all duration-300 ease-in-out overflow-hidden",
          sidebarOpen ? "w-[280px]" : "w-0"
        )}
      >
        <div className="flex flex-col h-full w-[280px]">
          {/* Search Header */}
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tarifa..."
                  className="pl-9 h-8 text-sm"
                />
              </div>
              <Button type="button" size="sm" className="h-8 px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Route Cards List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {routeItems.map((route) => (
                <div
                  key={route.id}
                  className="p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {/* Header with switch */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked className="scale-75" />
                      <span className="text-xs font-medium">{route.title}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Route info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-foreground line-clamp-1">{route.origin}</span>
                      {route.badge && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-auto">
                          {route.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground line-clamp-1">{route.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{route.schedule}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0   ">
        {/* Header Section */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
          {/* Left side - Panel Toggle & Title */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <h3 className="font-semibold text-sm">
                Histórico de Abastecimentos
              </h3>
              <p className="text-xs text-muted-foreground">
                {filteredPeriodsData.length} períodos
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Category Badge */}
            {vehicleCategory && (
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                {CATEGORY_LABELS[vehicleCategory] || vehicleCategory}
              </Badge>
            )}

            {/* Filters Button */}
            <Button type="button" variant="outline" size="sm" className="gap-1.5 h-8">
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>

            {/* Add Button with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="sm" className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Abastecimento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      {/* Table with drag-to-scroll */}
      <div
        ref={dragRef}
        onPointerDown={onPointerDown}
        className={cn("", isGrabbing && "cursor-grabbing select-none")}
      >
        <ScrollArea className="max-w-screen border-r border-border">
          <Table>
            <TableHeader variant="compact-fueling">
              <TableRow className="hover:bg-transparent">
                {/* Checkbox column - FIXED */}
                <TableHead variant="sticky-first" className="w-12">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                        selectedRows.size === paginatedData.length
                      }
                      onCheckedChange={toggleAllSelection}
                      className="translate-y-0.5"
                    />
                  </TableHead>

                  {/* Period - FIXED with dynamic shadow */}
                  <TableHead
                    variant="sticky-second"
                    sortable
                    className={cn(
                      "min-w-[180px]",
                      getPinnedLeftColumns().length === 0 && "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>Período</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => togglePin('period', 'left')}>
                            <Pin className="h-4 w-4 mr-2" />
                            {getColumnPin('period') === 'left' ? 'Desafixar' : 'Fixar à esquerda'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePin('period', 'right')}>
                            <Pin className="h-4 w-4 mr-2 rotate-90" />
                          {getColumnPin('period') === 'right' ? 'Desafixar' : 'Fixar à direita'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  </TableHead>

                  {/* Provider */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[130px]", getStickyClass('provider'))}
                    style={getStickyStyle('provider')}
                  >
                    <PinnableHeaderContent columnId="provider" label="Posto" />
                  </TableHead>

                  {/* Fuel Type */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[110px]", getStickyClass('fuelType'))}
                    style={getStickyStyle('fuelType')}
                  >
                    <PinnableHeaderContent columnId="fuelType" label="Combustível" />
                  </TableHead>

                  {/* Liters */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[90px]", getStickyClass('liters'))}
                    style={getStickyStyle('liters')}
                  >
                    <PinnableHeaderContent columnId="liters" label="Litros" />
                  </TableHead>

                  {/* Total Value */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[110px]", getStickyClass('totalValue'))}
                    style={getStickyStyle('totalValue')}
                  >
                    <PinnableHeaderContent columnId="totalValue" label="Valor Total" />
                  </TableHead>

                  {/* Unit Price */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[110px]", getStickyClass('unitPrice'))}
                    style={getStickyStyle('unitPrice')}
                  >
                    <PinnableHeaderContent columnId="unitPrice" label="Preço/L" />
                  </TableHead>

                  {/* Odometer */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[100px]", getStickyClass('odometer'))}
                    style={getStickyStyle('odometer')}
                  >
                    <PinnableHeaderContent columnId="odometer" label="Odômetro" />
                  </TableHead>

                  {/* Category */}
                  <TableHead
                    variant="minimal-fueling"
                    sortable
                    className={cn("min-w-[100px]", getStickyClass('category'))}
                    style={getStickyStyle('category')}
                  >
                    <PinnableHeaderContent columnId="category" label="Categoria" />
                  </TableHead>

                  {/* Fueling days */}
                  <TableHead
                    variant="minimal-fueling"
                    className="min-w-[200px]"
                  >
                    Dias c/ Abast.
                  </TableHead>

                  {/* Actions column */}
                  <TableHead variant="minimal-fueling" className="w-10" />
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
                      className={cn(
                        "group transition-colors hover:bg-muted/50",
                        selectedRows.has(period.id) && "bg-muted/30"
                      )}
                    >
                      {/* Checkbox - FIXED */}
                      <TableCell
                        variant="sticky-first"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.has(period.id)}
                          onCheckedChange={() => toggleRowSelection(period.id)}
                          className="translate-y-0.5"
                        />
                      </TableCell>

                      {/* Period - FIXED with dynamic shadow */}
                      <TableCell 
                        variant="sticky-second" 
                        className={cn(
                          "font-medium",
                          getPinnedLeftColumns().length === 0 && "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                        )}
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
                            className="flex items-center gap-2 px-3 py-1  cursor-pointer text-left transition-colors 
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
                            {/* <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> */}
                            <span>{period.periodLabel}</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                          side="bottom"
                        >
                          <div className="flex">
                            {/* Presets sidebar */}
                            <div className="border-r p-2 space-y-0.5 min-w-36 bg-popover">
                              {datePresets.map((preset) => (
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

                    {/* Provider - Popover with search */}
                    <TableCell 
                      variant="compact-fueling" 
                      className={cn("w-[150px]", getStickyClass('provider'))}
                      style={getStickyStyle('provider')}
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
                            className="truncate hover:bg-background/20 rounded-lg hover:py-2
             hover:ring-1 hover:ring-border
             cursor-pointer text-left px-5 transition-colors -mx-3 -my-1 "
                            title={period.provider}
                          >
                            {period.provider || "Selecione..."}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar posto..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum posto encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {[
                                  "Ipiranga",
                                  "Shell",
                                  "Petrobras",
                                  "BR",
                                  "Outro",
                                ].map((provider) => (
                                  <CommandItem
                                    key={provider}
                                    value={provider}
                                    onSelect={() => {
                                      setProviderPopoverOpen(null);
                                    }}
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

                    {/* Fuel Type - Popover with selector */}
                    <TableCell 
                      variant="compact-fueling"
                      className={getStickyClass('fuelType')}
                      style={getStickyStyle('fuelType')}
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
                            className=" hover:bg-background/20 border-none rounded-lg hover:py-2 
                hover:ring-1 hover:ring-border
                py-2 cursor-pointer text-left px-3 transition-colors "
                          >
                            {FUEL_TYPE_LABELS[period.fuelType] ||
                              period.fuelType}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-[180px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar..." />
                            <CommandList>
                              <CommandEmpty>Nenhum encontrado.</CommandEmpty>
                              <CommandGroup>
                                {Object.entries(FUEL_TYPE_LABELS).map(
                                  ([key, label]) => (
                                    <CommandItem
                                      key={key}
                                      value={key}
                                      onSelect={() =>
                                        setFuelTypePopoverOpen(null)
                                      }
                                    >
                                      {label}
                                      {period.fuelType === key && (
                                        <Check className="ml-auto h-4 w-4" />
                                      )}
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </TableCell>

                    {/* Liters - Popover with input */}
                    <TableCell 
                      variant="compact-fueling"
                      className={getStickyClass('liters')}
                      style={getStickyStyle('liters')}
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
             py-2 cursor-pointer text-left px-3  transition-colors "
                          >
                            {formatNumber(period.totalLiters)} L
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3" align="start">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">
                                Litros
                              </label>
                              <Input
                                type="number"
                                value={editLiters}
                                onChange={(e) =>
                                  setEditLiters(Number(e.target.value))
                                }
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
                                onClick={() => {
                                  // TODO: Save liters
                                  setLitersPopoverOpen(null);
                                }}
                              >
                                Salvar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>

                    {/* Total Value - Popover with input */}
                    <TableCell 
                      variant="compact-fueling"
                      className={getStickyClass('totalValue')}
                      style={getStickyStyle('totalValue')}
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
             py-2 cursor-pointer text-left px-3 transition-colors "
                          >
                            {formatCurrency(period.totalValue)}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3" align="start">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">
                                Valor Total (R$)
                              </label>
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) =>
                                  setEditValue(Number(e.target.value))
                                }
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
                                onClick={() => {
                                  // TODO: Save value
                                  setValuePopoverOpen(null);
                                }}
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
                      className={cn("px-8", getStickyClass('unitPrice'))}
                      style={getStickyStyle('unitPrice')}
                    >
                      {formatCurrency(period.unitPrice)}/L
                    </TableCell>

                    {/* Odometer - Popover with input */}
                    <TableCell 
                      variant="compact-fueling"
                      className={getStickyClass('odometer')}
                      style={getStickyStyle('odometer')}
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
             py-2 cursor-pointer text-left px-3 transition-colors "
                          >
                            {formatNumber(period.odometer, 0)} km
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-3" align="start">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-sm font-medium">
                                Odômetro (km)
                              </label>
                              <Input
                                type="number"
                                value={editOdometer}
                                onChange={(e) =>
                                  setEditOdometer(Number(e.target.value))
                                }
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
                                onClick={() => {
                                  // TODO: Save odometer
                                  setOdometerPopoverOpen(null);
                                }}
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
                      className={getStickyClass('category')}
                      style={getStickyStyle('category')}
                    >
                      {period.category ? (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {CATEGORY_LABELS[period.category] || period.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Fueling days - marks days that HAD fueling */}
                    <TableCell variant="compact-fueling">
                      <div className="flex items-center gap-1">
                        {WEEK_DAYS.map((day, index) => (
                          <DayChip
                            key={`${period.id}-day-${index}`}
                            day={day}
                            dayIndex={index}
                            isActive={period.fuelingDays.includes(index)}
                            onClick={() => {
                              setDetailsPopoverOpen(
                                detailsPopoverOpen === period.id
                                  ? null
                                  : period.id
                              );
                              handleCellClick(period);
                            }}
                          />
                        ))}
                      </div>
                    </TableCell>

                    {/* Actions with Details Popover */}
                    <TableCell
                      variant="compact-fueling"
                      onClick={(e) => e.stopPropagation()}
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
                        <PopoverContent
                          className="w-[320px] p-0"
                          align="end"
                          side="left"
                        >
                          <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">
                                Detalhes do Período
                              </h4>
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
                                <span className="text-muted-foreground">
                                  Período:
                                </span>
                                <span className="font-medium">
                                  {period.periodLabel}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Posto:
                                </span>
                                <span className="font-medium">
                                  {period.provider}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Combustível:
                                </span>
                                <span className="font-medium">
                                  {FUEL_TYPE_LABELS[period.fuelType]}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Litros:
                                </span>
                                <span className="font-medium">
                                  {formatNumber(period.totalLiters)} L
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Valor Total:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(period.totalValue)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Preço/Litro:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(period.unitPrice)}/L
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Odômetro:
                                </span>
                                <span className="font-medium">
                                  {formatNumber(period.odometer, 0)} km
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Abastecimentos:
                                </span>
                                <span className="font-medium">
                                  {period.fuelingCount}x
                                </span>
                              </div>
                            </div>

                            <Separator />

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => {
                                  setDetailsPopoverOpen(null);
                                  // Open edit mode or other action
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => {
                                  const periodFuelings = currentFuelings.filter(
                                    (f) => {
                                      const fDate = new Date(f.date);
                                      return (
                                        fDate >= period.periodStart &&
                                        fDate <= period.periodEnd
                                      );
                                    }
                                  );
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
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 ">
        {/* Selected count */}
        <p className="text-sm text-muted-foreground">
          {selectedRows.size} de {filteredPeriodsData.length} linha(s)
          selecionada(s).
        </p>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">/ página</span>
          </div>

          {/* Page info */}
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages || 1}
          </p>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
            >
              <span className="sr-only">Primeira página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span className="sr-only">Próxima página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <span className="sr-only">Última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
  );
}

// Fueling Form Component for Add/Edit
interface FuelingFormProps {
  vehicleId: string;
  fueling?: Fueling | null;
  onClose: () => void;
  onSuccess: () => void;
}

function FuelingForm({
  vehicleId,
  fueling,
  onClose,
  onSuccess,
}: FuelingFormProps) {
  const createFueling = useCreateFueling();
  const updateFueling = useUpdateFueling();
  const vehicleQuery = useVehicle(vehicleId);

  const isEdit = !!fueling;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateFuelingInput>({
    resolver: zodResolver(createFuelingSchema),
    defaultValues: {
      provider: fueling?.provider || "",
      fuelType: fueling?.fuelType || "DIESEL",
      odometer: fueling?.odometer ?? (undefined as unknown as number),
      liters: fueling?.liters ?? (undefined as unknown as number),
      totalValue: fueling?.totalValue ?? (undefined as unknown as number),
      unitPrice: fueling?.unitPrice ?? 0,
      date: fueling?.date ? new Date(fueling.date) : new Date(),
    },
  });

  // Set default odometer from vehicle if creating new
  useEffect(() => {
    if (!isEdit) {
      const km = vehicleQuery?.data?.currentKm;
      if (km !== undefined && km !== null) {
        setValue("odometer", Number(km));
      }
    }
  }, [vehicleQuery?.data?.currentKm, setValue, isEdit]);

  const onSubmit = async (formData: CreateFuelingInput) => {
    if (!formData.totalValue || Number(formData.totalValue) < 1) {
      sonnerToast.error("Valor total inválido");
      return;
    }
    if (!formData.liters || Number(formData.liters) < 1) {
      sonnerToast.error("Litros inválidos");
      return;
    }

    try {
      const odometerStop = Number(formData.odometer) || 0;
      const currentKm = vehicleQuery?.data?.currentKm;

      if (!isEdit && currentKm !== undefined && odometerStop < currentKm) {
        sonnerToast.error("KM de parada não pode ser menor que o KM atual");
        return;
      }

      if (isEdit && fueling) {
        await updateFueling.mutateAsync({
          id: fueling.id,
          ...formData,
          vehicleId,
          odometer: odometerStop,
        });
        sonnerToast.success("Abastecimento atualizado com sucesso!");
      } else {
        const payload = { ...formData, vehicleId, odometer: odometerStop };
        await createFueling.mutateAsync(payload);
        sonnerToast.success("Abastecimento criado com sucesso!");
      }
      onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao salvar";
      sonnerToast.error(message);
    }
  };

  const isSubmitting = createFueling.isPending || updateFueling.isPending;
  const fuelTypes: FuelType[] = [
    "DIESEL",
    "DIESEL_S10",
    "GASOLINA",
    "ETANOL",
    "ARLA32",
  ];
  const providers = ["Ipiranga", "Shell", "Petrobras", "BR", "Outro"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Period Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Período</label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(new Date(field.value), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "Selecione um período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {/* Days selection (visual indicator) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Dias não aplicáveis</label>
        <div className="flex gap-1">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                "w-9 h-9 rounded-md text-sm font-medium border transition-colors",
                "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Todas
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                <CommandGroup>
                  <CommandItem>Todas</CommandItem>
                  <CommandItem>Leito</CommandItem>
                  <CommandItem>Cama</CommandItem>
                  <CommandItem>Executivo</CommandItem>
                  <CommandItem>Semi-leito</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Provider */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Posto</label>
        <Select
          value={watch("provider") ?? ""}
          onValueChange={(value) => setValue("provider", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o posto" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Combustível</label>
        <Select
          value={watch("fuelType") ?? "DIESEL"}
          onValueChange={(value) => setValue("fuelType", value as FuelType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fuelTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {FUEL_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price fields grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Infantil</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Criança</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Adulto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Controller
              control={control}
              name="totalValue"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  className="pl-10"
                  placeholder="0.00"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Senior</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Liters and Odometer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Litros</label>
          <Controller
            control={control}
            name="liters"
            render={({ field }) => (
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 50"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">KM Atual</label>
          <Controller
            control={control}
            name="odometer"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="Ex: 50000"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>
      </div>

      {/* Min Pax */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Min Pax</label>
        <Input type="number" placeholder="0" defaultValue={0} />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Forma de Pagamento</label>
        <Select defaultValue="todas">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hidden unit price */}
      <input
        type="hidden"
        {...register("unitPrice", { valueAsNumber: true })}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}

export default FuelingRatesTable;
