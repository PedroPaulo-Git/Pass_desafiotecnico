"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Plus,
  Fuel,
  X,
} from "lucide-react";
import { format, getDaysInMonth } from "date-fns";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  useCreateFueling,
  useFuelings,
} from "@/features/fleet-events/hooks/use-fuelings";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import type { Fueling, FuelType } from "@/types/vehicle";
import { InlineFuelingForm } from "@/features/fleet-events/components/Fueling/FuelingModal";
import { DayDetailPopover } from "@/features/fleet-events/components/Fueling/FuelingDayDetailPopover";
import { DropdownModal } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  // No componente FuelingCalendar, adicione este useEffect
  useEffect(() => {
    // Listener GLOBAL para prevenir qualquer submit na página
    const handleGlobalSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Captura o evento na fase de captura (true) para pegar antes de qualquer outro
    document.addEventListener("submit", handleGlobalSubmit, true);

    // Também captura eventos de click em botões submit
    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" &&
        target.getAttribute("type") === "submit"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("click", handleButtonClick, true);

    return () => {
      document.removeEventListener("submit", handleGlobalSubmit, true);
      document.removeEventListener("click", handleButtonClick, true);
    };
  }, []);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

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
    const target = e.target as HTMLElement;

    // Don't start drag if clicking on interactive elements like buttons or in table header
    if (
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.closest("a") ||
      target.closest('[role="combobox"]') ||
      target.closest('[data-slot="select-trigger"]') ||
      target.closest("thead")
    ) {
      return;
    }

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
    <div className="max-w-7xl mt-auto space-y-4 pt-4">
      {/* Header with stats and add button */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 px-4 sm:px-10">
        {/* Stats */}

        <div className="relative block sm:hidden ">
          {/* Container dos botões */}
          <div className="flex rounded-md shadow-sm">
            <Button
              className="rounded-r-none border-r-0 pr-3"
              variant="default"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
            >
              Adicionar
            </Button>
            <Button
              className="rounded-l-none  pl-2 pr-2 border-l border-black"
              variant="default"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Dropdown Modal personalizado */}
          <DropdownModal
            open={showAddForm}
            onOpenChange={setShowAddForm}
            align="end"
            className=""
            sideOffset={4}
          >
            <InlineFuelingForm
              vehicleId={vehicleId}
              onClose={() => setShowAddForm(false)}
              onSuccess={handleFuelingCreated}
            />
          </DropdownModal>
        </div>
        <div className="flex items-center gap-4">
          <Button disabled variant="outline_text">
             <span className={` ${stats.total >0 && "  text-foreground"}`}>  Abastecimentos{" "}</span>
            <Badge className="w-7 h-7 " variant="circle">
              {stats.total}
            </Badge>
          </Button>
          <span className="text-muted-foreground/40 flex items-center gap-2">
            <span className="hidden sm:flex">Litros </span>
            <Badge className="px-4 " variant="circle">
              {stats.totalLiters.toFixed(1)}L
            </Badge>
          </span>
          <span className="text-muted-foreground/40 flex items-center gap-2">
            <span className="hidden sm:flex">Faturado </span>
            <Badge className="px-4 " variant="circle">
              {formatCurrency(stats.totalValue)}
            </Badge>
          </span>
        </div>
        <div className="relative hidden sm:block">
          {/* Container dos botões */}
          <div className="flex rounded-md shadow-sm">
            <Button
              className="rounded-r-none border-r-0 pr-3"
              variant="default"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
            >
              Adicionar
            </Button>
            <Button
              className="rounded-l-none border-l pl-2 pr-2 border-black "
              variant="default"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
            >
              <ChevronDown className="h-4 w-4 " />
            </Button>
          </div>

          {/* Dropdown Modal personalizado */}
          <DropdownModal
            open={showAddForm}
            onOpenChange={setShowAddForm}
            align="end"
            sideOffset={4}
          >
            <InlineFuelingForm
              vehicleId={vehicleId}
              onClose={() => setShowAddForm(false)}
              onSuccess={handleFuelingCreated}
            />
          </DropdownModal>
        </div>
      </div>

      <Card variant="card-date" className="">
        <CardContent className="p-0 ">
          <div
            ref={dragRef}
            onPointerDown={onPointerDown}
            className={cn(
              "w-full",
              isGrabbing ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <ScrollArea className="max-w-screen border-r  ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      variant="date"
                      className="  px-2 z-20 py-4 sticky left-0 bg-background shadow-[inset_-1px_0_0_var(--color-border)] "
                    >
                      <Select
                        value={currentYear.toString()}
                        onValueChange={(value) =>
                          setCurrentYear(parseInt(value))
                        }
                      >
                        <SelectTrigger
                          className="bg-muted rounded-md mx-4 flex items-center justify-center w-40 h-9 text-muted-foreground border-none"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <Calendar className=" h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => 2020 + i).map(
                            (year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
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
                    <TableRow
                      key={monthName}
                      className="border-y bg-background"
                    >
                      <TableCell
                        variant="extra-compact"
                        className="font-medium sticky left-0 first:pl-4 bg-background z-10 shadow-[inset_-1px_0_0_var(--color-border)]"
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
                            {hasFuelings ? (
                              <Popover
                                open={openPopover === `${monthIndex}-${day}`}
                                onOpenChange={(open) =>
                                  setOpenPopover(
                                    open ? `${monthIndex}-${day}` : null
                                  )
                                }
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full h-8 flex items-center justify-center transition-colors",
                                      "cursor-pointer",
                                      "relative"
                                    )}
                                  >
                                    <div className="flex flex-col items-center">
                                      <span className="text-xs font-semibold text-emerald-600">
                                        {dayFuelings.length}
                                      </span>
                                      <div className="h-1 w-4 bg-emerald-500 rounded-full" />
                                    </div>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-72 p-0"
                                  align="center"
                                  side="top"
                                >
                                  <DayDetailPopover
                                    date={
                                      new Date(currentYear, monthIndex, day)
                                    }
                                    fuelings={dayFuelings}
                                    formatCurrency={formatCurrency}
                                    t={t}
                                    onRefetch={refetch}
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <div className="w-full h-8" />
                            )}
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
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
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

export default FuelingCalendar;
