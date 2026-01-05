"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { TicketData } from "../types";
import type {
  HelpdeskStatus,
  HelpdeskPriority,
} from "@/features/helpdesk/types/helpdesk";
import { useAuth } from "@/hooks/use-auth";
import { displayToApiStatus, displayToApiPriority } from "../helpers";

interface Props {
  data: TicketData;
  onStatusChange: (apiStatus: HelpdeskStatus) => void;
  onPriorityChange: (apiPriority: HelpdeskPriority) => void;
  showPriority?: boolean;
  children?: React.ReactNode;
}

export const StatusPriorityPopover: React.FC<Props> = ({
  data,
  onStatusChange,
  onPriorityChange,
  showPriority = true,
  children,
}) => {
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

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        {children ? (
          <div className="cursor-pointer">{children}</div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="p-3 bg-popover w-44!"
        side="bottom"
        align="end"
      >
        <div className="space-y-2 p-2 w-40 ">
          {!(
            currentUser?.role === "CLIENT" &&
            (data.status === "Resolvido" || data.status === "Fechado")
          ) && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={data.statusApi || displayToApiStatus[data.status]}
                onValueChange={(val: HelpdeskStatus) => onStatusChange(val)}
              >
                <SelectTrigger size="sm" className="bg-popover">
                  <SelectValue
                    className="bg-popover"
                    placeholder={data.status}
                  />
                </SelectTrigger>
                <SelectContent showSearch={true} className="bg-popover">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem
                      className="bg-popover hover:bg-accent/40"
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showPriority &&
            !(
              currentUser?.role === "CLIENT" &&
              (data.status === "Resolvido" || data.status === "Fechado")
            ) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Prioridade
                </label>
                <Select
                  value={
                    data.priorityApi || displayToApiPriority[data.priority]
                  }
                  onValueChange={(val: HelpdeskPriority) =>
                    onPriorityChange(val)
                  }
                >
                  <SelectTrigger size="sm">
                    <SelectValue placeholder={data.priority} />
                  </SelectTrigger>
                  <SelectContent showSearch={true} className="bg-popover">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem
                        className="bg-popover hover:bg-accent/40"
                        key={opt.value}
                        value={opt.value}
                      >
                        {opt.label}
                      </SelectItem>
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
