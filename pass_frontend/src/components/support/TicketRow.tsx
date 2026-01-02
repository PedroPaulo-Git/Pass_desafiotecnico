"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Paperclip,
  Clock,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Eye,
  User,
  Edit3,
  ChevronDownCircleIcon,
  ChevronDown,
  Check,
  Calendar,
  Copy,
  Package,
} from "lucide-react";
import { IoMdCopy } from "react-icons/io";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateHelpdesk } from "@/features/helpdesk/hooks/use-helpdesk";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TicketData, Priority } from "./types";
import type {
  HelpdeskStatus,
  HelpdeskPriority,
} from "@/features/helpdesk/types/helpdesk";
import {
  getPriorityStyles,
  getStatusStyles,
  getCategoryIconAndColor,
  getPriorityFromCategory,
  getStatusIconAndColor,
  getStatusContainerClass,
  getPriorityColor,
  getStatusColor,
} from "./helpers";
import { Separator } from "../ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserInfoPopover } from "./supportComponents/UserInfoPopover";
import { AssignedUserPopover } from "./supportComponents/AssignedUserPopover";
import { AssignUserPopover } from "./supportComponents/AssignDeveloperPopover";
import { TicketInfoPopover } from "./supportComponents/TicketInfoPopover";
import StatusPriorityPopover from "./supportComponents/StatusPriorityPopover";
import {
  useTicketUpdates,
  type UseTicketUpdatesProps,
} from "./supportComponents/useTicketUpdates";
import { cn } from "@/lib/utils";

interface TicketRowProps {
  data: TicketData;
  viewMode?: "list" | "grid" | "lanes";
  onClick?: () => void;
}

