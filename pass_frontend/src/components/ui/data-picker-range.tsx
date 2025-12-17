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
}: DatePickerRangeProps) {
  const isModal = variant === "modal";

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={isModal ? "ghost" : "outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-8",
            isModal && "bg-background border rounded-sm",
            !date && "text-muted-foreground",
            className
          )}
        >
          {isModal ? (
            <>
              <CalendarIcon className=" h-4 w-4" />
              {date?.from && date?.to ? (
                `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`
              ) : (
                <span>{placeholder}</span>
              )}
          
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from && date?.to ? (
                `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`
              ) : (
                <span>{placeholder}</span>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
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
          <div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(r) => setDateRange && setDateRange(r)}
              numberOfMonths={2}
              locale={locale}
              // month={datePickerMonth}
              // onMonthChange={setDatePickerMonth}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
