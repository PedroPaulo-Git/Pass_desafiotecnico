"use client";

import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { Trash2, Check, X, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { FuelingPeriodData } from "../types";
import {
  WEEK_DAYS,
  FUEL_TYPE_LABELS,
  CATEGORY_LABELS,
  COLUMN_WIDTHS,
  DATE_PRESETS,
  PROVIDERS,
} from "../constants";
import { useDragToScroll, useColumnPinning, useColumnSorting } from "../hooks";
import { DayChip, PinnableHeaderContent } from "../components";
import { formatCurrency, formatNumber } from "../utils";

import { FuelingScrollTableProps } from "../types";
export function FuelingScrollTable({
  selectedPeriod,
  paginatedData,
  selectedRows,
  toggleAllSelection,
  toggleRowSelection,
  handleDeleteFueling,
  setPeriodPopoverOpen,
  periodPopoverOpen,
  setDateRange,
  dateRange,
  setDatePickerMonth,
  datePickerMonth,
  setProviderPopoverOpen,
  providerPopoverOpen,
  setFuelTypePopoverOpen,
  fuelTypePopoverOpen,
  setCategoryPopoverOpen,
  categoryPopoverOpen,
  setDetailsPopoverOpen,
  detailsPopoverOpen,
  handleCellClick,
  currentFuelings,
  onUpdateField,
}: FuelingScrollTableProps) {
  const {
    togglePin,
    getColumnPin,
    shouldPeriodShowShadow,
    isPeriodPinnedLeft,
    getStickyClass,
    getColumnCSSOrder,
    getStickyStyle,
  } = useColumnPinning();
  const { toggleSort, getColumnSort } = useColumnSorting();
  const { dragRef, isGrabbing, onPointerDown } = useDragToScroll();

  const [editingField, setEditingField] = useState<{
    periodId: string;
    field: string;
  } | null>(null);

  const handleFieldClick = (periodId: string, field: string) => {
    setEditingField({ periodId, field });
  };

  const handleFieldBlur = (periodId: string, field: string, newValue: number) => {
    console.log("handleFieldBlur", { periodId, field, newValue });
    onUpdateField(periodId, field, newValue);
    setEditingField(null);
  };

  const handleFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    periodId: string,
    field: string
  ) => {
    if (e.key === "Enter") {
      const newValue = Number((e.target as HTMLInputElement).value);
      console.log("handleFieldKeyDown Enter", { periodId, field, newValue });
      onUpdateField(periodId, field, newValue);
      setEditingField(null);
    } else if (e.key === "Escape") {
      console.log("handleFieldKeyDown Escape");
      setEditingField(null);
    }
  };
  function ActionsMenu() {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e: React.MouseEvent) => {
            console.log("teste");
          }}
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      onPointerDown={onPointerDown}
      className={cn("", isGrabbing && "cursor-grabbing select-none")}
    >
      <ScrollArea className="max-w-screen border-x border-border">
        <Table>
          <TableHeader variant="compact-fueling">
            <TableRow className="hover:bg-transparent" flexLayout>
              {/* Checkbox */}
              <TableHead
                variant="sticky-first"
                flexCell
                style={{
                  order: getColumnCSSOrder("checkbox"),
                  width: COLUMN_WIDTHS.checkbox,
                  minWidth: COLUMN_WIDTHS.checkbox,
                  maxWidth: COLUMN_WIDTHS.checkbox,
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                <Checkbox
                  checked={
                    paginatedData.length > 0 &&
                    selectedRows.size === paginatedData.length
                  }
                  onCheckedChange={toggleAllSelection}
                  className="translate-y-0.5"
                />
              </TableHead>

              {/* Period */}
              <TableHead
                variant={
                  isPeriodPinnedLeft() && paginatedData.length !== 0
                    ? "sticky-second"
                    : "minimal-fueling"
                }
                sortable
                flexCell
                className={cn(
                  isPeriodPinnedLeft() &&
                    shouldPeriodShowShadow() &&
                    "shadow-[inset_-1px_0_0_var(--color-border)]"
                )}
                style={{
                  order: getColumnCSSOrder("period"),
                  width: COLUMN_WIDTHS.period,
                  minWidth: COLUMN_WIDTHS.period,
                  maxWidth: COLUMN_WIDTHS.period,
                  flexShrink: 0,
                  flexGrow: 0,
                  ...(isPeriodPinnedLeft() && { left: COLUMN_WIDTHS.checkbox }),
                }}
              >
                <PinnableHeaderContent
                  columnId="period"
                  label="Período"
                  pin={getColumnPin("period")}
                  sort={getColumnSort("period")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                />
              </TableHead>

              {/* Categoria */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("category"))}
                style={getStickyStyle("category")}
              >
                <PinnableHeaderContent
                  columnId="category"
                  label="Categoria"
                  pin={getColumnPin("category")}
                  sort={getColumnSort("category")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                />
              </TableHead>

              {/* Posto */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("provider"))}
                style={getStickyStyle("provider")}
              >
                <PinnableHeaderContent
                  columnId="provider"
                  label="Posto"
                  pin={getColumnPin("provider")}
                  sort={getColumnSort("provider")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                />
              </TableHead>

              {/* Combustível */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("fuelType"))}
                style={getStickyStyle("fuelType")}
              >
                <PinnableHeaderContent
                  columnId="fuelType"
                  label="Combustível"
                  pin={getColumnPin("fuelType")}
                  sort={getColumnSort("fuelType")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                />
              </TableHead>

              {/* Odômetro */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("odometer"))}
                style={getStickyStyle("odometer")}
              >
                <PinnableHeaderContent
                  columnId="odometer"
                  label="Odômetro"
                  pin={getColumnPin("odometer")}
                  sort={getColumnSort("odometer")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                  disableIcons={true}
                />
              </TableHead>

              {/* Preço/L */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("unitPrice"))}
                style={getStickyStyle("unitPrice")}
              >
                <PinnableHeaderContent
                  columnId="unitPrice"
                  label="Preço/L"
                  pin={getColumnPin("unitPrice")}
                  sort={getColumnSort("unitPrice")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                  disableIcons={true}
                />
              </TableHead>

              {/* Valor Total */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("totalValue"))}
                style={getStickyStyle("totalValue")}
              >
                <PinnableHeaderContent
                  columnId="totalValue"
                  label="Valor Total"
                  pin={getColumnPin("totalValue")}
                  sort={getColumnSort("totalValue")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                  disableIcons={true}
                />
              </TableHead>

              {/* Litros */}
              <TableHead
                variant="minimal-fueling"
                sortable
                flexCell
                className={cn("", getStickyClass("liters"))}
                style={getStickyStyle("liters")}
              >
                <PinnableHeaderContent
                  columnId="liters"
                  label="Litros"
                  pin={getColumnPin("liters")}
                  sort={getColumnSort("liters")}
                  onToggleSort={toggleSort}
                  onTogglePin={togglePin}
                  disableIcons={true}
                />
              </TableHead>

              {/* Dias c/ Abast */}
              <TableHead
                variant="minimal-fueling"
                flexCell
                className={cn("", getStickyClass("days"))}
                style={getStickyStyle("days")}
              >
                Dias c/ Abast.
              </TableHead>

              {/* Actions */}
              <TableHead
                variant="minimal-fueling"
                flexCell
                style={{
                  order: getColumnCSSOrder("actions"),
                  width: COLUMN_WIDTHS.actions,
                  minWidth: COLUMN_WIDTHS.actions,
                  maxWidth: COLUMN_WIDTHS.actions,
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center z-10">
                  <p className="text-muted-foreground">
                    Nenhum registro encontrado
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((period, index) => (
                <TableRow
                  key={`period-${index}`}
                  flexLayout
                  className={cn(
                    "group transition-colors hover:bg-muted/50",
                    selectedRows.has(period.id) &&
                      "bg-muted/30 border-l-2 border-foreground"
                  )}
                >
                  {/* Checkbox */}
                  <TableCell
                    variant="sticky-first"
                    flexCell
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      order: getColumnCSSOrder("checkbox"),
                      width: COLUMN_WIDTHS.checkbox,
                      minWidth: COLUMN_WIDTHS.checkbox,
                      maxWidth: COLUMN_WIDTHS.checkbox,
                      flexShrink: 0,
                      flexGrow: 0,
                    }}
                  >
                    <Checkbox
                      checked={selectedRows.has(period.id)}
                      onCheckedChange={() => toggleRowSelection(period.id)}
                      className="translate-y-0.5"
                    />
                  </TableCell>

                  {/* Period */}
                  <TableCell
                    variant={
                      isPeriodPinnedLeft() ? "sticky-second" : "compact-fueling"
                    }
                    flexCell
                    className={cn(
                      "font-medium",
                      isPeriodPinnedLeft() &&
                        shouldPeriodShowShadow() &&
                        "shadow-[inset_-1px_0_0_var(--color-border)]"
                    )}
                    style={{
                      order: getColumnCSSOrder("period"),
                      width: COLUMN_WIDTHS.period,
                      minWidth: COLUMN_WIDTHS.period,
                      maxWidth: COLUMN_WIDTHS.period,
                      flexShrink: 0,
                      flexGrow: 0,
                      ...(isPeriodPinnedLeft() && {
                        left: COLUMN_WIDTHS.checkbox,
                      }),
                    }}
                  >
                    <Popover
                      open={periodPopoverOpen === period.id}
                      onOpenChange={(open) =>
                        setPeriodPopoverOpen(open ? period.id : null)
                      }
                      modal={true}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-1 cursor-pointer text-left transition-colors 
                                  truncate hover:bg-background/20 rounded-lg hover:py-2
                                  hover:ring-1 hover:ring-border -mx-3 -my-1"
                          onClick={() => {
                            setDateRange({
                              from: period.periodStart,
                              to: period.periodEnd,
                            });
                            setDatePickerMonth(period.periodStart);
                          }}
                        >
                          <span className="w-full">{period.periodLabel}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        variant="calendar"
                        className="w-auto p-0"
                        align="start"
                        side="bottom"
                      >
                        <div className="flex">
                          <div className="space-y-0.5 max-w-40 my-auto">
                            {DATE_PRESETS.map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                                onClick={() => {
                                  const range = preset.getValue();
                                  setDateRange(range);
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
                              onSelect={setDateRange}
                              numberOfMonths={2}
                              locale={ptBR}
                              month={datePickerMonth}
                              onMonthChange={setDatePickerMonth}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Categoria - COM POPOVER */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={getStickyClass("category")}
                    style={getStickyStyle("category")}
                  >
                    <Popover
                      open={categoryPopoverOpen === period.id}
                      onOpenChange={(open) =>
                        setCategoryPopoverOpen(open ? period.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="truncate hover:bg-background/20 rounded-lg hover:py-2 max-w-[150px]
                                  hover:ring-1 hover:ring-border
                                  cursor-pointer text-left px-5 transition-colors -mx-3 -my-1"
                          title={
                            period.category
                              ? CATEGORY_LABELS[period.category]
                              : "Selecione..."
                          }
                        >
                          {period.category
                            ? CATEGORY_LABELS[period.category]
                            : "Selecione..."}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar categoria..." />
                          <CommandList>
                            <CommandEmpty>
                              Nenhuma categoria encontrada.
                            </CommandEmpty>
                            <CommandGroup>
                              {Object.entries(CATEGORY_LABELS).map(
                                ([key, label]) => (
                                  <CommandItem
                                    key={key}
                                    value={key}
                                    onSelect={() => {
                                      onUpdateField(period.id, "category", key);
                                      setCategoryPopoverOpen(null);
                                    }}
                                  >
                                    {label}
                                    {period.category === key && (
                                      <Check className="ml-auto h-4 w-4" />
                                    )}
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Posto - COM POPOVER */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={cn("w-[150px]", getStickyClass("provider"))}
                    style={getStickyStyle("provider")}
                  >
                    <Popover
                      open={providerPopoverOpen === period.id}
                      onOpenChange={(open) =>
                        setProviderPopoverOpen(open ? period.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="truncate hover:bg-background/20 rounded-lg hover:py-2 max-w-[150px]
                                  hover:ring-1 hover:ring-border
                                  cursor-pointer text-left px-5 transition-colors -mx-3 -my-1"
                          title={period.provider}
                        >
                          {period.provider || "Selecione..."}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar posto..." />
                          <CommandList>
                            <CommandEmpty>
                              Nenhum posto encontrado.
                            </CommandEmpty>
                            <CommandGroup>
                              {PROVIDERS.map((provider) => (
                                <CommandItem
                                  key={provider}
                                  value={provider}
                                  onSelect={() => {
                                    onUpdateField(
                                      period.id,
                                      "provider",
                                      provider
                                    );
                                    setProviderPopoverOpen(null);
                                  }}
                                >
                                  {provider}
                                  {period.provider === provider && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Combustível - COM POPOVER */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={getStickyClass("fuelType")}
                    style={getStickyStyle("fuelType")}
                  >
                    <Popover
                      open={fuelTypePopoverOpen === period.id}
                      onOpenChange={(open) =>
                        setFuelTypePopoverOpen(open ? period.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <Badge
                          variant="outline"
                          className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                  hover:ring-1 hover:ring-border
                                  py-2 cursor-pointer text-left px-3 transition-colors"
                        >
                          {FUEL_TYPE_LABELS[period.fuelType] || period.fuelType}
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent className="w-[180px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar..." />
                          <CommandList>
                            <CommandEmpty>Nenhum encontrado.</CommandEmpty>
                            <CommandGroup>
                              {Object.entries(FUEL_TYPE_LABELS).map(
                                ([key, label]) => (
                                  <CommandItem
                                    key={key}
                                    value={key}
                                    onSelect={() => {
                                      onUpdateField(period.id, "fuelType", key);
                                      setFuelTypePopoverOpen(null);
                                    }}
                                  >
                                    {label}
                                    {period.fuelType === key && (
                                      <Check className="ml-auto h-4 w-4" />
                                    )}
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Odômetro - INLINE EDIT */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={getStickyClass("odometer")}
                    style={getStickyStyle("odometer")}
                  >
                    {editingField?.periodId === period.id &&
                    editingField?.field === "odometer" ? (
                      <div className="flex items-center gap-1">
                        <Input
                          variant="number"
                          type="number"
                          defaultValue={period.odometer}
                          key={period.odometer}
                          className="h-8 w-24"
                          onBlur={(e) => handleFieldBlur(period.id, "odometer", Number(e.target.value))}
                          onKeyDown={(e) => handleFieldKeyDown(e, period.id, "odometer")}
                          step={1}
                          min={0}
                        />
                        <span className="text-sm text-muted-foreground">
                          km
                        </span>
                      </div>
                    ) : (
                      <button
                        className="hover:bg-background/20 border-none rounded-lg hover:py-2 
              hover:ring-1 hover:ring-border
              py-2 cursor-pointer text-left px-3 transition-colors"
                        onClick={() => handleFieldClick(period.id, "odometer")}
                      >
                        {formatNumber(period.odometer, 0)} km
                      </button>
                    )}
                  </TableCell>

                  {/* Preço/L - INLINE EDIT */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={cn("", getStickyClass("unitPrice"))}
                    style={getStickyStyle("unitPrice")}
                  >
                    {editingField?.periodId === period.id &&
                    editingField?.field === "unitPrice" ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          variant="number"
                          type="number"
                          defaultValue={period.unitPrice}
                          key={period.unitPrice}
                          autoFocus
                          step="0.01"
                          className="h-8 w-20"
                          onBlur={(e) => handleFieldBlur(period.id, "unitPrice", Number(e.target.value))}
                          onKeyDown={(e) => handleFieldKeyDown(e, period.id, "unitPrice")}
                        />
                        <span className="text-sm text-muted-foreground">
                          /L
                        </span>
                      </div>
                    ) : (
                      <button
                        className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                hover:ring-1 hover:ring-border
                                py-2 cursor-pointer text-left px-3 transition-colors"
                        onClick={() => handleFieldClick(period.id, "unitPrice")}
                      >
                        {formatCurrency(period.unitPrice)}/L
                      </button>
                    )}
                  </TableCell>

                  {/* Valor Total - INLINE EDIT */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={getStickyClass("totalValue")}
                    style={getStickyStyle("totalValue")}
                  >
                    {editingField?.periodId === period.id &&
                    editingField?.field === "value" ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          variant="number"
                          type="number"
                          defaultValue={period.totalValue}
                          key={period.totalValue}
                          autoFocus
                          step="0.01"
                          className="h-8 w-24"
                          onBlur={(e) => handleFieldBlur(period.id, "value", Number(e.target.value))}
                          onKeyDown={(e) => handleFieldKeyDown(e, period.id, "value")}
                        />
                      </div>
                    ) : (
                      <button
                        className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                hover:ring-1 hover:ring-border
                                py-2 cursor-pointer text-left px-3 transition-colors"
                        onClick={() =>
                          handleFieldClick(period.id, "value")
                        }
                      >
                        {formatCurrency(period.totalValue)}
                      </button>
                    )}
                  </TableCell>

                  {/* Litros - INLINE EDIT */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={getStickyClass("liters")}
                    style={getStickyStyle("liters")}
                  >
                    {editingField?.periodId === period.id &&
                    editingField?.field === "liters" ? (
                      <div className="flex items-center gap-1">
                        <Input
                          variant="number"
                          type="number"
                          defaultValue={period.totalLiters}
                          key={period.totalLiters}
                          autoFocus
                          step="0.01"
                          className="h-8 w-20"
                          onBlur={(e) => handleFieldBlur(period.id, "liters", Number(e.target.value))}
                          onKeyDown={(e) => handleFieldKeyDown(e, period.id, "liters")}
                        />
                        <span className="text-sm text-muted-foreground">L</span>
                      </div>
                    ) : (
                      <button
                        className="hover:bg-background/20 border-none rounded-lg hover:py-2 
                                hover:ring-1 hover:ring-border
                                py-2 cursor-pointer text-left px-3 transition-colors"
                        onClick={() => handleFieldClick(period.id, "liters")}
                      >
                        {formatNumber(period.totalLiters)} L
                      </button>
                    )}
                  </TableCell>
                  {/* Fueling days */}
                  <TableCell
                    variant="compact-fueling"
                    flexCell
                    className={getStickyClass("days")}
                    style={getStickyStyle("days")}
                  >
                    <div className="flex items-center gap-1">
                      {WEEK_DAYS.map((day, index) => (
                        <DayChip
                          key={`day-${index}`}
                          day={day}
                          dayIndex={index}
                          isActive={period.fuelingDays.includes(index)}
                          onClick={() => {
                            setDetailsPopoverOpen(
                              detailsPopoverOpen === period.id
                                ? null
                                : period.id
                            );
                            handleCellClick(period);
                          }}
                        />
                      ))}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <td className="sticky right-0 p-0 w-0 min-w-0 max-w-0 overflow-visible">
                    <div className="absolute right-0 top-0 h-full flex items-center pr-2 pl-4 opacity-0 group-hover/row:opacity-100 transition-opacity z-20 bg-sidebar">
                      <ActionsMenu />
                    </div>
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
