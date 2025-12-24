"use client";
import React from "react";
import {
  AlertCircle,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  Tag,
  BarChart3,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TicketData, Priority } from "../types";
import { Badge } from "@/components/ui/badge";
import { getPriorityStyles, getStatusStyles } from "../helpers";
import { Separator } from "@/components/ui/separator";

interface TicketInfoPopoverProps {
  children: React.ReactNode;
  data: TicketData;
  effectivePriority: Priority;
  IconComponent: React.ComponentType<any>;
  iconClass: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TicketInfoPopover: React.FC<TicketInfoPopoverProps> = ({
  children,
  data,
  effectivePriority,
  IconComponent,
  iconClass,
  open,
  onOpenChange,
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-96 rounded-2xl bg-card" align="start">
        <div className="grid p-4">
          <div className="flex items-center justify-between border-b border-border/30">
            <div className="flex flex-col gap-0.5 font-semibold leading-none  pb-3">
              <span className="flex gap-2">
                <p className="text-md">Detalhes do Ticket </p>
                <Separator orientation="vertical" className="mx-0.5" />
                <p className="text-xs text-muted-foreground/80">
                  {data.ticketNumber}
                </p>
              </span>

              <p className="flex items-center gap-1 text-xs text-muted-foreground/80">
                {" "}
                <Clock className="w-3 h-3 text-muted-foreground/70" />
                {data.createdAt instanceof Date
                  ? data.createdAt.toLocaleDateString()
                  : data.createdAt}
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl pt-3">
            <div className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/20">
              <div className="flex flex-col space-y-2 w-full">
                <div className="space-y-1.5 divide-y">
                  <div className="flex flex-col items-left gap-2 group w-full py-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-foreground capitalize">
                        Cliente:
                      </span>
                      <span className="text-sm text-muted-foreground/70">
                        {data.clientName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-left gap-2 group w-full py-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-foreground capitalize">
                        Categoria:
                      </span>
                      <span className="text-sm text-muted-foreground/70">
                        {data.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-left gap-2 group w-full py-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-foreground capitalize">
                        Responsável:
                      </span>
                      <span className="text-sm text-muted-foreground/70">
                        {data.assignedTo
                          ? data.assignedTo.name
                          : "Não atribuído"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-left gap-2 group w-full py-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-foreground">
                        Prioridade:
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 h-6 border rounded-md ${getPriorityStyles(
                          effectivePriority
                        )}`}
                      >
                        {effectivePriority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 h-6 border rounded-md ${getStatusStyles(
                          data.status
                        )}`}
                      >
                        {data.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm py-2.5 text-center justify-center">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-muted-foreground/70">
                        {data.messageCount} mensagens
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Paperclip className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-muted-foreground/70">
                        {data.attachmentCount} anexos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
