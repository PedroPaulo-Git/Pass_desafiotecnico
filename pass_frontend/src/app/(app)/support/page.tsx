"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { BiSupport } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { FilterHeader } from "@/components/support/FilterHeader";
import { Toolbar } from "@/components/support/Toolbar";
import { TicketRow } from "@/components/support/TicketRow";
import { TicketRowSkeleton } from "@/components/support/TicketRow";
import { DroppableLane } from "@/components/support/DroppableLane";
import { ticketAPI } from "@/components/support/api/ticketAPI";
import { Priority, TicketData } from "@/components/support/types";
import { TicketDialog } from "@/components/support/supportComponents/TicketDialog";
import { useActiveNavTitle } from "@/hooks/use-active-nav-title";
import Link from "next/link";

// --- Componente Principal da Página ---
export function SupportTicketPage() {
  const { currentTitle } = useActiveNavTitle();
  const [search, setSearch] = useState(() => localStorage.getItem('supportSearch') || "");
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('supportStatusFilter') || "Todos");
  const [moduleFilter, setModuleFilter] = useState(() => localStorage.getItem('supportModuleFilter') || "Todos os Módulos");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const saved = localStorage.getItem('supportDateRange');
    return saved ? JSON.parse(saved) : undefined;
  });
  const [viewMode, setViewMode] = useState<"list" | "grid" | "lanes">(() => (localStorage.getItem('supportViewMode') as "list" | "grid" | "lanes") || "list");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Só começa a arrastar se mover 5px (evita cliques acidentais)
      },
    }),
    useSensor(TouchSensor)
  );
  // Load initial data
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await ticketAPI.getAll();
        setTickets(data);
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem('supportSearch', search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('supportStatusFilter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('supportModuleFilter', moduleFilter);
  }, [moduleFilter]);

  useEffect(() => {
    if (dateRange) {
      localStorage.setItem('supportDateRange', JSON.stringify(dateRange));
    } else {
      localStorage.removeItem('supportDateRange');
    }
  }, [dateRange]);

  useEffect(() => {
    localStorage.setItem('supportViewMode', viewMode);
  }, [viewMode]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("Todos");
    setModuleFilter("Todos os Módulos");
    setDateRange(undefined);
  };

  const statusCounts = useMemo(() => {
    const total = tickets.length;
    const abertos = tickets.filter((t) => t.status === "Aberto").length;
    const andamento = tickets.filter((t) => t.status === "Em Andamento").length;
    const resolvidos = tickets.filter(
      (t) => t.status === "Resolvido" || t.status === "Fechado"
    ).length;
    return { total, abertos, andamento, resolvidos };
  }, [tickets]);

  const uniqueModules = useMemo(() => {
    return ["Todos os Módulos", ...new Set(tickets.map((t) => t.module))];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        search === "" ||
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.clientName.toLowerCase().includes(search.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(search.toLowerCase());

      const matchesModule =
        moduleFilter === "Todos os Módulos" || ticket.module === moduleFilter;

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Abertos" && ticket.status === "Aberto") ||
        (statusFilter === "Em Andamento" && ticket.status === "Em Andamento") ||
        (statusFilter === "Resolvidos" &&
          (ticket.status === "Resolvido" || ticket.status === "Fechado"));

      const ticketDate =
        ticket.createdAt instanceof Date
          ? ticket.createdAt
          : new Date(ticket.createdAt);
      const matchesDate =
        !dateRange?.from ||
        !dateRange?.to ||
        (ticketDate >= dateRange.from && ticketDate <= dateRange.to);

      return matchesSearch && matchesModule && matchesStatus && matchesDate;
    });
  }, [search, moduleFilter, statusFilter, dateRange, tickets]);

  const [draggedTicket, setDraggedTicket] = useState<TicketData | null>(null);
  const [rotation, setRotation] = useState(0);
  const mouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Encontrar o item ativo
    const activeTicket = tickets.find((t) => t.id === activeId);
    if (!activeTicket) return;

    const isActiveTask = active.data.current?.type === "Ticket";
    const isOverTask = over.data.current?.type === "Ticket";

    if (!isActiveTask) return;

    // Cenário 1: Estou arrastando sobre outro Ticket
    if (isActiveTask && isOverTask) {
      const overTicket = tickets.find((t) => t.id === overId);
      if (overTicket && activeTicket.priority !== overTicket.priority) {
        // Se as prioridades forem diferentes, mudamos a prioridade visualmente AGORA
        setTickets((items) => {
          const activeIndex = items.findIndex((t) => t.id === activeId);
          const overIndex = items.findIndex((t) => t.id === overId);

          // Clona o array se for necessario, mas aqui vamos atualizar a prioridade
          if (items[activeIndex].priority !== items[overIndex].priority) {
            const newItems = [...items];
            newItems[activeIndex] = {
              ...newItems[activeIndex],
              priority: overTicket.priority,
            };
            return arrayMove(newItems, activeIndex, overIndex);
          }
          return items;
        });
      }
    }

    // Cenário 2: Estou arrastando sobre uma Coluna Vazia (ou área da coluna)
    const isOverColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverColumn) {
      const newPriority = overId as Priority; // O ID da coluna é a prioridade (ex: "Alta")
      if (activeTicket.priority !== newPriority) {
        setTickets((items) => {
          const activeIndex = items.findIndex((t) => t.id === activeId);
          const newItems = [...items];
          newItems[activeIndex] = {
            ...newItems[activeIndex],
            priority: newPriority,
          };
          return arrayMove(newItems, activeIndex, activeIndex); // Mantém posição relativa ou move pro fim se preferir
        });
      }
    }
  };
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIndex = tickets.findIndex((t) => t.id === activeId);
    const overIndex = tickets.findIndex((t) => t.id === overId);

    // Se mudou de posição visualmente
    if (activeIndex !== overIndex) {
      setTickets((items) => {
        return arrayMove(items, activeIndex, overIndex);
      });
    }

    // Chamada de API para salvar a nova prioridade
    const currentTicket = tickets.find((t) => t.id === activeId);
    if (currentTicket) {
      // Verifica se a prioridade mudou em relação ao banco (ou apenas a ordem)
      // Aqui você chamaria sua API updatePriority se necessário
      try {
        await ticketAPI.updatePriority(activeId, currentTicket.priority);
      } catch (e) {
        console.error("Erro ao salvar", e);
      }
    }
  };

  // const handleDragEnd = async (event: DragEndEvent) => {
  //   // Remover listener do mouse
  //   if (mouseMoveRef.current) {
  //     window.removeEventListener("mousemove", mouseMoveRef.current);
  //     mouseMoveRef.current = null;
  //   }
  //   setDraggedTicket(null); // Limpar o overlay
  //   setRotation(0); // Resetar rotação

  //   const { active, over } = event;

  //   if (!over) return;

  //   const ticketId = active.id as string;
  //   const destinationId = over.id as string;

  //   // Verificar se o destino é uma das lanes de prioridade
  //   const priorityLanes = ["Baixa", "Média", "Alta"];
  //   let newPriority = destinationId;

  //   // Se o destino não é uma lane diretamente, verificar se é um ticket
  //   if (!priorityLanes.includes(destinationId)) {
  //     // Encontrar qual lane contém o ticket de destino
  //     const destinationTicket = tickets.find((t) => t.id === destinationId);
  //     if (destinationTicket) {
  //       newPriority = destinationTicket.priority;
  //     } else {
  //       return; // Destino inválido
  //     }
  //   }

  //   // Verificar se a prioridade mudou
  //   const ticket = tickets.find((t) => t.id === ticketId);
  //   if (!ticket || ticket.priority === newPriority) return;

  //   try {
  //     // Atualizar via API
  //     const updatedTicket = await ticketAPI.updatePriority(
  //       ticketId,
  //       newPriority
  //     );

  //     // Atualizar estado local
  //     setTickets((prevTickets) =>
  //       prevTickets.map((t) => (t.id === ticketId ? updatedTicket : t))
  //     );
  //   } catch (error) {
  //     console.error("Failed to update ticket priority:", error);
  //     // Reverter mudança em caso de erro
  //     // Por simplicidade, não implementei rollback aqui
  //   }
  // };

  return (
    <div className="text-foreground font-sans">
      <div className="mx-auto max-w-[95%]   ">

        {/* Filtros */}
        <FilterHeader
          search={search}
          setSearch={setSearch}
          dateRange={dateRange}
          setDateRange={setDateRange}
          modules={uniqueModules}
          moduleFilter={moduleFilter}
          setModuleFilter={setModuleFilter}
          onClearFilters={clearFilters}
        />

        {/* Tabs e Lista */}
        <Toolbar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusCounts={statusCounts}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onClearFilters={clearFilters}
        />

        {loading ? (
          viewMode === "list" ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <TicketRowSkeleton key={i} viewMode="list" />
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <TicketRowSkeleton key={i} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              {["Baixa", "Média", "Alta"].map((priority) => (
                <div key={priority} className="space-y-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <TicketRowSkeleton
                      key={`${priority}-${i}`}
                      viewMode="lanes"
                    />
                  ))}
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {viewMode === "list" && (
              <div className="space-y-1">
                {filteredTickets.map((ticket) => (
                  <TicketRow
                    viewMode="list"
                    key={ticket.id}
                    data={ticket}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map((ticket) => (
                  <TicketRow
                    viewMode="grid"
                    key={ticket.id}
                    data={ticket}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Layout de Colunas */}
            {viewMode === "lanes" && (
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin} // Melhor algoritmo para colunas
                onDragStart={handleDragStart}
                onDragOver={handleDragOver} // Adicionado para fluidez
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                  {["Baixa", "Média", "Alta"].map((priority) => (
                    <DroppableLane
                      key={priority}
                      priority={priority}
                      tickets={filteredTickets.filter(
                        (t) => t.priority === priority
                      )}
                      onTicketClick={(t) => {
                        setSelectedTicket(t);
                        setIsDialogOpen(true);
                      }}
                    />
                  ))}
                </div>

                <DragOverlay
                  dropAnimation={{
                    duration: 250,
                    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                  }}
                >
                  {activeTicket ? (
                    <div className="cursor-grabbing shadow-2xl scale-105 rotate-2 opacity-90">
                      <TicketRow viewMode="lanes" data={activeTicket} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </>
        )}
      </div>
      <TicketDialog
        ticket={selectedTicket}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

export default SupportTicketPage;
