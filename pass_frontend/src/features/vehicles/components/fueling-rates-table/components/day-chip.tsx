import { cn } from "@/lib/utils";
import type { DayChipProps } from "../types";

export function DayChip({ day, dayIndex, isActive, onClick }: DayChipProps) {
  return (
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
}
