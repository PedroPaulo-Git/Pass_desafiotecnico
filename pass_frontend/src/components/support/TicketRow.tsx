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
  ChevronDownCircleIcon,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { IoMdCopy } from "react-icons/io";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TicketData, Priority } from "./types";
import {
  getPriorityStyles,
  getStatusStyles,
  getCategoryIconAndColor,
  getPriorityFromCategory,
  getStatusIconAndColor,
  getStatusContainerClass,
} from "./helpers";
import { Separator } from "../ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserInfoPopover } from "./supportComponents/UserInfoPopover";
import { AssignedUserPopover } from "./supportComponents/AssignedUserPopover";
import { AssignUserPopover } from "./supportComponents/AssignUserPopover";
import { TicketInfoPopover } from "./supportComponents/TicketInfoPopover";

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleAssign = (developer: any) => {
    // In a real app, this would update the ticket data via API
    console.log("Assigning developer:", developer);
    // For demo purposes, we'll just log it
  };
  let IconComponent = AlertCircle;
  let iconClass = "bg-background border-border text-foreground/50";
  let gradientClass = "bg-gradient-to-b from-gray-400 to-gray-600";
  let effectivePriority: Priority = "Baixa";

  if (data.status === "Resolvido" || data.status === "Fechado") {
    const statusIcon = getStatusIconAndColor(data.status);
    if (statusIcon) {
      IconComponent = statusIcon.icon;
      iconClass = getStatusContainerClass(data.status);
      if (data.status === "Resolvido") {
        gradientClass = "bg-gradient-to-b from-green-400 to-green-600";
      }
      effectivePriority =
        data.priority || getPriorityFromCategory(data.category);
    }
  } else {
    effectivePriority = data.priority || getPriorityFromCategory(data.category);
    const categoryIcon = getCategoryIconAndColor(data.category);
    IconComponent = categoryIcon.icon;
    iconClass = categoryIcon.className;
    // Set gradient based on priority
    if (effectivePriority === "Alta") {
      gradientClass = "bg-gradient-to-b from-red-400 to-red-600";
    } else if (effectivePriority === "Média") {
      gradientClass = "bg-gradient-to-b from-yellow-400 to-yellow-600";
    } else if (effectivePriority === "Baixa") {
      gradientClass = "bg-gradient-to-b from-blue-400 to-blue-600";
    }
  }

  return (
    <div
      className={
        `group border border-border relative bg-muted/20 hover:bg-muted-foreground/5 rounded-lg p-4 mb-3 transition-all shadow-sm ` +
        (viewMode === "lanes" ? "cursor-grab" : "")
      }
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-200 ${gradientClass}`}
      ></div>
      <div
        className={`flex flex-col items-start gap-4 justify-between h-full ${
          viewMode === "grid" || viewMode === "lanes"
            ? "lg:items-start flex-col"
            : "lg:items-center lg:flex-row"
        }`}
      >
        {/* Coluna 1: Info Principal do Ticket */}
        <div className="flex items-start 2xl:gap-4 gap-2 flex-1 w-full">
          {/* Ícone Indicativo de Status/Prioridade */}
          <div
            onClick={() => setIsPopoverOpen(true)}
            className={`mt-1 2xl:p-2 p-1.5 rounded-full border ${iconClass} cursor-pointer`}
          >
            <IconComponent className="w-4 h-4 2xl:w-5 2xl:h-5" />
          </div>

          <div className="flex flex-col space-y-1 w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center text-[10px] 2xl:text-xs text-muted-foreground cursor-pointer border-none bg-transparent p-0 max-w-[110px]"
                  >
                    {data.ticketNumber}{" "}
                    {copied ? (
                      <Check className="ml-1 mb-0.5 w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <IoMdCopy className="ml-1 mb-0.5 w-3.5 h-3.5 border-border" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Copiado!" : "Clique para copiar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TicketInfoPopover
              data={data}
              effectivePriority={effectivePriority}
              IconComponent={IconComponent}
              iconClass={iconClass}
              open={isPopoverOpen}
              onOpenChange={setIsPopoverOpen}
            >
              <h3 className="text-foreground font-semibold leading-tight transition-colors text-md hover:text-foreground/80 cursor-pointer">
                {data.title}
              </h3>
            </TicketInfoPopover>

            <p
              className={`text-foreground/50 text-xs flex-wrap flex items-center gap-2 ${
                viewMode === "lanes" ? "flex-wrap" : ""
              }`}
            >
              <span className="flex text-left justify-center items-center gap-2 text-muted-foreground">
                {data.clientName}
                <Separator orientation="vertical" className="h-4" />
                <UserInfoPopover data={data} />
              </span>
            </p>

            <div className="flex w-full gap-2 items-center mt-auto">
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
              {viewMode !== "lanes" && viewMode !== "list" && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                  className=" flex text-foreground border border-border bg-background w-9 h-9 hover:bg-accent/10 p-0 ml-auto"
                >
                  <Eye className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Metadados (Atribuição e Tempo) */}
        {viewMode === "list" && (
          <div
            className={`flex items-center flex-wrap mx-auto 2xl:mx-0 2xl:ml-12 justify-center w-full gap-4 
             lg:w-auto mt-2 lg:mt-0 lg:justify-end border-t lg:border-t-0 border-border pt-3 
             lg:pt-0 
            
            `}
          >
            {/* Atribuído a */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-foreground/80 tracking-wider">
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
              ) : (
                <AssignUserPopover data={data} onAssign={handleAssign}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-0 text-muted-foreground hover:text-purple-400 hover:bg-transparent text-xs justify-start gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> Assumir
                  </Button>
                </AssignUserPopover>
              )}
            </div>

            {/* Data e Tempo */}
            <div className="flex flex-col gap-1 min-w-[100px] mb-1">
              <span className="text-[10px] uppercase font-bold text-foreground/80 tracking-wider mb-1">
                Abertura
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                {data.createdAt instanceof Date
                  ? data.createdAt.toLocaleDateString()
                  : data.createdAt}
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        data.messageCount > 0
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{data.messageCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mensagens no chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        data.attachmentCount > 0
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>{data.attachmentCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Anexos/Evidências</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className=" flex text-foreground border border-border bg-background w-9 h-9 hover:bg-accent/10 p-0"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const TicketRowSkeleton: React.FC<{
  viewMode?: "list" | "grid" | "lanes";
}> = ({ viewMode = "list" }) => {
  return (
    <div
      className={`group border border-border relative bg-muted/20 rounded-lg p-4 py-8 mb-3 shadow-sm`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-200 bg-linear-to-b from-gray-400 to-gray-600"></div>
      <div
        className={`flex flex-col items-start gap-4 justify-between h-full ${
          viewMode === "grid" || viewMode === "lanes"
            ? "lg:items-start flex-col"
            : "lg:items-center lg:flex-row"
        }`}
      >
        {/* Coluna 1: Info Principal do Ticket */}
        <div className="flex items-start gap-4 flex-1 w-full">
          {/* Ícone Indicativo de Status/Prioridade */}
          <Skeleton className="mt-1 w-10 h-10 rounded-full border" />

          <div className="flex flex-col space-y-1 w-full">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />

            <div className="flex gap-2 items-center mt-auto">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>

        {/* Coluna 2: Metadados (Atribuição e Tempo) */}
        {viewMode === "list" && (
          <div
            className={`flex items-center flex-wrap justify-center w-full gap-10 
             lg:w-auto mt-2 lg:mt-0 lg:justify-end border-t lg:border-t-0 border-border pt-3 
             lg:pt-0`}
          >
            {/* Atribuído a */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Data e Tempo */}
            <div className="flex flex-col gap-1 min-w-[100px] mb-1">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Métricas Rápidas */}
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
