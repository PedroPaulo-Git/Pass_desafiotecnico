import { useState, useCallback } from "react";
import type { PinPosition, SortDirection } from "../types";
import { COLUMN_WIDTHS, BASE_COLUMN_ORDER } from "../constants";

export function useColumnPinning(initialPinned: Record<string, PinPosition> = { period: "left" }) {
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, PinPosition>>(initialPinned);

  const togglePin = useCallback((columnId: string, position: PinPosition) => {
    setPinnedColumns((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === position ? null : position,
    }));
  }, []);

  const getColumnPin = useCallback((columnId: string): PinPosition => {
    return pinnedColumns[columnId] || null;
  }, [pinnedColumns]);

  const getVisualColumnOrder = useCallback((): string[] => {
    const pinnedLeft: string[] = [];
    const pinnedRight: string[] = [];
    const unpinned: string[] = [];

    BASE_COLUMN_ORDER.forEach((col) => {
      if (col === "checkbox" || col === "actions") return;

      const pin = pinnedColumns[col];
      if (pin === "left") {
        pinnedLeft.push(col);
      } else if (pin === "right") {
        pinnedRight.push(col);
      } else {
        unpinned.push(col);
      }
    });

    return ["checkbox", ...pinnedLeft, ...unpinned, ...pinnedRight, "actions"];
  }, [pinnedColumns]);

  const getPinnedLeftColumns = useCallback((): string[] => {
    return BASE_COLUMN_ORDER.filter((col) => pinnedColumns[col] === "left");
  }, [pinnedColumns]);

  const getPinnedRightColumns = useCallback((): string[] => {
    return BASE_COLUMN_ORDER.filter((col) => pinnedColumns[col] === "right");
  }, [pinnedColumns]);

  const getLeftPosition = useCallback((columnId: string): number => {
    const checkboxWidth = COLUMN_WIDTHS.checkbox;
    const pinnedLeftCols = getPinnedLeftColumns();
    const colIndex = pinnedLeftCols.indexOf(columnId);

    if (colIndex < 0) return checkboxWidth;

    let left = checkboxWidth;
    for (let i = 0; i < colIndex; i++) {
      left += COLUMN_WIDTHS[pinnedLeftCols[i]] || 100;
    }
    return left;
  }, [getPinnedLeftColumns]);

  const getRightPosition = useCallback((columnId: string): number => {
    const pinnedRightCols = getPinnedRightColumns().reverse();
    const colIndex = pinnedRightCols.indexOf(columnId);
    if (colIndex < 0) return 0;

    let right = 0;
    for (let i = 0; i < colIndex; i++) {
      right += COLUMN_WIDTHS[pinnedRightCols[i]] || 100;
    }
    return right;
  }, [getPinnedRightColumns]);

  const isLastPinnedLeft = useCallback((columnId: string): boolean => {
    const pinnedLeftCols = getPinnedLeftColumns();
    if (pinnedLeftCols.length === 0) return false;
    return pinnedLeftCols[pinnedLeftCols.length - 1] === columnId;
  }, [getPinnedLeftColumns]);

  const isFirstPinnedRight = useCallback((columnId: string): boolean => {
    const pinnedRightCols = getPinnedRightColumns();
    if (pinnedRightCols.length === 0) return false;
    return pinnedRightCols[0] === columnId;
  }, [getPinnedRightColumns]);

  const shouldPeriodShowShadow = useCallback((): boolean => {
    return isLastPinnedLeft("period");
  }, [isLastPinnedLeft]);

  const isPeriodPinnedLeft = useCallback((): boolean => {
    return pinnedColumns["period"] === "left";
  }, [pinnedColumns]);

  const getStickyClass = useCallback((columnId: string): string => {
    const pin = pinnedColumns[columnId];
    if (!pin) return "";

    const baseClass = "sticky bg-background/95 backdrop-blur-sm z-30";

    if (pin === "left") {
      const isLast = isLastPinnedLeft(columnId);
      return isLast
        ? `${baseClass} shadow-[inset_-1px_0_0_var(--color-border)]`
        : baseClass;
    }
    if (pin === "right") {
      const hasShadow = isFirstPinnedRight(columnId);
      return hasShadow
        ? `${baseClass} shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]`
        : baseClass;
    }
    return "";
  }, [pinnedColumns, isLastPinnedLeft, isFirstPinnedRight]);

  const getColumnCSSOrder = useCallback((columnId: string): number => {
    const visualOrder = getVisualColumnOrder();
    return visualOrder.indexOf(columnId);
  }, [getVisualColumnOrder]);

  const getStickyStyle = useCallback((columnId: string): React.CSSProperties => {
    const pin = pinnedColumns[columnId];
    const order = getColumnCSSOrder(columnId);
    const width = COLUMN_WIDTHS[columnId] || 100;

    const baseStyle: React.CSSProperties = {
      order,
      width,
      minWidth: width,
      maxWidth: width,
      flexShrink: 0,
      flexGrow: 0,
    };

    if (!pin) return baseStyle;
    if (pin === "left") return { ...baseStyle, left: getLeftPosition(columnId) };
    if (pin === "right") return { ...baseStyle, right: getRightPosition(columnId) };
    return baseStyle;
  }, [pinnedColumns, getColumnCSSOrder, getLeftPosition, getRightPosition]);

  return {
    pinnedColumns,
    togglePin,
    getColumnPin,
    getVisualColumnOrder,
    getPinnedLeftColumns,
    getPinnedRightColumns,
    getLeftPosition,
    getRightPosition,
    isLastPinnedLeft,
    isFirstPinnedRight,
    shouldPeriodShowShadow,
    isPeriodPinnedLeft,
    getStickyClass,
    getColumnCSSOrder,
    getStickyStyle,
  };
}
