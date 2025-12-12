import { useState, useCallback } from "react";
import type { SortDirection } from "../types";

export function useColumnSorting() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleSort = useCallback((columnId: string) => {
    if (sortColumn !== columnId) {
      setSortColumn(columnId);
      setSortDirection("asc");
    } else {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    }
  }, [sortColumn, sortDirection]);

  const getColumnSort = useCallback((columnId: string): SortDirection => {
    return sortColumn === columnId ? sortDirection : null;
  }, [sortColumn, sortDirection]);

  return {
    sortColumn,
    sortDirection,
    toggleSort,
    getColumnSort,
  };
}
