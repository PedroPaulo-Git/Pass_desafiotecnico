import type { DateRange } from "react-day-picker";
import type { Fueling, FuelType, VehicleCategory } from "@/types/vehicle";

// Pin position type
export type PinPosition = "left" | "right" | null;

// Sort direction type
export type SortDirection = "asc" | "desc" | null;

// Interface for grouped fueling data by period
export interface FuelingPeriodData {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  provider: string;
  fuelType: FuelType;
  totalLiters: number;
  totalValue: number;
  unitPrice: number;
  odometer: number;
  fuelingDays: number[];
  fuelingDates: Date[];
  category?: VehicleCategory;
  fuelingCount: number;
}

// Main component props
export interface FuelingRatesTableProps {
  vehicleId: string;
  fuelings: Fueling[];
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onToggleFiltersSidebar?: () => void;
  filtersOpen?: boolean;
}

// Fueling Form props
export interface FuelingFormProps {
  vehicleId: string;
  fueling?: Fueling | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Day chip props
export interface DayChipProps {
  day: string;
  dayIndex: number;
  isActive: boolean;
  onClick?: () => void;
}

// Pinnable header content props
export interface PinnableHeaderContentProps {
  columnId: string;
  label: string;
  pin: PinPosition;
  sort: SortDirection;
  onToggleSort: (columnId: string) => void;
  onTogglePin: (columnId: string, position: PinPosition) => void;
  disableIcons?: boolean;
}

// Profile type
export interface Profile {
  id: string;
  name: string;
  typeLabel: string;
  icon: "building" | "users" | "user";
}

// Date preset type
export interface DatePreset {
  label: string;
  getValue: () => { from: Date; to: Date };
}

// Column widths type
export type ColumnWidths = Record<string, number>;

// Popover states
export interface PopoverStates {
  periodPopoverOpen: string | null;
  providerPopoverOpen: string | null;
  fuelTypePopoverOpen: string | null;
  litersPopoverOpen: string | null;
  valuePopoverOpen: string | null;
  unitPricePopoverOpen: string | null;
  odometerPopoverOpen: string | null;
  detailsPopoverOpen: string | null;
}
export interface FuelingScrollTableProps {
  selectedPeriod: FuelingPeriodData | null;
  paginatedData: FuelingPeriodData[];
  selectedRows: Set<string>;
  toggleAllSelection: () => void;
  toggleRowSelection: (id: string) => void;
  handleDeleteFueling: (id: string) => void;
  setPeriodPopoverOpen: (id: string | null) => void;
  periodPopoverOpen: string | null;
  setDateRange: (range: any) => void;
  dateRange: any;
  setDatePickerMonth: (date: Date) => void;
  datePickerMonth: Date;
  setProviderPopoverOpen: (id: string | null) => void;
  providerPopoverOpen: string | null;
  setFuelTypePopoverOpen: (id: string | null) => void;
  fuelTypePopoverOpen: string | null;
  setCategoryPopoverOpen: (id: string | null) => void;
  categoryPopoverOpen: string | null;
  setDetailsPopoverOpen: (id: string | null) => void;
  detailsPopoverOpen: string | null;
  handleCellClick: (period: FuelingPeriodData) => void;
  currentFuelings: any[];
  onUpdateField: (periodId: string, field: string, value: any) => void;
}
