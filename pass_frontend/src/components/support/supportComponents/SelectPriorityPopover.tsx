"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { TicketData } from "../types";
import type { HelpdeskPriority } from "@/features/helpdesk/types/helpdesk";
import { useAuth } from "@/hooks/use-auth";
import { displayToApiPriority, getPriorityColor } from "../helpers";

interface Props {
  data: TicketData;
  onPriorityChange: (apiPriority: HelpdeskPriority) => void;
  align?: "start" | "end" | "center";
}

const PRIORITY_OPTIONS = [
  { label: "Baixa", value: "BAIXA" },
  { label: "Média", value: "MEDIA" },
  { label: "Alta", value: "ALTA" },
];

export const SelectPriorityPopover: React.FC<Props> = ({
  data,
  onPriorityChange,
  align = "end",
}) => {
  const { currentUser } = useAuth();
  const isClient = currentUser?.role === "CLIENT";
  const isResolvedOrClosed =
    data.status === "Resolvido" || data.status === "Fechado";
  const isDisabled = !currentUser || (isClient && isResolvedOrClosed);

  return (
    <Select
      value={data.priorityApi || displayToApiPriority[data.priority]}
      onValueChange={(val: HelpdeskPriority) => onPriorityChange(val)}
      disabled={isDisabled}
    >
      <SelectTrigger variant="ghost" hideIcon className="h-auto w-auto">
        <Badge
          variant="subtle"
          color={getPriorityColor(data.priority)}
          className="cursor-pointer hover:scale-105 transition-transform border border-transparent hover:border-border/30"
        >
          {data.priority}
        </Badge>
      </SelectTrigger>
      <SelectContent
        showSearch={false}
        className="bg-popover min-w-[150px]"
        align={align}
      >
        <SelectGroup>
          <SelectLabel>Criticidade do Ticket</SelectLabel>
          {PRIORITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
