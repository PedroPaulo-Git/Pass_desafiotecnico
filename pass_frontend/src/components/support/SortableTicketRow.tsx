"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TicketRow } from "./TicketRow";
import { TicketData } from "./types";
import { Eye } from "lucide-react";
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
  } = useSortable({
    id: ticket.id,
    data: {
      type: "Ticket",
      ticket,
    },
    // Otimização: Evita re-renderizações desnecessárias durante a animação
    animateLayoutChanges: () => false,
  });

  const [isHoveringIcon, setIsHoveringIcon] = React.useState(false);

  // Ref to track drag distance to differentiate between click and drag
  const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);

  const style = {
    // Translate é mais performático e evita distorção de texto
    transform: CSS.Translate.toString(transform),
    transition, // Essa é a transição mágica do DND Kit (move os vizinhos)
    opacity: isDragging ? 0 : 1, // O segredo: invisível na lista, visível no Overlay
  };

  // Se estiver arrastando, retornamos apenas o placeholder invisível
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full opacity-0 bg-transparent border-2 border-dashed border-primary/20 rounded-lg"
      />
    );
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    // Call dnd-kit's listener
    listeners?.onPointerDown(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!dragStartPos.current) return;

    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);

    // Reset drag start
    dragStartPos.current = null;

    // Se moveu menos de 5px, consideramos um clique
    if (deltaX < 5 && deltaY < 5) {
      onClick?.();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // Spread listeners explicitly except onPointerDown which we wrap
      onPointerDown={handlePointerDown}
      onKeyDown={
        listeners?.onKeyDown as React.KeyboardEventHandler<HTMLDivElement>
      }
      className={`
        relative group transition-transform duration-200 ease-out
        hover:scale-[1.02] hover:-translate-y-1 touch-none cursor-grab active:cursor-grabbing
      `}
      onClick={handleClick}
    >
      <div className="px-1 py-1 pointer-events-none">
        <TicketRow viewMode="lanes" data={ticket} />
      </div>
    </div>
  );
};
