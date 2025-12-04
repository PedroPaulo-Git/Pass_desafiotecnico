export type VehicleStatus =
  | "LIBERADO"
  | "EM_MANUTENCAO"
  | "INDISPONIVEL"
  | "VENDIDO";
export type FuelType =
  | "DIESEL"
  | "DIESEL_S10"
  | "GASOLINA"
  | "ETANOL"
  | "ARLA32";
export type VehicleCategory = "ONIBUS" | "VAN" | "CARRO" | "CAMINHAO";
export type VehicleClassification = "PREMIUM" | "BASIC" | "EXECUTIVO";
export type SeverityLevel = "BAIXA" | "MEDIA" | "ALTA" | "GRAVE";

export interface Vehicle {
  id: string;
  internalId: string | null;
  plate: string;
  renavam: string | null;
  chassis: string | null;
  model: string;
  brand: string;
  year: number;
  color: string | null;
  category: VehicleCategory;
  classification: VehicleClassification;
  capacity: number;
  doors: number;
  fuelType: FuelType;
  state: string | null;
  currentKm: number;
  status: VehicleStatus;
  companyName: string | null;
  description: string | null;
  images: VehicleImage[];
  fuelings: Fueling[];
  incidents: Incident[];
  documents: VehicleDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  vehicleId: string;
}

export interface Fueling {
  id: string;
  vehicleId: string;
  date: string;
  provider: string;
  fuelType: FuelType;
  liters: number;
  totalValue: number;
  unitPrice: number;
  odometer: number;
  receiptUrl: string | null;
  createdAt: string;
}

export interface Incident {
  id: string;
  vehicleId: string;
  title: string | null;
  classification: string;
  severity: SeverityLevel;
  date: string;
  description: string | null;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  name: string;
  expiryDate: string;
  alertDays: number | null;
  activeAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  plate?: string;
  brand?: string;
  status?: VehicleStatus;
  category?: VehicleCategory;
  classification?: VehicleClassification;
  state?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}
