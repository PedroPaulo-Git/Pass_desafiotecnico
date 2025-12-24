"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTicketRow } from "./SortableTicketRow";
import { TicketData } from "./types";
import { getPriorityStyles } from "./helpers";

interface DroppableLaneProps {
  priority: string;
  tickets: TicketData[];
  onTicketClick?: (ticket: TicketData) => void;
  // draggedTicketId NÃO é mais necessário aqui para filtragem
}

export const DroppableLane: React.FC<DroppableLaneProps> = ({
  priority,
  tickets,
  onTicketClick,
}) => {
  const getCounterStyles = (p: string) => {
    switch (p) {
      case "Alta":
        return "bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "Média":
        return "bg-yellow-200 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Baixa":
        return "bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-border text-foreground";
    }
  };
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
    data: {
      type: "Column",
      priority,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-full rounded-xl transition-colors duration-300 flex flex-col h-full
        ${getPriorityStyles(priority as any)}
        ${isOver ? "bg-accent/40 ring-2 ring-primary/20" : ""}
      `}
    >
      {/* Header Fixo */}
      <div
        className={`
        p-3 rounded-t-xl bg-background/50 backdrop-blur-sm
        sticky top-0 z-10
      `}
      >
        <h3 className="font-bold text-sm text-center flex items-center justify-center gap-2">
          {priority}
          <span className={`ml-2 ${getCounterStyles(priority)} px-1.5 py-0.5 rounded-full text-[10px]`}>
            {tickets.length}
          </span>
        </h3>
      </div>

      {/* Área de Scroll - Conteúdo */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 min-h-[150px]">
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <SortableTicketRow
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick?.(ticket)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
