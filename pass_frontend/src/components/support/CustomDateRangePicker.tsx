import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerRange } from "@/components/ui/data-picker-range";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

interface DateRangePreset {
  label: string;
  getValue: () => { from: Date; to: Date };
}

interface CustomDateRangePickerProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  presets: DateRangePreset[];
  placeholder?: string;
  className?: string;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  dateRange,
  setDateRange,
  presets,
  placeholder = "Selecione o período",
  className,
}) => {
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const datePickerPlaceholder =
    dateRange?.from && dateRange?.to
      ? `${capitalize(
          format(dateRange.from, "EEEE", { locale: ptBR })
        )}, ${format(dateRange.from, "dd MMM", {
          locale: ptBR,
        })} - ${capitalize(
          format(dateRange.to, "EEEE", { locale: ptBR })
        )}, ${format(dateRange.to, "dd MMM", { locale: ptBR })} • ${
          differenceInDays(dateRange.to, dateRange.from) + 1
        } dias`
      : placeholder;

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal h-11 bg-border border-0 ${
            className || ""
          }`}
          aria-label={
            dateRange?.from && dateRange?.to
              ? `Período selecionado: ${format(dateRange.from, "d 'de' MMM.", {
                  locale: ptBR,
                })} - ${format(dateRange.to, "d 'de' MMM.", { locale: ptBR })}`
              : placeholder
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, "d 'de' MMM.", {
                  locale: ptBR,
                })} - ${format(dateRange.to, "d 'de' MMM.", { locale: ptBR })}`
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        avoidCollisions={false}
        className="max-w-[280px] p-0 bg-popover"
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Atalhos Rápidos
          </h3>
          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                onClick={() => {
                  const range = preset.getValue();
                  setDateRange(range);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <hr className="border-t " />
        <div className="p-4 ">
             <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Personalizado
          </h3>
          <DatePickerRange
            dateRange={dateRange}
            setDateRange={setDateRange}
            placeholder={datePickerPlaceholder}
            className="h-11 bg-border border-0 flex-1 overflow-x-hidden "
            showFooter={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
