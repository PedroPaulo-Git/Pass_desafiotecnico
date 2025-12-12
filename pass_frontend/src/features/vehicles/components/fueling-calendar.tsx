"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Fuel, X } from "lucide-react";
import { format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateFuelingInput, createFuelingSchema } from "@pass/schemas";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  useCreateFueling,
  useFuelings,
} from "@/features/fleet-events/hooks/use-fuelings";
import { useVehicle } from "@/features/vehicles/hooks/use-vehicles";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Fueling, FuelType } from "@/types/vehicle";

interface FuelingCalendarProps {
  vehicleId: string;
  fuelings: Fueling[];
}

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function FuelingCalendar({ vehicleId, fuelings }: FuelingCalendarProps) {
  const { t } = useI18n();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);

  // Use the dedicated fuelings query with refetch
  const { data: fuelingsData, refetch } = useFuelings({ vehicleId });
  const currentFuelings = fuelingsData?.items ?? fuelings;

  // Group fuelings by date - FIX: handle timezone correctly
  const fuelingsByDate = useMemo(() => {
    const grouped: Record<string, Fueling[]> = {};
    currentFuelings.forEach((fueling) => {
      // Parse the ISO date and format to local date key
      const fuelingDate = new Date(fueling.date);
      const dateKey = format(fuelingDate, "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(fueling);
    });
    return grouped;
  }, [currentFuelings]);

  // refs and drag state for pointer-based horizontal drag scrolling
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Pointer handlers for drag-to-scroll
  const activeViewportRef = useRef<HTMLElement | null>(null);

  const handleWindowPointerMove = (evt: PointerEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const dx = evt.clientX - startXRef.current;
    const newLeft = scrollLeftRef.current - dx;
    // debug logs to inspect behavior in browser console
    try {
      console.debug(
        "pointermove dx",
        dx,
        "start",
        startXRef.current,
        "scrollLeft",
        scrollLeftRef.current,
        "newLeft",
        newLeft,
        activeViewportRef.current
      );
    } catch {}
    activeViewportRef.current.scrollLeft = newLeft;
  };

  const handleWindowPointerUp = (evt: PointerEvent) => {
    if (!isDownRef.current) return;
    try {
      activeViewportRef.current?.releasePointerCapture?.(
        (evt as any).pointerId
      );
    } catch {}
    isDownRef.current = false;
    setIsGrabbing(false);
    activeViewportRef.current = null;
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", handleWindowPointerUp);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
    try {
      document.body.style.userSelect = "";
    } catch {}
  };

  // Mouse fallback handlers for browsers/environments where pointer events are unreliable
  const handleWindowMouseMove = (evt: MouseEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const dx = evt.clientX - startXRef.current;
    const newLeft = scrollLeftRef.current - dx;
    try {
      console.debug("mousemove dx", dx, "newLeft", newLeft);
    } catch {}
    activeViewportRef.current.scrollLeft = newLeft;
  };

  const handleWindowMouseUp = (evt: MouseEvent) => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    setIsGrabbing(false);
    activeViewportRef.current = null;
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", handleWindowPointerUp);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
    try {
      document.body.style.userSelect = "";
    } catch {}
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const viewport = dragRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;
    if (!viewport) return;
    activeViewportRef.current = viewport;
    isDownRef.current = true;
    setIsGrabbing(true);
    startXRef.current = e.clientX;
    scrollLeftRef.current = viewport.scrollLeft;
    try {
      console.debug("pointerdown", {
        clientX: e.clientX,
        scrollLeft: scrollLeftRef.current,
        viewport,
      });
    } catch {}
    try {
      viewport.setPointerCapture?.(e.pointerId);
    } catch {}
    // attach window listeners so dragging continues outside the element
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    // add mouse fallbacks
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    try {
      // prevent text selection while dragging
      document.body.style.userSelect = "none";
    } catch {}
  };

  // Get days array (1-31 for display)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const todayDate = new Date().getDate();
  const todayYear = new Date().getFullYear();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Get fuelings for a specific day and month
  const getFuelingsForDay = (month: number, day: number) => {
    const dateKey = format(new Date(currentYear, month, day), "yyyy-MM-dd");
    return fuelingsByDate[dateKey] || [];
  };

  // Check if day exists in month
  const isDayValid = (month: number, day: number) => {
    const daysInThisMonth = getDaysInMonth(new Date(currentYear, month));
    return day <= daysInThisMonth;
  };

  // Count stats
  const stats = useMemo(() => {
    return {
      total: currentFuelings.length,
      totalLiters: currentFuelings.reduce((acc, f) => acc + (f.liters || 0), 0),
      totalValue: currentFuelings.reduce(
        (acc, f) => acc + (f.totalValue || 0),
        0
      ),
    };
  }, [currentFuelings]);

  // Handle fueling created
  const handleFuelingCreated = () => {
    setShowAddForm(false);
    refetch();
  };

  return (
    <div className="w-[90vw] mt-auto space-y-4 ">
      {/* Header with stats and add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-10">
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4">
          <Button disabled variant="outline">
            Abastecimentos <Badge className="w-7 h-7 " variant="circle">{stats.total}</Badge>
          </Button>
          <span className="text-muted-foreground/40 flex items-center gap-2">
            Litros <Badge className="px-4 " variant="circle">{stats.totalLiters.toFixed(1)}L</Badge>
          </span>
          <span className="text-muted-foreground/40 flex items-center gap-2">
             Faturado <Badge className="px-4 " variant="circle">{formatCurrency(stats.totalValue)}</Badge>  
          </span>
       
        </div>

        {/* Add button */}
        <Popover open={showAddForm} onOpenChange={setShowAddForm}>
          <PopoverTrigger asChild>
            <Button variant="default" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="end" side="bottom">
            <InlineFuelingForm
              vehicleId={vehicleId}
              onClose={() => setShowAddForm(false)}
              onSuccess={handleFuelingCreated}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Year navigation */}
      {/* <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentYear((y) => y - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          {currentYear - 1}
        </Button>
        <span className="text-lg font-semibold min-w-20 text-center">
          {currentYear}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentYear((y) => y + 1)}
        >
          {currentYear + 1}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div> */}

      {/* Calendar Grid using shadcn Table */}
      <Card variant="card-date" className="bg-red-500">
        <CardContent className="p-0 ">
          <div
            ref={dragRef}
            onPointerDown={onPointerDown}
            onPointerDownCapture={onPointerDown}
            className={cn(
              "w-full",
              isGrabbing ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <ScrollArea className="max-w-screen  ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      variant="date"
                      className="w-52 px-36 z-50 py-6 sticky left-0 bg-background shadow-[inset_-1px_0_0_var(--color-border)]"
                    >
                      <span className=" ">Mês</span>
                    </TableHead>
                    {days.map((day) => (
                      <TableHead
                        variant="date"
                        key={day}
                        className={cn(
                          "text-center relative",
                          day === todayDate && currentYear === todayYear
                            ? " -px-2 "
                            : ""
                        )}
                      >
                        {/* half-height colored overlay (top half) */}
                        {day === todayDate && currentYear === todayYear && (
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-muted/60 pointer-events-none rounded-t-md" />
                        )}

                        <span
                          className={cn(
                            "relative z-10 bg-muted inline-flex items-center justify-center rounded-md text-xs",
                            // fixed square so 1- and 2-digit days occupy same space
                            "w-9 h-9",
                            day === todayDate && currentYear === todayYear
                              ? "bg-foreground text-muted font-semibold"
                              : ""
                          )}
                        >
                          {day}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MONTHS_PT.map((monthName, monthIndex) => (
                    <TableRow key={monthName} className="border bg-background">
                      <TableCell
                        variant="extra-compact"
                        className="font-medium sticky left-0 bg-background z-10 shadow-[inset_-1px_0_0_var(--color-border)]"
                        //   style={{ boxShadow: 'inset -1px  ' }}
                      >
                        {monthName}
                      </TableCell>
                      {days.map((day) => {
                        const dayFuelings = getFuelingsForDay(monthIndex, day);
                        const hasFuelings = dayFuelings.length > 0;
                        const isValidDay = isDayValid(monthIndex, day);
                        const isActiveDay =
                          day === todayDate && currentYear === todayYear;

                        if (!isValidDay) {
                          return (
                            <TableCell
                              variant="extra-compact"
                              key={day}
                              className="p-0 bg-muted/30"
                            />
                          );
                        }

                        const cellClass = cn(
                          "-py-1",
                          isActiveDay && "bg-muted/60"
                        );

                        return (
                          <TableCell
                            variant="extra-compact"
                            key={day}
                            className={cellClass}
                          >
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    "w-full h-8 flex items-center justify-center transition-colors",
                                    "cursor-pointer",
                                    isActiveDay && "",
                                    hasFuelings && "relative"
                                  )}
                                >
                                  {hasFuelings && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-xs font-semibold text-emerald-600">
                                        {dayFuelings.length}
                                      </span>
                                      <div className="h-1 w-4 bg-emerald-500 rounded-full" />
                                    </div>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-72 p-0"
                                align="center"
                                side="top"
                              >
                                <DayDetailPopover
                                  date={new Date(currentYear, monthIndex, day)}
                                  fuelings={dayFuelings}
                                  formatCurrency={formatCurrency}
                                  t={t}
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground bg-amber-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-emerald-500 rounded-full" />
          <span>Dia com abastecimento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-primary/20 rounded" />
          <span>Hoje</span>
        </div>
      </div>
    </div>
  );
}

// Inline fueling form component
interface InlineFuelingFormProps {
  vehicleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function InlineFuelingForm({
  vehicleId,
  onClose,
  onSuccess,
}: InlineFuelingFormProps) {
  const { t } = useI18n();
  const createFueling = useCreateFueling();
  const vehicleQuery = useVehicle(vehicleId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateFuelingInput>({
    resolver: zodResolver(createFuelingSchema),
    defaultValues: {
      fuelType: "DIESEL",
      odometer: undefined as unknown as number,
      liters: undefined as unknown as number,
      totalValue: undefined as unknown as number,
      unitPrice: 0,
      date: new Date(),
    },
  });

  // Set default odometer
  useEffect(() => {
    const km = vehicleQuery?.data?.currentKm;
    if (km !== undefined && km !== null) {
      setValue("odometer", Number(km));
    }
  }, [vehicleQuery?.data?.currentKm, setValue]);

  const onSubmit = async (formData: CreateFuelingInput) => {
    if (!formData.totalValue || Number(formData.totalValue) < 1) {
      sonnerToast.error("Valor total inválido");
      return;
    }
    if (!formData.liters || Number(formData.liters) < 1) {
      sonnerToast.error("Litros inválidos");
      return;
    }

    try {
      const odometerStop = Number(formData.odometer) || 0;
      const currentKm = vehicleQuery?.data?.currentKm;

      if (currentKm !== undefined && odometerStop < currentKm) {
        sonnerToast.error("KM de parada não pode ser menor que o KM atual");
        return;
      }

      const payload = { ...formData, vehicleId, odometer: odometerStop };
      await createFueling.mutateAsync(payload);

      sonnerToast.success("Abastecimento criado com sucesso!");
      onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao salvar";
      sonnerToast.error(message);
    }
  };

  const isCreating = createFueling.isPending;
  const fuelTypes: FuelType[] = [
    "DIESEL",
    "DIESEL_S10",
    "GASOLINA",
    "ETANOL",
    "ARLA32",
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Fuel className="h-4 w-4" />
          Novo Abastecimento
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Provider */}
        <div>
          <label className="text-xs text-muted-foreground">Posto</label>
          <Select
            value={watch("provider") ?? ""}
            onValueChange={(value) => setValue("provider", value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecione o posto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ipiranga">Ipiranga</SelectItem>
              <SelectItem value="Shell">Shell</SelectItem>
              <SelectItem value="Petrobras">Petrobras</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="text-xs text-muted-foreground">Combustível</label>
          <Select
            value={watch("fuelType") ?? "DIESEL"}
            onValueChange={(value) => setValue("fuelType", value as FuelType)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fuelTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-muted-foreground">Data</label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-8 justify-start text-left font-normal"
                  >
                    {field.value
                      ? format(new Date(field.value), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        {/* Liters and Value */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Litros</label>
            <Controller
              control={control}
              name="liters"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50"
                  className="h-8"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              )}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Valor Total</label>
            <Controller
              control={control}
              name="totalValue"
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 300"
                  className="h-8"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              )}
            />
          </div>
        </div>

        {/* Odometer */}
        <div>
          <label className="text-xs text-muted-foreground">KM Atual</label>
          <Controller
            control={control}
            name="odometer"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="Ex: 50000"
                className="h-8"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            )}
          />
        </div>

        {/* Hidden unit price */}
        <input
          type="hidden"
          {...register("unitPrice", { valueAsNumber: true })}
        />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-8"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 h-8" disabled={isCreating}>
            {isCreating ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Day detail popover component
interface DayDetailPopoverProps {
  date: Date;
  fuelings: Fueling[];
  formatCurrency: (value: number) => string;
  t: any;
}

function DayDetailPopover({
  date,
  fuelings,
  formatCurrency,
  t,
}: DayDetailPopoverProps) {
  if (fuelings.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Nenhum abastecimento</p>
        <p className="text-xs mt-1">{format(date, "dd/MM/yyyy")}</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background">
        <span className="text-sm font-medium flex items-center gap-2">
          <Fuel className="h-4 w-4" />
          Abastecimentos
        </span>
        <Badge variant="secondary">{format(date, "dd/MM/yyyy")}</Badge>
      </div>

      {/* Fueling list */}
      <div className="p-3 space-y-2">
        {fuelings.map((fueling, idx) => (
          <Card key={fueling.id || idx} className="">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{fueling.fuelType}</Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(fueling.date), "HH:mm")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Litros:</span>
                <span className="ml-1 font-medium">{fueling.liters}L</span>
              </div>
              <div>
                <span className="text-muted-foreground">Valor:</span>
                <span className="ml-1 font-medium">
                  {formatCurrency(fueling.totalValue)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">KM:</span>
                <span className="ml-1 font-medium">
                  {fueling.odometer?.toLocaleString("pt-BR") || "-"}
                </span>
              </div>
              {fueling.provider && (
                <div>
                  <span className="text-muted-foreground">Posto:</span>
                  <span className="ml-1 font-medium">{fueling.provider}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Footer summary */}
      <Separator />
      <div className="px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total do dia:</span>
          <span className="font-medium">
            {fuelings.reduce((acc, f) => acc + (f.liters || 0), 0).toFixed(1)}L
            -{" "}
            {formatCurrency(
              fuelings.reduce((acc, f) => acc + (f.totalValue || 0), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FuelingCalendar;
