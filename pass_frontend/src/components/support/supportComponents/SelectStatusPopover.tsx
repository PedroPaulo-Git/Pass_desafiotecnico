"use client";
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { TicketData } from "../types";
import type { HelpdeskStatus } from "@/features/helpdesk/types/helpdesk";
import { useAuth } from "@/hooks/use-auth";
import { displayToApiStatus, getStatusIconAndColor } from "../helpers";
import {
  AlertCircle,
  Search,
  CircleCheckBig,
  User,
  XCircle,
} from "lucide-react";
import { IoTimerOutline } from "react-icons/io5";

interface Props {
  data: TicketData;
  onStatusChange: (apiStatus: HelpdeskStatus) => void;
}

const STATUS_OPTIONS = [
  {
    label: "Aberto",
    value: "ABERTO",
    icon: AlertCircle,
    color: "text-amber-500",
  },
  {
    label: "Em Análise",
    value: "EM_ANALISE",
    icon: Search,
    color: "text-blue-500",
  },
  {
    label: "Em Andamento",
    value: "EM_ANDAMENTO",
    icon: IoTimerOutline,
    color: "text-purple-400",
  },
  {
    label: "Aguardando Usuário",
    value: "AGUARDANDO_USUARIO",
    icon: User,
    color: "text-rose-500",
  },
  {
    label: "Resolvido",
    value: "RESOLVIDO",
    icon: CircleCheckBig,
    color: "text-emerald-400",
  },
  {
    label: "Fechado",
    value: "ENCERRADO",
    icon: XCircle,
    color: "text-zinc-500",
  },
];

export const SelectStatusPopover: React.FC<Props> = ({
  data,
  onStatusChange,
}) => {
  const { currentUser } = useAuth();
  const isClient = currentUser?.role === "CLIENT";
  const isResolvedOrClosed =
    data.status === "Resolvido" || data.status === "Fechado";
  const isDisabled = !currentUser || (isClient && isResolvedOrClosed);

  return (
    <Select
      value={data.statusApi || displayToApiStatus[data.status]}
      onValueChange={(val: HelpdeskStatus) => onStatusChange(val)}
      disabled={isDisabled}
    >
      <SelectTrigger
        variant="ghost"
        hideIcon
        className="h-auto w-auto flex items-center justify-center"
      >
        {(() => {
          const statusInfo = getStatusIconAndColor(data.status);
          const StatusIcon = statusInfo?.icon;
          return StatusIcon ? (
            <StatusIcon
              className={`size-4 cursor-pointer hover:scale-110 transition-transform ${statusInfo?.color}`}
            />
          ) : null;
        })()}
      </SelectTrigger>
      <SelectContent showSearch={false} className="bg-popover min-w-[200px]">
        <SelectGroup>
          <SelectLabel>Ciclo de Atendimento</SelectLabel>
          {STATUS_OPTIONS.slice(0, 3).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                <opt.icon className={`size-4 ${opt.color}`} />
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Finalização</SelectLabel>
          {STATUS_OPTIONS.slice(3).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                <opt.icon className={`size-4 ${opt.color}`} />
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
