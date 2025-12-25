"use client";

import * as React from "react";
import { format, Locale } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { DATE_PRESETS } from "@/features/vehicles/components/fueling-rates-table/constants";

interface DatePickerRangeProps {
  locale?: Locale;
  presets?: typeof DATE_PRESETS;
  date?: DateRange;
  setDateRange?: (dateRange: DateRange | undefined) => void;
  dateRange?: DateRange;
  placeholder?: string;
  className?: string;
  variant?: "default" | "modal" | "modal-range";
  showFooter?: boolean;
}

export function DatePickerRange({
  locale,
  presets,
  setDateRange,
  dateRange,
  date,
  placeholder = "Pick a date",
  className,
  variant = "default",
  showFooter = false,
}: DatePickerRangeProps) {
  const isModal = variant === "modal";

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={isModal ? "ghost" : "outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-8 ",
            isModal && "bg-background border rounded-sm",
            !date && "text-muted-foreground ",
            className
          )}
        >
          {isModal ? (
            <>
              <CalendarIcon className=" h-4 w-4" />
              {date?.from && date?.to ? (
                `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`
              ) : (
                <span className="">{placeholder}</span>
              )}
          
            </>
          ) : (
            <>
              <CalendarIcon className=" h-4 w-4" />
              {date?.from && date?.to ? (
                `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`
              ) : (
                <span className="w-[85%] overflow-hidden">{placeholder}</span>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="top" align="center" sideOffset={4} avoidCollisions={false}>
        <div className="flex">
          <div className="space-y-0.5 max-w-40 my-auto">
            {presets?.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                onClick={() => {
                  const range = preset.getValue();
                  if (setDateRange) setDateRange(range);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(r) => setDateRange && setDateRange(r)}
              numberOfMonths={2}
              locale={locale}
              className="min-h-[300px]"
              // month={datePickerMonth}
              // onMonthChange={setDatePickerMonth}
            />
            {showFooter && (
              <div className="p-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{placeholder}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange && setDateRange(undefined)}
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
