"use client";

import React from "react";
import {
  History,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  Tag,
  Clock,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { TicketData } from "../types";
import { useTicketHistory } from "@/features/helpdesk/hooks/use-ticket-history";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketHistoryProps {
  ticket: TicketData;
}

const getEventConfig = (type: string) => {
  switch (type) {
    case "CREATION":
      return {
        icon: PlusCircle,
        color: "text-green-500",
        bg: "bg-green-500/10",
      };
    case "STATUS_CHANGE":
      return {
        icon: CheckCircle2,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      };
    case "PRIORITY_CHANGE":
      return {
        icon: AlertTriangle,
        color: "text-red-500",
        bg: "bg-red-500/10",
      };
    case "ASSIGNMENT":
      return {
        icon: UserPlus,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      };
    case "MESSAGE":
      return {
        icon: MessageSquare,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      };
    case "ATTACHMENT":
      return { icon: Tag, color: "text-indigo-500", bg: "bg-indigo-500/10" };
    default:
      return { icon: History, color: "text-slate-500", bg: "bg-slate-500/10" };
  }
};

export const TicketHistory: React.FC<TicketHistoryProps> = ({ ticket }) => {
  const { history, isLoading } = useTicketHistory(ticket.id);

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
          {history.length > 0 ? (
            history.map((event, index) => {
              const config = getEventConfig(event.type);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-10 group"
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-0.5 w-9 h-9 flex items-center justify-center rounded-full bg-background border-4 border-background z-10 p-0.5`}
                  >
                    <div
                      className={`w-full h-full rounded-full ${config.bg} flex items-center justify-center ${config.color} border border-border/50 shadow-sm`}
                    >
                      <config.icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground leading-none">
                        {event.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {format(new Date(event.createdAt), "HH:mm", {
                          locale: ptBR,
                        })}
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
                          {event.userName || "Sistema"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50">
                        {format(new Date(event.createdAt), "dd 'de' MMM", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="pl-10 text-sm text-muted-foreground italic">
              Nenhuma atividade registrada ainda.
            </div>
          )}
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
