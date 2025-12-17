"use client";

import { useState, useMemo } from "react";
import { X, Search, ChevronDown, XIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import {
  CATEGORY_LABELS,
  WEEK_DAYS,
  PROVIDERS,
  FUEL_TYPES,
  FUEL_TYPE_LABELS,
  DATE_PRESETS,
} from "../constants";
import { DatePicker } from "@/components/ui/date-picker";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ptBR } from "date-fns/locale";
import { DatePickerRange } from "@/components/ui/data-picker-range";
import { DayChip } from "./day-chip";

interface FiltersSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FiltersSidebar({ open, onOpenChange }: FiltersSidebarProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      provider: "",
      fuelType: undefined,
      odometer: 0,
      liters: 0,
      totalValue: 0,
      unitPrice: 0,
      date: undefined,
    },
  });

  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [filters, setFilters] = useState<{
    category?: string | undefined;
    provider?: string | undefined;
    fuelType?: string | undefined;
    liters?: [number, number];
    totalValue?: [number, number];
    unitPrice?: [number, number];
    odometer?: [number, number];
    days?: Set<number>;
  }>({
    days: new Set(),
    liters: [0, 100],
    totalValue: [0, 500],
    unitPrice: [0, 10],
    odometer: [0, 500000],
  });

  const categories = Object.keys(CATEGORY_LABELS) as Array<
    keyof typeof CATEGORY_LABELS
  >;

  const applyFilters = () => {
    // For now, store locally. Caller integration can be added.
    onOpenChange(false);
  };

  const clearFilters = () => {
    setFilters({
      days: new Set(),
      liters: [0, 100],
      totalValue: [0, 500],
      unitPrice: [0, 10],
      odometer: [0, 500000],
      category: undefined,
      provider: undefined,
      fuelType: undefined,
    });
    setDateRange(undefined);
  };

  const appliedCount = useMemo(() => {
    let c = 0;
    if (filters.category) c++;
    if (filters.provider) c++;
    if (filters.fuelType) c++;
    if (filters.days && filters.days.size > 0) c++;
    if (dateRange && (dateRange.from || dateRange.to)) c++;

    const [l0, l1] = filters.liters ?? [0, 100];
    if (l0 !== 0 || l1 !== 100) c++;

    const [t0, t1] = filters.totalValue ?? [0, 500];
    if (t0 !== 0 || t1 !== 500) c++;

    const [u0, u1] = filters.unitPrice ?? [0, 10];
    if (u0 !== 0 || u1 !== 10) c++;

    const [o0, o1] = filters.odometer ?? [0, 500000];
    if (o0 !== 0 || o1 !== 500000) c++;

    return c;
  }, [filters, dateRange]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-full bg-background transition-all duration-300 ease-in-out overflow-hidden z-50",
        open ? "w-[340px] shadow-lg" : "w-0"
      )}
    >
      <div className="flex flex-col h-full w-[340px]  border rounded-tl-2xl">
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex w-full justify-between text-center items-center gap-4">
              <span className="font-semibold">Filtros</span>
              {appliedCount > 0 && (
                <div className="">
                  <div className="relative flex gap-2">
                    <Button
                      variant="outline_text"
                      className="flex-1 px-10 pl-20 "
                      onClick={clearFilters}
                    >
                      <XIcon className="w-4 h-4 " /> Limpar filtros{" "}
                      <Badge variant="outline" className="w-4 h-4 pt-1  ">{appliedCount}</Badge>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.common.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full"
              variant="light"
            />
          </div>
        </div> */}

        <ScrollArea className="flex-1 p-4 transition-all duration-300 ease-in-out">
          <div className="space-y-4">
            {/* Period */}
            <Collapsible defaultOpen>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Período</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <DatePickerRange
                          locale={ptBR}
                          presets={DATE_PRESETS}
                          date={field.value}
                          dateRange={dateRange}
                          setDateRange={setDateRange}
                          placeholder="Selecione um intervalo de datas"
                          variant="modal"
                        />
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Categoria */}
            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Categoria</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    {categories.map((category, index) => (
                      <label
                        key={category}
                        className={cn(
                          "flex w-full justify-between items-center space-x-2 cursor-pointer py-2 px-2 rounded-md",
                          highlightedIndex === index ? "bg-muted/50" : ""
                        )}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={filters.category === category}
                            onCheckedChange={(checked) => {
                              if (checked)
                                setFilters((s) => ({ ...s, category }));
                              else
                                setFilters((s) => ({
                                  ...s,
                                  category: undefined,
                                }));
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {CATEGORY_LABELS[category]}
                          </span>
                        </div>
                        <span
                          className={cn("text-[12px] text-muted-foreground")}
                        >
                          {index === 1 && (
                            <span className="text-[12px] text-muted-foreground">
                              <span>5</span>
                            </span>
                          )}
                          {index === 2 && (
                            <span className="text-[12px] text-muted-foreground">
                              <span>11</span>
                            </span>
                          )}
                          {index === 3 && (
                            <span className="text-[12px] text-muted-foreground">
                              <span>2</span>
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Provider */}
            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Posto</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2 space-y-2">
                    {PROVIDERS.map((p, index) => (
                      <label
                        key={p}
                        className="flex items-center justify-between gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={filters.provider === p}
                            onCheckedChange={(checked) =>
                              checked
                                ? setFilters((s) => ({ ...s, provider: p }))
                                : setFilters((s) => ({
                                    ...s,
                                    provider: undefined,
                                  }))
                            }
                          />
                          <span className="text-sm">{p}</span>
                        </div>
                        {index === 1 && (
                          <span className="text-[12px] text-muted-foreground">
                            <span>14</span>
                          </span>
                        )}
                        {index === 3 && (
                          <span className="text-[12px] text-muted-foreground">
                            <span>9</span>
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Fuel Type */}
            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Combustível</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2 space-y-2">
                    {FUEL_TYPES.map((ft, index) => (
                      <label
                        key={ft}
                        className="flex items-center justify-between gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={filters.fuelType === ft}
                            onCheckedChange={(checked) =>
                              checked
                                ? setFilters((s) => ({ ...s, fuelType: ft }))
                                : setFilters((s) => ({
                                    ...s,
                                    fuelType: undefined,
                                  }))
                            }
                          />
                          <span className="text-sm">
                            {FUEL_TYPE_LABELS[ft]}
                          </span>
                        </div>
                        {index === 2 && (
                          <span className="text-[12px] text-muted-foreground">
                            <span>3</span>
                          </span>
                        )}
                        {index === 3 && (
                          <span className="text-[12px] text-muted-foreground">
                            <span>12</span>
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Numeric filters: Liters, Total Value, Unit Price, Odometer */}
            <Collapsible defaultOpen>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Litros</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pb-2 pt-0 px-2">
                    <div className="flex flex-col gap-2 items-center px-2 py-2 pt-0">
                      <div className="flex justify-between w-full">
                        <div>
                          <label className="pb-1 pl-1 text-sm">Min.</label>
                          <Input
                            value={String(filters.liters?.[0] ?? 0)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                liters: [
                                  Math.min(v, s.liters?.[1] ?? 1000),
                                  s.liters?.[1] ?? 1000,
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>

                        <div>
                          <label className="pb-1 pl-1 text-sm">Máx.</label>
                          <Input
                            value={String(filters.liters?.[1] ?? 100)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                liters: [
                                  s.liters?.[0] ?? 0,
                                  Math.max(v, s.liters?.[0] ?? 0),
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>
                      </div>

                      <div className="w-full pt-2 flex-1">
                        <Slider
                          value={filters.liters}
                          onValueChange={(v: any) =>
                            setFilters((s) => ({ ...s, liters: [v[0], v[1]] }))
                          }
                          min={0}
                          max={1000}
                          variant="number-border"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible defaultOpen>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Valor Total</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pb-2 pt-0 px-2">
                    <div className="flex flex-col gap-2 items-center px-2 py-2 pt-0">
                      <div className="flex justify-between w-full">
                        <div>
                          <label className="pb-1 pl-1 text-sm">Min.</label>
                          <Input
                            value={(filters.totalValue?.[0] ?? 0).toFixed(2)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                totalValue: [
                                  Math.min(v, s.totalValue?.[1] ?? 500),
                                  s.totalValue?.[1] ?? 500,
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>

                        <div>
                          <label className="pb-1  pl-1 text-sm">Máx.</label>
                          <Input
                            value={(filters.totalValue?.[1] ?? 500).toFixed(2)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                totalValue: [
                                  s.totalValue?.[0] ?? 0,
                                  Math.max(v, s.totalValue?.[0] ?? 0),
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>
                      </div>

                      <div className="w-full pt-2 flex-1">
                        <Slider
                          value={filters.totalValue}
                          onValueChange={(v: any) =>
                            setFilters((s) => ({
                              ...s,
                              totalValue: [v[0], v[1]],
                            }))
                          }
                          min={0}
                          max={500}
                          variant="number-border"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible defaultOpen>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Preço / L</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pb-2 pt-0 px-2">
                    <div className="flex flex-col gap-2 items-center px-2 py-2 pt-0">
                      <div className="flex justify-between w-full">
                        <div>
                          <label className="pb-1 pl-1 text-sm">Min.</label>
                          <Input
                            value={(filters.unitPrice?.[0] ?? 0).toFixed(2)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                unitPrice: [
                                  Math.min(v, s.unitPrice?.[1] ?? 10),
                                  s.unitPrice?.[1] ?? 10,
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>

                        <div>
                          <label className="pb-1 pl-1 text-sm">Máx.</label>
                          <Input
                            value={(filters.unitPrice?.[1] ?? 10).toFixed(2)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                unitPrice: [
                                  s.unitPrice?.[0] ?? 0,
                                  Math.max(v, s.unitPrice?.[0] ?? 0),
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>
                      </div>

                      <div className="w-full pt-2 flex-1">
                        <Slider
                          value={filters.unitPrice}
                          onValueChange={(v: any) =>
                            setFilters((s) => ({
                              ...s,
                              unitPrice: [v[0], v[1]],
                            }))
                          }
                          min={0}
                          max={10}
                          variant="number-border"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible defaultOpen>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Odômetro</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pb-2 pt-0 px-2">
                    <div className="flex flex-col gap-2 items-center px-2 py-2 pt-0">
                      <div className="flex justify-between w-full">
                        <div>
                          <label className="pb-1 pl-1 text-sm">Min.</label>
                          <Input
                            value={String(filters.odometer?.[0] ?? 0)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                odometer: [
                                  Math.min(v, s.odometer?.[1] ?? 500000),
                                  s.odometer?.[1] ?? 500000,
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>

                        <div>
                          <label className="pb-1 pl-1 text-sm">Máx.</label>
                          <Input
                            value={String(filters.odometer?.[1] ?? 500000)}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setFilters((s) => ({
                                ...s,
                                odometer: [
                                  s.odometer?.[0] ?? 0,
                                  Math.max(v, s.odometer?.[0] ?? 0),
                                ],
                              }));
                            }}
                            variant="number-border"
                            className="h-9 w-[120px]"
                          />
                        </div>
                      </div>

                      <div className="w-full pt-2 flex-1">
                        <Slider
                          value={filters.odometer}
                          onValueChange={(v: any) =>
                            setFilters((s) => ({
                              ...s,
                              odometer: [v[0], v[1]],
                            }))
                          }
                          min={0}
                          max={500000}
                          variant="number-border"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Days (weekday toggles) */}
            <Collapsible defaultOpen>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Dias</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-2 grid grid-cols-7 gap-2 px-4 py-4">
                    {WEEK_DAYS.map((d, i) => (
                      <DayChip
                        key={i}
                        day={d}
                        dayIndex={i}
                        isActive={Boolean(filters.days?.has(i))}
                        onClick={() => {
                          setFilters((s) => {
                            const days = new Set(s.days ?? []);
                            if (days.has(i)) days.delete(i);
                            else days.add(i);
                            return { ...s, days };
                          });
                        }}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
