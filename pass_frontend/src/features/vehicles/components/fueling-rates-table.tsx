// Re-export the modularized FuelingRatesTable component
import { FuelingRatesTable as FuelingRatesTableComponent } from "./fueling-rates-table/index";
export { FuelingRatesTableComponent as FuelingRatesTable };
export default FuelingRatesTableComponent;

// Re-export types for external use
export type {
  FuelingRatesTableProps,
  FuelingPeriodData,
  FuelingFormProps,
} from "./fueling-rates-table/types";
