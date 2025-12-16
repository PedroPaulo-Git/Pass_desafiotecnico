"use client";

import { useState } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
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
} from "../constants";

interface FiltersSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FiltersSidebar({ open, onOpenChange }: FiltersSidebarProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
    null
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    undefined
  );

  const [filters, setFilters] = useState<{
    category?: string | undefined;
    provider?: string | undefined;
    fuelType?: string | undefined;
    liters?: [number, number];
    totalValue?: [number, number];
    unitPrice?: [number, number];
    odometer?: [number, number];
    days?: Set<number>;
  }>({ days: new Set(), liters: [0, 100], totalValue: [0, 500], unitPrice: [0, 10], odometer: [0, 500000] });

  const categories = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>;

  const applyFilters = () => {
    // For now, store locally. Caller integration can be added.
    onOpenChange(false);
  };

  const clearFilters = () => {
    setFilters({ days: new Set() });
    setDateRange(undefined);
  };

  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-full bg-background transition-all duration-300 ease-in-out overflow-hidden z-50",
        open ? "w-[340px] shadow-lg" : "w-0"
      )}
    >
      <div className="flex flex-col h-full w-[340px]  border rounded-tl-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="font-semibold">Filtros</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
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
            <Collapsible >
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Período</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Categoria */}
            <Collapsible>
              <div  className="border rounded-md">
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
                              if (checked) setFilters((s) => ({ ...s, category }));
                              else setFilters((s) => ({ ...s, category: undefined }));
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{CATEGORY_LABELS[category]}</span>
                        </div>
                        <span className={cn("text-[12px] text-muted-foreground")}>0</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Pax min/max */}
            <Collapsible>
              <div  className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Pax mínimo</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground block">Mín.</label>
                      <Input className="h-9" variant="light" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block">Máx.</label>
                      <Input className="h-9" variant="light" />
                    </div>
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
                    {PROVIDERS.map((p, i) => (
                      <label key={p} className="flex items-center justify-between gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={filters.provider === p} onCheckedChange={(checked)=> checked ? setFilters(s=>({...s, provider: p})) : setFilters(s=>({...s, provider: undefined}))} />
                          <span className="text-sm">{p}</span>
                        </div>
                        <span className="text-[12px] text-muted-foreground">0</span>
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
                    {FUEL_TYPES.map((ft) => (
                      <label key={ft} className="flex items-center justify-between gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={filters.fuelType === ft} onCheckedChange={(checked)=> checked ? setFilters(s=>({...s, fuelType: ft})) : setFilters(s=>({...s, fuelType: undefined}))} />
                          <span className="text-sm">{FUEL_TYPE_LABELS[ft]}</span>
                        </div>
                        <span className="text-[12px] text-muted-foreground">0</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Numeric filters: Liters, Total Value, Unit Price, Odometer */}
            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Litros</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    <div className="flex gap-2 items-center">
                      <Input value={String(filters.liters?.[0] ?? 0)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, liters:[Math.min(v, (s.liters?.[1] ?? 100)), s.liters?.[1] ?? 100]}))}} variant="number-border" className="h-9 w-[100px]" />
                      <div className="flex-1">
                        <Slider value={filters.liters} onValueChange={(v:any)=>setFilters(s=>({...s, liters: [v[0], v[1]]}))} min={0} max={1000} variant="number-border" />
                      </div>
                      <Input value={String(filters.liters?.[1] ?? 100)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, liters:[s.liters?.[0] ?? 0, Math.max(v, s.liters?.[0] ?? 0)]}))}} variant="number-border" className="h-9 w-[100px]" />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Valor Total</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    <div className="flex gap-2 items-center">
                      <Input value={(filters.totalValue?.[0] ?? 0).toFixed(2)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, totalValue:[Math.min(v, s.totalValue?.[1] ?? 500), s.totalValue?.[1] ?? 500]}))}} variant="number-border" className="h-9 w-[100px]" />
                      <div className="flex-1">
                        <Slider value={filters.totalValue} onValueChange={(v:any)=>setFilters(s=>({...s, totalValue:[v[0], v[1]]}))} min={0} max={500} variant="number-border" />
                      </div>
                      <Input value={(filters.totalValue?.[1] ?? 500).toFixed(2)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, totalValue:[s.totalValue?.[0] ?? 0, Math.max(v, s.totalValue?.[0] ?? 0)]}))}} variant="number-border" className="h-9 w-[100px]" />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Preço / L</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    <div className="flex gap-2 items-center">
                      <Input value={(filters.unitPrice?.[0] ?? 0).toFixed(2)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, unitPrice:[Math.min(v, s.unitPrice?.[1] ?? 10), s.unitPrice?.[1] ?? 10]}))}} variant="number-border" className="h-9 w-[100px]" />
                      <div className="flex-1">
                        <Slider value={filters.unitPrice} onValueChange={(v:any)=>setFilters(s=>({...s, unitPrice:[v[0], v[1]]}))} min={0} max={10} variant="number-border" />
                      </div>
                      <Input value={(filters.unitPrice?.[1] ?? 10).toFixed(2)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, unitPrice:[s.unitPrice?.[0] ?? 0, Math.max(v, s.unitPrice?.[0] ?? 0)]}))}} variant="number-border" className="h-9 w-[100px]" />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible>
              <div className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Odômetro</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="py-2 px-2">
                    <div className="flex gap-2 items-center">
                      <Input value={String(filters.odometer?.[0] ?? 0)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, odometer:[Math.min(v, s.odometer?.[1] ?? 500000), s.odometer?.[1] ?? 500000]}))}} variant="number-border" className="h-9 w-[100px]" />
                      <div className="flex-1">
                        <Slider value={filters.odometer} onValueChange={(v:any)=>setFilters(s=>({...s, odometer:[v[0], v[1]]}))} min={0} max={500000} variant="number-border" />
                      </div>
                      <Input value={String(filters.odometer?.[1] ?? 500000)} onChange={(e)=>{ const v=Number(e.target.value||0); setFilters(s=>({...s, odometer:[s.odometer?.[0] ?? 0, Math.max(v, s.odometer?.[0] ?? 0)]}))}} variant="number-border" className="h-9 w-[100px]" />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Days (weekday toggles) */}
            <Collapsible>
              <div  className="border rounded-md">
                <CollapsibleTrigger asChild>
                  <Button variant="collapsible_button">
                    <span>Dias</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-2 grid grid-cols-3 gap-2">
                    {WEEK_DAYS.map((d, i) => (
                      <Button key={i} variant="outline" className="h-9">{d}</Button>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </ScrollArea>

        {/* <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Limpar
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Aplicar
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
