"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TicketRow } from "./TicketRow";
import { TicketData } from "./types";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableTicketRowProps {
  ticket: TicketData;
  onClick?: () => void;
}

export const SortableTicketRow: React.FC<SortableTicketRowProps> = ({
  ticket,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const [isHoveringIcon, setIsHoveringIcon] = React.useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: 1, // Sempre manter opacidade total
    zIndex: isDragging ? 50 : "auto", // Garantir que o item arrastado fique acima dos outros
    transformOrigin: "center", // Scale acontece do centro para não causar overflow
  };

  return (
    <div className="p-1 relative  ">
      {" "}
      {/* Container extra com padding para compensar o scale */}
      {/* Handle de dialog - ícone que abre dialog */}
      <div
        className="absolute top-4 right-4 z-10 cursor-pointer p-1 rounded"
        onMouseEnter={() => setIsHoveringIcon(true)}
        onMouseLeave={() => setIsHoveringIcon(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`transition-all duration-200 px-2 active:cursor-grabbing ${
          isDragging
            ? "shadow-2xl scale-105 select-none cursor-grabbing"
            : "cursor-grab hover:shadow-md hover:scale-[1.04]"
        } ${isHoveringIcon ? " scale-[1.04]" : ""}`}
      >
        <TicketRow viewMode="lanes" data={ticket} />
      </div>
    </div>
  );
};