export const TicketRow: React.FC<TicketRowProps> = ({
  data,
  viewMode,
  onClick,
}) => {
  const isAssigned = !!data.assignedTo;
  const [copied, setCopied] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { currentUser } = useAuth();
  const updateMutation = useUpdateHelpdesk();

  const { handleStatusChange, handlePriorityChange, handleAssign } =
    useTicketUpdates({
      initialTicket: data,
      updateMutation,
    });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  let IconComponent: React.ComponentType<any> = AlertCircle;
  let iconClass = "bg-background border-border text-foreground/50";
  let gradientClass = "bg-gradient-to-b from-gray-400 to-gray-600";
  let effectivePriority: Priority = "Baixa";

  // Determine effective priority and default left-strip gradient based on priority
  effectivePriority = data.priority || getPriorityFromCategory(data.category);
  if (effectivePriority === "Alta") {
    gradientClass = "bg-gradient-to-b from-red-400 to-red-600";
  } else if (effectivePriority === "Média") {
    gradientClass = "bg-gradient-to-b from-yellow-400 to-yellow-600";
  } else if (effectivePriority === "Baixa") {
    gradientClass = "bg-gradient-to-b from-blue-400 to-blue-600";
  }

  // If we have a status, prefer status icon/container for the avatar, but
  // override the left strip only for resolved/closed statuses per design.
  if (data.status) {
    const statusIcon = getStatusIconAndColor(data.status);
    if (statusIcon) {
      IconComponent = statusIcon.icon;
      iconClass = getStatusContainerClass(data.status);
    }

    if (data.status === "Resolvido") {
      gradientClass = "bg-gradient-to-b from-green-400 to-green-600";
    } else if (data.status === "Fechado") {
      gradientClass = "bg-gradient-to-b from-gray-400 to-gray-600";
    }
  } else {
    const categoryIcon = getCategoryIconAndColor(data.category);
    IconComponent = categoryIcon.icon;
    iconClass = categoryIcon.className;
  }

  return (
    <div
      className={cn(
        "group relative p-4 border border-border/50 rounded-lg hover:border-border transition-all duration-200 mb-3 flex flex-col h-full",
        viewMode === "lanes" && "cursor-grab",
        viewMode === "grid" && "cursor-pointer"
      )}
      onClick={() => {
        if (viewMode !== "list") {
          onClick?.();
        }
      }}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-200",
          gradientClass
        )}
      ></div>
      <div
        className={cn(
          "flex justify-between h-full pl-2",
          viewMode === "grid" || viewMode === "lanes"
            ? "flex-col items-start gap-4"
            : "flex-row items-center gap-6"
        )}
      >
        {/* Coluna 1: Info Principal do Ticket (Ticket ID + Status Icon/Title + Badges) */}
        <div
          className={cn(
            "flex-1 min-w-0 max-w-[60%] 2xl:max-w-none",
            (viewMode === "lanes" || viewMode === "grid") && "max-w-none w-full"
          )}
        >
          <div
            className={cn(
              "flex items-start gap-4",
              viewMode === "list" ? "flex-row" : "flex-col"
            )}
          >
            {/* Componente que unifica Icone (Avatar), Titulo do Ticket e Cliente */}
            <TicketInfoPopover
              data={data}
              effectivePriority={effectivePriority}
              IconComponent={IconComponent}
              iconClass={iconClass}
              open={isPopoverOpen}
              onOpenChange={setIsPopoverOpen}
            >
              <div
                className={cn(
                  "flex items-center cursor-pointer my-auto gap-3 hover:shadow-custom transition duration-300 px-2.5 rounded-[8px] -my-[3px] py-[3px] dark:hover:shadow-custom-dark w-full",
                  viewMode === "list" ? "max-w-[400px]" : "max-w-none"
                )}
                role="button"
              >
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center border shrink-0",
                    iconClass
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="space-y-px overflow-hidden">
                  <div className="font-medium text-foreground leading-tight truncate">
                    {data.title}
                  </div>
                  <div className="text-muted-foreground text-xs leading-tight truncate">
                    {data.clientName}
                  </div>
                </div>
              </div>
            </TicketInfoPopover>

            <div className="flex items-start gap-2 flex-wrap pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="subtle"
                      color="gray"
                      className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard();
                      }}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-500!" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {data.ticketNumber}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copiado!" : "Clique para copiar"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="subtle" color="amber">
                <Calendar className="w-3 h-3!" />
                {data.createdAt instanceof Date
                  ? data.createdAt.toLocaleDateString("pt-BR")
                  : new Date(data.createdAt).toLocaleDateString("pt-BR")}
              </Badge>

              {data.status && (
                <Badge variant="subtle" color={getStatusColor(data.status)}>
                  {(() => {
                    const statusInfo = getStatusIconAndColor(data.status);
                    const StatusIcon = statusInfo?.icon;
                    return StatusIcon ? (
                      <StatusIcon className="w-3 h-3" />
                    ) : null;
                  })()}
                  {data.status}
                </Badge>
              )}

              {effectivePriority && (
                <Badge
                  variant="subtle"
                  color={getPriorityColor(effectivePriority)}
                >
                  {effectivePriority}
                </Badge>
              )}

              {data.attachmentCount > 0 && (
                <Badge variant="subtle" color="purple">
                  <Package className="w-3 h-3" />
                  {data.attachmentCount}
                </Badge>
              )}

              {data.messageCount > 0 && (
                <Badge variant="subtle" color="teal">
                  <MessageSquare className="w-3 h-3" />
                  {data.messageCount}
                </Badge>
              )}

              <UserInfoPopover data={data} />
            </div>
          </div>
        </div>

        {/* Coluna 2: Metadados (Atribuição e Tempo) e Ações */}
        <div className="flex items-center gap-2 lg:justify-end">
          {viewMode === "list" && (
            <div className="flex items-center gap-4 border-t lg:border-t-0 border-border pt-3 lg:pt-0">
              {/* Atribuído a */}
              <div className="flex flex-col gap-1 min-w-40">
                <span className="text-xs font-semibold text-foreground/80 tracking-wider">
                  Responsável
                </span>
                {isAssigned ? (
                  <AssignedUserPopover data={data}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-6 w-6 border border-zinc-700">
                        <AvatarFallback className="bg-purple-900 text-purple-200 text-[10px]">
                          {data.assignedTo?.avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground text-xs font-medium">
                        {data.assignedTo?.name}
                      </span>
                    </div>
                  </AssignedUserPopover>
                ) : currentUser?.role === "ADMIN" ||
                  currentUser?.role === "DEVELOPER" ? (
                  <AssignUserPopover data={data} onAssign={handleAssign}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-0! text-muted-foreground hover:text-purple-400 hover:bg-transparent text-xs justify-start gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Atribuir
                    </Button>
                  </AssignUserPopover>
                ) : (
                  <div className="text-muted-foreground text-xs">
                    Aguardando atendimento
                  </div>
                )}
              </div>

              {/* <div className="flex items-center gap-2">
                {!(
                  currentUser?.role === "CLIENT" &&
                  (data.status === "Resolvido" || data.status === "Fechado")
                ) && (
                  <StatusPriorityPopover
                    data={data}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                  />
                )}
              </div> */}
            </div>
          )}

          {viewMode === "list" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:text-accent-foreground dark:bg-transparent dark:border-input dark:hover:bg-input/50 size-8 h-8 w-8 border-border hover:bg-muted/80 !bg-transparent dark:!bg-transparent"
              variant="outline"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const TicketRowSkeleton: React.FC<{
  viewMode?: "list" | "grid" | "lanes";
}> = ({ viewMode = "list" }) => {
  return (
    <div
      className={`group border border-border relative bg-muted/20 rounded-lg p-4 py-3.5 mb-3`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-200 bg-linear-to-b from-gray-400 to-gray-600"></div>
      <div
        className={`flex flex-col items-start gap-4 justify-between h-full ${
          viewMode === "grid" || viewMode === "lanes"
            ? "lg:items-start flex-col"
            : "lg:items-center lg:flex-row"
        }`}
      >
        <div className="flex items-start gap-4 flex-1 w-full">
          <Skeleton className="mt-1 w-10 h-10 rounded-full border bg-muted-foreground/50" />
          <div className="flex flex-col space-y-1 w-full">
            <Skeleton className="h-4 w-3/4 bg-muted-foreground/50" />
            <Skeleton className="h-3 w-1/2 bg-muted-foreground/50" />
            <div className="flex gap-2 items-center mt-auto">
              <Skeleton className="h-6 w-20 bg-muted-foreground/50" />
              <Skeleton className="h-6 w-16 bg-muted-foreground/50" />
            </div>
          </div>
        </div>
        {viewMode === "list" && (
          <div className="flex items-center flex-wrap justify-center w-full gap-10 lg:w-auto mt-2 lg:mt-0 lg:justify-end border-t lg:border-t-0 border-border pt-3 lg:pt-0">
            <div className="flex flex-col gap-1 min-w-30">
              <Skeleton className="h-3 w-16 mb-1 bg-muted-foreground/50" />
              <Skeleton className="h-6 w-20 bg-muted-foreground/50" />
            </div>
            <div className="flex flex-col gap-1 min-w-25 mb-1">
              <Skeleton className="h-3 w-12 mb-1 bg-muted-foreground/50" />
              <Skeleton className="h-4 w-24 bg-muted-foreground/50" />
            </div>
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <Skeleton className="h-4 w-4 bg-muted-foreground/50" />
              <Skeleton className="h-4 w-4 bg-muted-foreground/50" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
