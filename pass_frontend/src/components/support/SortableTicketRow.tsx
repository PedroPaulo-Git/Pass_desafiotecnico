"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TicketRow } from "./TicketRow";
import { TicketData } from "./types";

interface SortableTicketRowProps {
  ticket: TicketData;
}

export const SortableTicketRow: React.FC<SortableTicketRowProps> = ({ ticket }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: 1, // Sempre manter opacidade total
    zIndex: isDragging ? 50 : 'auto', // Garantir que o item arrastado fique acima dos outros
    transformOrigin: 'center', // Scale acontece do centro para não causar overflow
  };

  return (
    <div className="p-1"> {/* Container extra com padding para compensar o scale */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`transition-all duration-200 px-2 ${isDragging ? 'cursor-grabbing select-none shadow-2xl scale-105' : 'cursor-grab hover:shadow-md hover:scale-[1.04]'}`}
      >
        <TicketRow viewMode="lanes" data={ticket} />
      </div>
    </div>
  );
};