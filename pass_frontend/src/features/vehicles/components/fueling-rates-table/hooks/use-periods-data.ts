import { useMemo } from "react";
import { format, getDay } from "date-fns";
import type { Fueling, VehicleCategory } from "@/types/vehicle";
import type { FuelingPeriodData, SortDirection } from "../types";
import type { DateRange } from "react-day-picker";

interface UsePeriodsDataParams {
  fuelings: Fueling[];
  vehicleCategory?: VehicleCategory;
  dateRange?: DateRange;
  sortColumn: string | null;
  sortDirection: SortDirection;
}

export function usePeriodsData({
  fuelings,
  vehicleCategory,
  dateRange,
  sortColumn,
  sortDirection,
}: UsePeriodsDataParams) {
  // Group fuelings by week periods and calculate real data
  const periodsData = useMemo<FuelingPeriodData[]>(() => {
    if (!fuelings || fuelings.length === 0) return [];

    const sortedFuelings = [...fuelings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const periods: FuelingPeriodData[] = [];
    const processedDates = new Set<string>();

    sortedFuelings.forEach((fueling) => {
      const fuelingDate = new Date(fueling.date);
      const dateKey = format(fuelingDate, "yyyy-'W'ww");

      if (!processedDates.has(dateKey)) {
        processedDates.add(dateKey);

        const weekStart = new Date(fuelingDate);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekFuelings = sortedFuelings.filter((f) => {
          const d = new Date(f.date);
          return d >= weekStart && d <= weekEnd;
        });

        if (weekFuelings.length > 0) {
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

          const providers = [...new Set(weekFuelings.map((f) => f.provider))];
          const fuelTypes = [...new Set(weekFuelings.map((f) => f.fuelType))];

          const avgUnitPrice =
            weekFuelings.reduce((sum, f) => {
              if (f.unitPrice && f.unitPrice > 0) return sum + f.unitPrice;
              if (f.totalValue && f.liters)
                return sum + f.totalValue / f.liters;
              return sum;
            }, 0) / weekFuelings.length;

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
            fuelType: fuelTypes[0] || "DIESEL",
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
  }, [fuelings, vehicleCategory]);

  // Filter and sort periods by date range and sort state
  const filteredPeriodsData = useMemo(() => {
    let result = periodsData;

    // Apply date range filter
    if (dateRange?.from || dateRange?.to) {
      result = result.filter((period) => {
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
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case "period":
            aValue = a.periodStart.getTime();
            bValue = b.periodStart.getTime();
            break;
          case "provider":
            aValue = a.provider.toLowerCase();
            bValue = b.provider.toLowerCase();
            break;
          case "fuelType":
            aValue = a.fuelType;
            bValue = b.fuelType;
            break;
          case "liters":
            aValue = a.totalLiters;
            bValue = b.totalLiters;
            break;
          case "totalValue":
            aValue = a.totalValue;
            bValue = b.totalValue;
            break;
          case "unitPrice":
            aValue = a.unitPrice;
            bValue = b.unitPrice;
            break;
          case "odometer":
            aValue = a.odometer;
            bValue = b.odometer;
            break;
          case "category":
            aValue = a.category || "";
            bValue = b.category || "";
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [periodsData, dateRange, sortColumn, sortDirection]);

  return {
    periodsData,
    filteredPeriodsData,
  };
}
