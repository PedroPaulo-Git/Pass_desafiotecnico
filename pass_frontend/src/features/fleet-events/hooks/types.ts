// Centralized filter types for fleet-events hooks
export type FuelingFilters = {
  page?: number;
  limit?: number;
  provider?: string;
  vehicleId?: string;
  fuelType?: string;
  dateFrom?: string;
  dateTo?: string;
  minOdometer?: number;
  maxOdometer?: number;
  minLiters?: number;
  maxLiters?: number;
  minUnitPrice?: number;
  maxUnitPrice?: number;
  totalValue?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export type IncidentFilters = {
  page?: number;
  limit?: number;
  severity?: string;
  classification?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export type DocumentFilters = {
  page?: number;
  limit?: number;
  name?: string;
  vehicleId?: string;
  activeAlert?: boolean;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  expiringWithinDays?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export default {} as const;
