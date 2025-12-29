// src/features/helpdesk/components/HelpdeskList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { TicketRow, TicketRowSkeleton } from "@/components/support/TicketRow";
import { TicketData } from "@/components/support/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useHelpdeskWithRoleFilters } from "../hooks/use-helpdesk";
import { BackendStatus } from "./BackendStatus";
import { useBackendStatus } from "../hooks/use-backend-status";
import { Helpdesk } from "../types/helpdesk";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getUserById } from "@/lib/api/auth";
import { useAuth } from "@/hooks/use-auth";
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
import { arrayMove } from "@dnd-kit/sortable";
import { DroppableLane } from "@/components/support/DroppableLane";

interface HelpdeskListProps {
  filters?: any;
  onCreateClick?: () => void;
  onTicketClick?: (ticket: TicketData) => void;
  viewMode?: "list" | "grid" | "lanes";
}

export function HelpdeskList({ filters = {}, onCreateClick, onTicketClick, viewMode = "list" }: HelpdeskListProps) {
  const { currentUser } = useAuth();
  const { data: backendData, isLoading, error, refetch: refetchBackend } = useHelpdeskWithRoleFilters(filters);
  const { status } = useBackendStatus();

  // Get unique client IDs from tickets
  const clientIds = backendData?.items ? [...new Set(backendData.items.map(t => t.clientId))] : [];

  // Fetch clients data
  const clientQueries = useQueries({
    queries: clientIds.map(id => ({
      queryKey: ["user", id],
      queryFn: () => getUserById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }))
  });

  // Fetch assigned users data (developers/admins assigned to tickets)
  const assignedUserIds = backendData?.items
    ? [...new Set(backendData.items.map(t => t.assignedUserId).filter(Boolean))]
    : [];

  const assignedQueries = useQueries({
    queries: assignedUserIds.map(id => ({
      queryKey: ["user", id],
      queryFn: () => getUserById(id as string),
      staleTime: 5 * 60 * 1000,
    }))
  });

  // Create a map of clientId to user data
  const clientDataIds = clientQueries.map((q) => q.data?.id ?? "").join(",");

  const assignedDataIds = assignedQueries.map((q) => q.data?.id ?? "").join(",");

  const clientsMap = React.useMemo(() => {
    return clientQueries.reduce((acc, query, index) => {
      if (query.data) {
        acc[clientIds[index]] = query.data;
      }
      return acc;
    }, {} as Record<string, any>);
  }, [clientIds.join(","), clientDataIds]);

  const assignedMap = React.useMemo(() => {
    return assignedQueries.reduce((acc, query, index) => {
      if (query.data) {
        acc[assignedUserIds[index] != null ? assignedUserIds[index] : ""] = query.data;
      }
      return acc;
    }, {} as Record<string, any>);
  }, [assignedUserIds.join(","), assignedDataIds]);

  const mapHelpdeskToTicketData = (ticket: Helpdesk): TicketData => {
    const categoryMap: Record<string, TicketData['category']> = {
      "BUG": "Bug",
      "AGENDAMENTO": "Acesso",
      "TREINAMENTO": "Dúvida",
      "PERFORMANCE": "Visual",
      "AJUSTE_MELHORIA": "Visual",
      "OUTRO": "Dúvida"
    };

    const priorityMap: Record<string, TicketData['priority']> = {
      "BAIXA": "Baixa",
      "MEDIA": "Média",
      "ALTA": "Alta",
      "CRITICA": "Alta"
    };

    const statusMap: Record<string, TicketData['status']> = {
      "ABERTO": "Aberto",
      "EM_ANALISE": "Em Análise",
      "EM_ANDAMENTO": "Em Andamento",
      "AGUARDANDO_USUARIO": "Aguardando Usuário",
      "RESOLVIDO": "Resolvido",
      "ENCERRADO": "Fechado"
    };

    const moduleMap: Record<string, TicketData['module']> = {
      "AGENDAMENTO": "Financeiro",
      "TREINAMENTOS": "Admin",
      "FINANCEIRO": "Financeiro",
      "USUARIOS": "Admin"
    };

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber || "",
      title: ticket.title,
      category: categoryMap[ticket.category] || "Dúvida",
      module: ticket.module ? (moduleMap[ticket.module] || "Admin") : "Admin",
      clientName: clientsMap[ticket.clientId]?.name || "Cliente",
      priority: priorityMap[ticket.priority] || "Baixa",
      priorityApi: ticket.priority,
      status: statusMap[ticket.status] || "Aberto",
      statusApi: ticket.status,
      createdAt: ticket.createdAt,
      assignedUserId: ticket.assignedUserId || null,
      assignedTo: ticket.assignedUserId && assignedMap[ticket.assignedUserId]
        ? {
            id: assignedMap[ticket.assignedUserId].id,
            name: assignedMap[ticket.assignedUserId].name,
            avatarFallback: (assignedMap[ticket.assignedUserId].name || "")
              .split(" ")
              .map((s: string) => s[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            role: assignedMap[ticket.assignedUserId].role || "DEVELOPER",
            email: assignedMap[ticket.assignedUserId].email || "",
            phone: assignedMap[ticket.assignedUserId].phone || "",
          }
        : null,
      attachmentCount: 0, // TODO: contar anexos
      messageCount: 0, // TODO: contar mensagens
    };
  };

  // Map backend data to TicketData
  const ticketData = React.useMemo(() => {
    if (!backendData?.items) return null;

    return {
      items: backendData.items.map(mapHelpdeskToTicketData),
      total: backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      totalPages: backendData.totalPages,
    };
  }, [backendData, clientsMap, assignedMap]);

  // Local tickets state so we can reorder/update for DnD lanes view
  const [tickets, setTickets] = useState<TicketData[] | null>(ticketData?.items ?? null);
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);
  

  // Simple localStorage cache
  const CACHE_TTL = 60_000; // 60s
  const safeKey = (() => {
    try {
      return `helpdesk_cache_${encodeURIComponent(JSON.stringify(filters))}`;
    } catch (e) {
      return `helpdesk_cache_default`;
    }
  })();

  useEffect(() => {
    // If we have cached data and no ticketData yet, hydrate from cache
    if (!ticketData?.items && tickets === null) {
      try {
        const raw = localStorage.getItem(safeKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.ts && Date.now() - parsed.ts < CACHE_TTL && Array.isArray(parsed.items)) {
            setTickets(parsed.items);
          } else {
            localStorage.removeItem(safeKey);
          }
        }
      } catch (e) {
        // ignore cache errors
      }
      return;
    }

    if (!ticketData?.items) return;
    const incoming = ticketData.items;
    setTickets((prev) => {
      if (!prev) return incoming;
      // If length differs, replace
      if (prev.length !== incoming.length) return incoming;
      // If any item content changed (not just ids), replace to reflect optimistic updates
      try {
        const prevStr = JSON.stringify(prev);
        const incomingStr = JSON.stringify(incoming);
        if (prevStr !== incomingStr) return incoming;
      } catch (e) {
        // Fallback conservative: replace
        return incoming;
      }
      return prev;
    });

    // Save to cache
    try {
      localStorage.setItem(safeKey, JSON.stringify({ ts: Date.now(), items: incoming }));
    } catch (e) {
      // ignore
    }
    
  }, [ticketData]);

  console.log(tickets)
  console.log("clientsMap:", clientsMap);
  console.log("assignedMap:", assignedMap);
  console.log("clientIds:", clientIds);
  console.log("clientDataIds:", clientDataIds);
  console.log("backendData:", backendData);
  console.log("ticketData:", ticketData);
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    if (!tickets) return;
    const t = tickets.find((x) => x.id === id) || null;
    setActiveTicket(t);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!tickets) return;
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTicket = tickets.find((t) => t.id === activeId);
    if (!activeTicket) return;

    const isOverColumn = over.data.current?.type === "Column";
    const isOverTicket = over.data.current?.type === "Ticket";

    if (isOverColumn) {
      const newPriority = overId as TicketData['priority'];
      if (activeTicket.priority !== newPriority) {
        setTickets((items) => {
          if (!items) return items;
          const idx = items.findIndex((t) => t.id === activeId);
          const newItems = [...items];
          newItems[idx] = { ...newItems[idx], priority: newPriority };
          return newItems;
        });
      }
    }

    if (isOverTicket) {
      const overTicket = tickets.find((t) => t.id === overId);
      if (!overTicket) return;
      const activeIndex = tickets.findIndex((t) => t.id === activeId);
      const overIndex = tickets.findIndex((t) => t.id === overId);
      if (activeIndex !== -1 && overIndex !== -1 && tickets[activeIndex].priority !== tickets[overIndex].priority) {
        setTickets((items) => {
          if (!items) return items;
          const newItems = [...items];
          newItems[activeIndex] = { ...newItems[activeIndex], priority: tickets[overIndex].priority };
          return arrayMove(newItems, activeIndex, overIndex);
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!tickets) return;
    const { active, over } = event;
    setActiveTicket(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeIndex = tickets.findIndex((t) => t.id === activeId);
    const overIndex = tickets.findIndex((t) => t.id === overId);
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      setTickets((items) => arrayMove(items ?? [], activeIndex, overIndex));
    }
    // Optionally: call backend to persist priority/order change
    // console.log("persist change", activeId);
  };

  // Show skeleton while loading or before tickets have been hydrated
  const anyUserLoading = clientQueries.some((q) => q.isLoading) || assignedQueries.some((q) => q.isLoading);

  if (isLoading || anyUserLoading || tickets === null) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TicketRowSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackendStatus />
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Erro ao carregar chamados: {error.message}
              </p>
              <Button onClick={() => refetchBackend()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackendStatus allowToggle={status === "online"} />

      {(tickets?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhum chamado encontrado.</p>
              {onCreateClick && (
                <Button onClick={onCreateClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Chamado
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "list" && (
            <div className="space-y-4">
              {tickets?.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  data={ticket}
                  viewMode="list"
                  onClick={() => onTicketClick?.(ticket)}
                />
              ))}
            </div>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets?.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  data={ticket}
                  viewMode="grid"
                  onClick={() => onTicketClick?.(ticket)}
                />
              ))}
            </div>
          )}

          {viewMode === "lanes" && (
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                {(["Baixa", "Média", "Alta"] as TicketData['priority'][]).map((priority) => (
                  <DroppableLane
                    key={priority}
                    priority={priority}
                    tickets={tickets?.filter((t) => t.priority === priority) ?? []}
                    onTicketClick={(t) => onTicketClick?.(t)}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
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

      {ticketData && ticketData.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="text-sm text-muted-foreground">
            Página {ticketData.page} de {ticketData.totalPages} • Total: {ticketData.total} chamados
          </div>
        </div>
      )}
    </div>
  );
}