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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative group transition-transform duration-200 ease-out
        /* Efeito de hover suave apenas quando NÃO está arrastando */
        hover:scale-[1.02] hover:-translate-y-1 touch-none
        ${isHoveringIcon ? "scale-[1.02]" : ""}
      `}
    >
      {/* Botão de Visualizar - Só aparece no hover do card */}
      <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          onMouseEnter={() => setIsHoveringIcon(true)}
          onMouseLeave={() => setIsHoveringIcon(false)}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="absolute bottom-4 right-2 z-20 opacity-0 rounded-lg group-hover:opacity-100 transition-opacity duration-200 text-foreground border border-border bg-transparent w-9 h-9 hover:bg-background p-0"
        >
          <Eye className="w-4 h-4 text-foreground/70" />
        </Button>
      </div>

      <div className="px-1 py-1">
        <TicketRow viewMode="lanes" data={ticket} />
      </div>
    </div>
  );
};
