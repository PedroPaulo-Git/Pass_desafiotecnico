"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  variant?: "default" | "modal"
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  variant = "default",
}: DatePickerProps) {
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
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          today={undefined}
        />
      </PopoverContent>
    </Popover>
  )
}