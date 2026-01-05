"use client";

import React from "react";
import {
  History,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  MessageSquare,
  Tag,
  Clock,
  PlusCircle,
  AlertTriangle,
  Monitor,
  Layout,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { TicketData } from "../types";

interface TicketHistoryProps {
  ticket: TicketData;
}

interface HistoryEvent {
  id: string;
  type:
    | "status"
    | "priority"
    | "assignment"
    | "message"
    | "creation"
    | "update";
  title: string;
  description?: string;
  user: string;
  date: Date;
  icon: any;
  color: string;
  bg: string;
}

export const TicketHistory: React.FC<TicketHistoryProps> = ({ ticket }) => {
  // Since we don't have a real history API, we generate events based on ticket data
  // These represent the "life" of the ticket so far
  const events: HistoryEvent[] = [
    {
      id: "creation",
      type: "creation",
      title: "Chamado Criado",
      description: `Ticket #${ticket.ticketNumber} aberto via ${
        ticket.environment === "WEB" ? "Plataforma Web" : "Mobile"
      }.`,
      user: ticket.clientName,
      date: new Date(ticket.createdAt),
      icon: PlusCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      id: "category",
      type: "update",
      title: "Categoria Definida",
      description: `O chamado foi classificado como ${ticket.category}.`,
      user: "Sistema",
      date: new Date(new Date(ticket.createdAt).getTime() + 1000 * 60 * 2), // 2 mins later
      icon: Tag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  if (ticket.assignedTo) {
    events.push({
      id: "assignment",
      type: "assignment",
      title: "Responsável Atribuído",
      description: `Chamado atribuído a ${ticket.assignedTo.name}.`,
      user: "Suporte",
      date: new Date(new Date(ticket.createdAt).getTime() + 1000 * 60 * 15), // 15 mins later
      icon: UserPlus,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    });
  }

  if (ticket.status !== "Aberto") {
    events.push({
      id: "status",
      type: "status",
      title: "Status Atualizado",
      description: `Alterado para "${ticket.status}".`,
      user: ticket.assignedTo?.name || "Suporte",
      date: new Date(), // Current time for demo
      icon: CheckCircle2,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    });
  }

  // Sort by date descending
  const sortedEvents = [...events].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="py-4 px-1">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Linha do Tempo do Atendimento</h3>
      </div>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-2 bottom-0 w-0.5 bg-border/50" />

        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-10 group"
            >
              {/* Dot */}
              <div
                className={`absolute left-0 top-0.5 w-9 h-9 flex items-center justify-center rounded-full bg-background border-4 border-background z-10 p-0.5`}
              >
                <div
                  className={`w-full h-full rounded-full ${event.bg} flex items-center justify-center ${event.color} border border-border/50 shadow-sm`}
                >
                  <event.icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground leading-none">
                    {event.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {format(event.date, "HH:mm", { locale: ptBR })}
                  </span>
                </div>

                {event.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 ">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <span className="text-[10px] font-medium text-muted-foreground/80">
                      {event.user}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50">
                    {format(event.date, "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 p-4 bg-muted/30 border border-border rounded-xl">
        <div className="flex gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-xs font-semibold">Tempo de Resolução Estimado</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Baseado na prioridade{" "}
              <span className="font-medium text-foreground">
                {ticket.priority}
              </span>
              , a resolução deste chamado é esperada em até 24 horas úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
