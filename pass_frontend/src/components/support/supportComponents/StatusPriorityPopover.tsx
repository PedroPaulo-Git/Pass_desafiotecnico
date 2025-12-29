"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TicketData } from "../types";
import type { HelpdeskStatus, HelpdeskPriority } from "@/features/helpdesk/types/helpdesk";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  data: TicketData;
  onStatusChange: (apiStatus: HelpdeskStatus) => void;
  onPriorityChange: (apiPriority: HelpdeskPriority) => void;
  showPriority?: boolean;
}

export const StatusPriorityPopover: React.FC<Props> = ({ data, onStatusChange, onPriorityChange, showPriority = true }) => {
  const { currentUser } = useAuth();
  const STATUS_OPTIONS = [
    { label: "Aberto", value: "ABERTO" },
    { label: "Em Análise", value: "EM_ANALISE" },
    { label: "Em Andamento", value: "EM_ANDAMENTO" },
    { label: "Aguardando Usuário", value: "AGUARDANDO_USUARIO" },
    { label: "Resolvido", value: "RESOLVIDO" },
    { label: "Fechado", value: "ENCERRADO" },
  ];

  const PRIORITY_OPTIONS = [
    { label: "Baixa", value: "BAIXA" },
    { label: "Média", value: "MEDIA" },
    { label: "Alta", value: "ALTA" },
  ];

  const displayToApiStatus: Record<string, string> = {
    "Aberto": "ABERTO",
    "Em Análise": "EM_ANALISE",
    "Em Andamento": "EM_ANDAMENTO",
    "Aguardando Usuário": "AGUARDANDO_USUARIO",
    "Resolvido": "RESOLVIDO",
    "Fechado": "ENCERRADO",
  };

  const displayToApiPriority: Record<string, string> = {
    "Baixa": "BAIXA",
    "Média": "MEDIA",
    "Alta": "ALTA",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-3 ">
        <div className="space-y-2 p-2 w-40 ">
          {currentUser?.role === "ADMIN" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={data.statusApi || displayToApiStatus[data.status]}
                onValueChange={(val: HelpdeskStatus) => onStatusChange(val)}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder={data.status} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showPriority && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
              <Select
                value={data.priorityApi || displayToApiPriority[data.priority]}
                onValueChange={(val: HelpdeskPriority) => onPriorityChange(val)}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder={data.priority} />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatusPriorityPopover;
