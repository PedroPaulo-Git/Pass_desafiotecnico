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
  draggedTicketId?: string | null;
}

export const DroppableLane: React.FC<DroppableLaneProps> = ({
  priority,
  tickets,
  draggedTicketId,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: priority,
  });

  // Filtrar o ticket que está sendo arrastado (ele será mostrado no DragOverlay)
  const visibleTickets = draggedTicketId
    ? tickets.filter((ticket) => ticket.id !== draggedTicketId)
    : tickets;

  return (
    <div
      ref={setNodeRef}
      className={`w-full rounded-lg transition-colors overflow-x-hidden ${getPriorityStyles(
        priority as any
      )}`}
    >
      <h3
        className={`font-semibold text-sm mb-3 text-center py-2  rounded-t-lg ${getPriorityStyles(
          priority as any
        )}`}
      >
        {priority}
      </h3>
      <SortableContext
        items={visibleTickets.map((ticket) => ticket.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0 min-h-[200px] max-h-[55vh] overflow-y-auto overflow-x-hidden">
          {visibleTickets.map((ticket) => (
            <SortableTicketRow key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
