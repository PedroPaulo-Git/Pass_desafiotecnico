import type { FuelType, VehicleCategory } from "@/types/vehicle";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { DatePreset, Profile, ColumnWidths } from "./types";

// Day of week labels (Sunday=0 to Saturday=6)
export const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

// Fuel type labels for display
export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  DIESEL: "Diesel",
  DIESEL_S10: "Diesel S10",
  GASOLINA: "Gasolina",
  ETANOL: "Etanol",
  ARLA32: "Arla 32",
};

// Category labels for display
export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  ONIBUS: "Ônibus",
  VAN: "Van",
  CARRO: "Carro",
  CAMINHAO: "Caminhão",
};

// Available fuel types
export const FUEL_TYPES: FuelType[] = [
  "DIESEL",
  "DIESEL_S10",
  "GASOLINA",
  "ETANOL",
  "ARLA32",
];

// Available providers
export const PROVIDERS = ["Ipiranga", "Shell", "Petrobras", "BR", "Outro"];

// Column widths for sticky position calculation - FIXED widths for alignment
export const COLUMN_WIDTHS: ColumnWidths = {
  checkbox: 52,
  period: 200,
  provider: 160,
  fuelType: 160,
  liters: 150,
  totalValue: 160,
  unitPrice: 160,
  odometer: 140,
  category: 140,
  days: 260,
  actions: 60,
};

// Base order of columns (original table order without pinning)
export const BASE_COLUMN_ORDER = [
  "checkbox",
  "period",
  "category",
  "provider",
  "fuelType",
  "liters",
  "totalValue",
  "unitPrice",
  "odometer",
  "days",
  "actions",
];

// Drag threshold for scroll
export const DRAG_THRESHOLD = 5;

// Default profiles
export const DEFAULT_PROFILES: Profile[] = [
  {
    id: "p1",
    name: "E-Commerce",
    typeLabel: "Canal de Venda",
    icon: "building",
  },
  {
    id: "p2",
    name: "Clientes VIP",
    typeLabel: "Grupo de Usuários",
    icon: "users",
  },
  {
    id: "p3",
    name: "Funcionários Internos",
    typeLabel: "Grupo de Usuários",
    icon: "users",
  },
  { id: "p4", name: "João Pereira", typeLabel: "Usuário", icon: "user" },
  { id: "p5", name: "Maria Silva", typeLabel: "Usuário", icon: "user" },
];

// Date range presets
export const DATE_PRESETS: DatePreset[] = [
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
