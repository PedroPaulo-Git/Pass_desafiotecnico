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
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FilterHeader } from "@/components/support/FilterHeader";
import { Toolbar } from "@/components/support/Toolbar";
import { TicketRow } from "@/components/support/TicketRow";
import { SortableTicketRow } from "@/components/support/SortableTicketRow";
import { DroppableLane } from "@/components/support/DroppableLane";
import { ticketAPI } from "@/components/support/api/ticketAPI";
import { TicketData } from "@/components/support/types";
import Link from "next/link";

// --- Componente Principal da Página ---
export function SupportTicketPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [moduleFilter, setModuleFilter] = useState("Todos os Módulos");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [viewMode, setViewMode] = useState<"list" | "grid" | "lanes">("list");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDragStart = (event: DragStartEvent) => {
    const ticketId = event.active.id as string;
    const ticket = tickets.find((t) => t.id === ticketId);
    setDraggedTicket(ticket || null);

    // Adicionar listener para rotação baseada na posição do mouse
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const offsetX = centerX - e.clientX;
      const maxTilt = 5; // Máximo de inclinação em graus
      const tilt = (offsetX / centerX) * maxTilt;
      setRotation(tilt);
    };
    mouseMoveRef.current = handleMouseMove;
    window.addEventListener("mousemove", handleMouseMove);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    // Remover listener do mouse
    if (mouseMoveRef.current) {
      window.removeEventListener("mousemove", mouseMoveRef.current);
      mouseMoveRef.current = null;
    }
    setDraggedTicket(null); // Limpar o overlay
    setRotation(0); // Resetar rotação

    const { active, over } = event;

    if (!over) return;

    const ticketId = active.id as string;
    const destinationId = over.id as string;

    // Verificar se o destino é uma das lanes de prioridade
    const priorityLanes = ["Baixa", "Média", "Alta"];
    let newPriority = destinationId;

    // Se o destino não é uma lane diretamente, verificar se é um ticket
    if (!priorityLanes.includes(destinationId)) {
      // Encontrar qual lane contém o ticket de destino
      const destinationTicket = tickets.find((t) => t.id === destinationId);
      if (destinationTicket) {
        newPriority = destinationTicket.priority;
      } else {
        return; // Destino inválido
      }
    }

    // Verificar se a prioridade mudou
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.priority === newPriority) return;

    try {
      // Atualizar via API
      const updatedTicket = await ticketAPI.updatePriority(
        ticketId,
        newPriority
      );

      // Atualizar estado local
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === ticketId ? updatedTicket : t))
      );
    } catch (error) {
      console.error("Failed to update ticket priority:", error);
      // Reverter mudança em caso de erro
      // Por simplicidade, não implementei rollback aqui
    }
  };

  return (
    <div className="text-foreground font-sans">
      <div className="mx-auto max-w-[95%]  pt-6 ">
        {/* Header com Título da Seção */}
        <div className="flex items-center justify-between mb-6 ">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <BiSupport className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Central de Suporte
              </h1>
              <p className="text-foreground/50 text-sm">
                Gerencie e resolva tickets de usuários.
              </p>
            </div>
          </div>
          <Button className="bg-foreground text-background font-semibold">
            <span className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              <Link href="/ticket"> Novo Chamado </Link>
            </span>
          </Button>
        </div>

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
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando tickets...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "list" && (
              <div className="space-y-1">
                {filteredTickets.map((ticket) => (
                  <TicketRow viewMode="list" key={ticket.id} data={ticket} />
                ))}
              </div>
            )}

            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map((ticket) => (
                  <TicketRow viewMode="grid" key={ticket.id} data={ticket} />
                ))}
              </div>
            )}

            {viewMode === "lanes" && (
              <DndContext
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 ">
                  {/* Lanes por prioridade */}
                  {["Baixa", "Média", "Alta"].map((priority) => (
                    <DroppableLane
                      key={priority}
                      priority={priority}
                      tickets={filteredTickets.filter(
                        (ticket) => ticket.priority === priority
                      )}
                      draggedTicketId={draggedTicket?.id || null}
                    />
                  ))}
                </div>

                {/* Drag Overlay - Ticket sempre visível durante arrasto */}
                <DragOverlay>
                  {draggedTicket ? (
                    <div
                      className="shadow-2xl opacity-90 cursor-grabbing"
                      style={{
                        transform: `rotate(${rotation}deg) scale(1.05)`,
                      }}
                    >
                      <TicketRow viewMode="lanes" data={draggedTicket} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SupportTicketPage;
