"use client";
import React from "react";
import {
  MessageSquare,
  Paperclip,
  Clock,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TicketData } from "./types";
import {
  getPriorityStyles,
  getStatusStyles,
  getCategoryIconAndColor,
  getPriorityFromCategory,
  getStatusIconAndColor,
  getStatusBorderColor,
  getPriorityBorderColor,
} from "./helpers";

interface TicketRowProps {
  data: TicketData;
  viewMode?: "list" | "grid" | "lanes";
  onClick?: () => void;
}

export const TicketRow: React.FC<TicketRowProps> = ({ data, viewMode, onClick }) => {
  const isAssigned = !!data.assignedTo;
  const statusIcon = getStatusIconAndColor(data.status);
  const statusBorder = getStatusBorderColor(data.status);
  let IconComponent, iconClass, borderColor, effectivePriority;

  if (statusIcon) {
    IconComponent = statusIcon.icon;
    iconClass = statusIcon.className;
    borderColor = statusBorder;
    // Usar prioridade do ticket quando disponível (especialmente no modo lanes após drag-and-drop)
    effectivePriority = data.priority || getPriorityFromCategory(data.category);
  } else {
    // Usar prioridade do ticket quando disponível, senão derivar da categoria
    effectivePriority = data.priority || getPriorityFromCategory(data.category);
    borderColor = getPriorityBorderColor(effectivePriority);
    const categoryIcon = getCategoryIconAndColor(data.category);
    IconComponent = categoryIcon.icon;
    iconClass = categoryIcon.className;
  }

  return (
    <div
      className={`group border border-border border-l-4 ${borderColor} relative bg-muted/40 hover:bg-muted-foreground/5 rounded-lg p-4 mb-3 transition-all shadow-sm `+(viewMode === "lanes" ? "cursor-grab" : "cursor-pointer")}
      onClick={onClick}
    >
      <div
        className={`flex flex-col items-start gap-4 justify-between ${
          viewMode === "grid" || viewMode === "lanes"
            ? "lg:items-start flex-col"
            : "lg:items-center lg:flex-row"
        }`}
      >
        {/* Coluna 1: Info Principal do Ticket */}
        <div className="flex items-start gap-4 flex-1">
          {/* Ícone Indicativo de Status/Prioridade */}
          <div className={`mt-1 p-2 rounded-full border ${iconClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-foreground/50 text-xs font-mono">
                {data.ticketNumber}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 h-5 border rounded-full ${getPriorityStyles(
                  effectivePriority
                )}`}
              >
                {effectivePriority}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 h-5 border rounded-full ${getStatusStyles(
                  data.status
                )}`}
              >
                {data.status}
              </Badge>
            </div>

            <h3 className="text-foreground font-semibold text-sm md:text-base leading-tight transition-colors ">
              {data.title}
            </h3>

            <p
              className={`text-foreground/50 text-xs flex items-center gap-2 ${
                viewMode === "lanes" ? "flex-wrap" : ""
              }`}
            >
              <span className="flex text-center justify-center items-center gap-2 text-muted-foreground">
                {/* <Avatar className="h-6 w-6 border border-zinc-700">
                  <AvatarFallback className="bg-purple-900 text-purple-200 text-[10px]">
                    {data.assignedTo?.avatarFallback}
                  </AvatarFallback>
                </Avatar> */}
                {data.clientName}
              </span>
              <span>•</span>
              <span className="bg-background px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                {data.module}
              </span>
            </p>


          </div>
          
        </div>

        {/* Coluna 2: Metadados (Atribuição e Tempo) */}
        <div
          className={`flex items-center flex-wrap  mx-auto justify-center w-full gap-4 
             lg:w-auto mt-2 lg:mt-0 lg:justify-end border-t lg:border-t-0 border-border pt-3 
             lg:pt-0 ${viewMode === "grid" ? "lg:gap-8" : "flex-wrap"} ${
            viewMode === "lanes" ? "flex-nowrap  lg:gap-6" : "flex-wrap"
          }`}
        >
          {/* Atribuído a */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-foreground/80 tracking-wider">
              Responsável
            </span>
            {isAssigned ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-zinc-700">
                  <AvatarFallback className="bg-purple-900 text-purple-200 text-[10px]">
                    {data.assignedTo?.avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground text-xs font-medium">
                  {data.assignedTo?.name}
                </span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-0 text-muted-foreground hover:text-purple-400 hover:bg-transparent text-xs justify-start gap-1"
              >
                <UserPlus className="w-3 h-3" /> Assumir
              </Button>
            )}
          </div>

          {/* Data e Tempo */}
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-foreground/80 tracking-wider">
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

          {/* Botão de Ação */}

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-border bg-background text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
